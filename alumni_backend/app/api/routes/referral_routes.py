from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.core.roles import UserRole
from app.models.user_model import User
from app.models.referral_model import ReferralRequest
from app.models.admin_model import AdminProfile
from app.models.alumni_model import AlumniProfile
from app.models.student_model import StudentProfile
from app.services.notification_service import create_notification

router = APIRouter(prefix="/referrals", tags=["Referrals"])


async def _user_details(db: AsyncSession, user: User):
    name, image, role = user.username or "Unknown", None, user.role.value if user.role else None
    if user.role == UserRole.ADMIN:
        result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile:
            name = profile.full_name or name
            image = profile.profile_image
    elif user.role == UserRole.ALUMNI:
        result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile:
            name = profile.full_name or name
            image = profile.profile_image
    else:
        result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile:
            name = profile.full_name or name
            image = profile.profile_image
    return {"user_id": str(user.id), "name": name, "image": image, "role": role}


async def _request_payload(db: AsyncSession, req: ReferralRequest):
    requester_result = await db.execute(select(User).where(User.id == req.requester_id))
    requester = requester_result.scalar_one_or_none()
    referee_result = await db.execute(select(User).where(User.id == req.referee_id))
    referee = referee_result.scalar_one_or_none()
    requester_details = await _user_details(db, requester) if requester else {"user_id": str(req.requester_id), "name": "Unknown", "image": None, "role": None}
    referee_details = await _user_details(db, referee) if referee else {"user_id": str(req.referee_id), "name": "Unknown", "image": None, "role": None}
    return {
        "id": str(req.id),
        "requester_id": str(req.requester_id),
        "referee_id": str(req.referee_id),
        "requester": requester_details,
        "referee": referee_details,
        "message": req.message,
        "status": req.status,
        "created_at": req.created_at.isoformat() if req.created_at else None
    }


@router.post("/request/{referee_id}")
async def request_referral(
    referee_id: str, message: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if str(current_user.id) == str(referee_id):
        raise HTTPException(status_code=400, detail="You cannot request a referral from yourself")
    existing = await db.execute(
        select(ReferralRequest).where(
            ReferralRequest.referee_id == referee_id,
            ReferralRequest.requester_id == current_user.id,
            ReferralRequest.status == "pending"
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Referral request already pending")
    req = ReferralRequest(
        requester_id=current_user.id,
        referee_id=referee_id,
        message=message
    )
    db.add(req)
    await db.commit()

    _, requester_name, _, _ = (await _user_details(db, current_user)).values()
    await create_notification(
        db, str(referee_id), "New referral request",
        f"{requester_name} has requested a referral from you.",
        type="referral", link="/alumnidashboard/resources"
    )
    await db.commit()
    return {"message": "Referral request sent"}


@router.get("/requests")
async def get_referral_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ReferralRequest).where(
            (ReferralRequest.referee_id == current_user.id) |
            (ReferralRequest.requester_id == current_user.id)
        ).order_by(ReferralRequest.created_at.desc())
    )
    requests = result.scalars().all()
    return [await _request_payload(db, r) for r in requests]


@router.put("/request/{request_id}")
async def update_referral_request(
    request_id: str, status: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.execute(select(ReferralRequest).where(ReferralRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Referral request not found")
    if str(req.referee_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the requested alumni can respond")
    req.status = status
    await db.commit()

    _, referee_name, _, _ = (await _user_details(db, current_user)).values()
    if status == "accepted":
        await create_notification(
            db, str(req.requester_id), "Referral request accepted",
            f"{referee_name} accepted your referral request.",
            type="referral", link="/alumnidashboard/resources"
        )
    else:
        await create_notification(
            db, str(req.requester_id), "Referral request declined",
            f"{referee_name} declined your referral request.",
            type="referral", link="/alumnidashboard/resources"
        )
    await db.commit()
    return {"message": f"Referral request {status}"}
