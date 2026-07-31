from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.connection_model import Connection
from app.models.user_model import User
from app.models.alumni_model import AlumniProfile
from app.services.notification_service import create_notification


async def _enrich(connection: Connection, current_user_id: str, db: AsyncSession):
    other_id = (
        str(connection.receiver_id)
        if str(connection.sender_id) == str(current_user_id)
        else str(connection.sender_id)
    )
    other_user = await db.execute(select(User).where(User.id == other_id))
    other_user = other_user.scalar_one_or_none()
    full_name, profile_image, occupation, company_name, branch, batch_end_year = None, None, None, None, None, None
    if other_user:
        profile_result = await db.execute(
            select(AlumniProfile).where(AlumniProfile.user_id == other_user.id)
        )
        profile = profile_result.scalar_one_or_none()
        if profile:
            full_name = profile.full_name
            profile_image = profile.profile_image
            occupation = profile.occupation
            company_name = profile.company_name
            branch = profile.branch
            batch_end_year = profile.batch_end_year
        if not full_name:
            full_name = other_user.username
    return {
        "id": str(connection.id),
        "sender_id": str(connection.sender_id),
        "receiver_id": str(connection.receiver_id),
        "status": connection.status,
        "created_at": connection.created_at,
        "updated_at": connection.updated_at,
        "other_user_id": other_id,
        "full_name": full_name,
        "profile_image": profile_image,
        "occupation": occupation,
        "company_name": company_name,
        "branch": branch,
        "batch_end_year": batch_end_year,
    }


async def send_connection_request_service(
    sender_id: str,
    receiver_id: str,
    db: AsyncSession
):

    if sender_id == receiver_id:

        raise Exception(
            "Cannot connect to yourself"
        )

    # Check if receiver exists

    rec_result = await db.execute(
        select(User).where(User.id == receiver_id)
    )

    receiver = rec_result.scalar_one_or_none()

    if not receiver:

        raise Exception("Receiver user not found")

    # Check for existing connection request

    conn_result = await db.execute(
        select(Connection).where(
            or_(
                and_(
                    Connection.sender_id == sender_id,
                    Connection.receiver_id == receiver_id
                ),
                and_(
                    Connection.sender_id == receiver_id,
                    Connection.receiver_id == sender_id
                )
            )
        )
    )

    existing = conn_result.scalar_one_or_none()

    if existing:

        if existing.status == "accepted":

            raise Exception(
                "You are already connected"
            )

        else:

            raise Exception(
                f"Connection request already exists in state: {existing.status}"
            )

    new_connection = Connection(
        sender_id=sender_id,
        receiver_id=receiver_id,
        status="pending"
    )

    db.add(new_connection)

    sender_result = await db.execute(select(User).where(User.id == sender_id))
    sender = sender_result.scalar_one_or_none()
    sender_name = sender.username if sender else "Someone"
    if sender:
        sender_profile = await db.execute(
            select(AlumniProfile).where(AlumniProfile.user_id == sender.id)
        )
        sp = sender_profile.scalar_one_or_none()
        if sp:
            sender_name = sp.full_name

    await create_notification(
        db, str(receiver_id), "New connection request",
        f"{sender_name} wants to connect with you.",
        type="connection_request", link="/alumnidashboard/spotlights"
    )

    await db.commit()

    await db.refresh(new_connection)

    return new_connection


async def update_connection_request_service(
    request_id: str,
    current_user_id: str,
    status: str,
    db: AsyncSession
):

    if status not in ["accepted", "rejected"]:

        raise Exception(
            "Invalid status value. Use 'accepted' or 'rejected'."
        )

    result = await db.execute(
        select(Connection).where(
            Connection.id == request_id
        )
    )

    connection = result.scalar_one_or_none()

    if not connection:

        raise Exception(
            "Connection request not found"
        )

    # Verify current user is the receiver

    if str(connection.receiver_id) != str(
        current_user_id
    ):

        raise Exception(
            "You are not authorized to respond to this request"
        )

    connection.status = status

    if status == "accepted":
        sender_result = await db.execute(select(User).where(User.id == connection.sender_id))
        sender = sender_result.scalar_one_or_none()
        sender_name = sender.username if sender else "Someone"
        if sender:
            sender_profile = await db.execute(
                select(AlumniProfile).where(AlumniProfile.user_id == sender.id)
            )
            sp = sender_profile.scalar_one_or_none()
            if sp:
                sender_name = sp.full_name
        await create_notification(
            db, str(connection.sender_id), "Connection accepted",
            f"{sender_name} accepted your connection request. You are now connected.",
            type="connection_accepted", link="/alumnidashboard/profile"
        )

    await db.commit()

    await db.refresh(connection)

    return connection


async def list_pending_requests_service(
    user_id: str,
    db: AsyncSession
):

    result = await db.execute(
        select(Connection)
        .where(
            (Connection.receiver_id == user_id) &
            (Connection.status == "pending")
        )
        .order_by(Connection.created_at.desc())
    )

    connections = result.scalars().all()

    return [await _enrich(c, user_id, db) for c in connections]


async def list_connections_service(
    user_id: str,
    db: AsyncSession
):

    result = await db.execute(
        select(Connection)
        .where(
            (
                (Connection.sender_id == user_id) |
                (Connection.receiver_id == user_id)
            ) & (Connection.status == "accepted")
        )
        .order_by(Connection.created_at.desc())
    )

    connections = result.scalars().all()

    return [await _enrich(c, user_id, db) for c in connections]
