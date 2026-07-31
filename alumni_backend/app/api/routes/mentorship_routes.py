from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.core.roles import UserRole
from app.models.user_model import User
from app.models.mentorship_model import MentorshipRequest, MentorshipMessage
from app.models.admin_model import AdminProfile
from app.models.alumni_model import AlumniProfile
from app.models.student_model import StudentProfile
from app.services.notification_service import create_notification

router = APIRouter(prefix="/mentorship", tags=["Mentorship"])


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


async def _request_payload(db: AsyncSession, req: MentorshipRequest):
    mentor_result = await db.execute(select(User).where(User.id == req.mentor_id))
    mentor = mentor_result.scalar_one_or_none()
    mentee_result = await db.execute(select(User).where(User.id == req.mentee_id))
    mentee = mentee_result.scalar_one_or_none()
    mentor_details = await _user_details(db, mentor) if mentor else {"user_id": str(req.mentor_id), "name": "Unknown", "image": None, "role": None}
    mentee_details = await _user_details(db, mentee) if mentee else {"user_id": str(req.mentee_id), "name": "Unknown", "image": None, "role": None}
    return {
        "id": str(req.id),
        "mentor_id": str(req.mentor_id),
        "mentee_id": str(req.mentee_id),
        "mentor": mentor_details,
        "mentee": mentee_details,
        "message": req.message,
        "status": req.status,
        "created_at": req.created_at.isoformat() if req.created_at else None
    }


@router.post("/request/{mentor_id}")
async def request_mentorship(
    mentor_id: str, message: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if str(current_user.id) == str(mentor_id):
        raise HTTPException(status_code=400, detail="You cannot request mentorship from yourself")
    existing = await db.execute(
        select(MentorshipRequest).where(
            MentorshipRequest.mentor_id == mentor_id,
            MentorshipRequest.mentee_id == current_user.id,
            MentorshipRequest.status == "pending"
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Mentorship request already pending")
    req = MentorshipRequest(mentor_id=mentor_id, mentee_id=current_user.id, message=message)
    db.add(req)
    await db.commit()

    _, mentee_name, _, _ = (await _user_details(db, current_user)).values()
    await create_notification(
        db, str(mentor_id), "New mentorship request",
        f"{mentee_name} has requested you as their mentor.",
        type="mentorship", link="/alumnidashboard/mentorship"
    )
    await db.commit()
    return {"message": "Mentorship request sent"}


@router.get("/requests")
async def get_mentorship_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(MentorshipRequest).where(
            (MentorshipRequest.mentor_id == current_user.id) |
            (MentorshipRequest.mentee_id == current_user.id)
        ).order_by(MentorshipRequest.created_at.desc())
    )
    requests = result.scalars().all()
    return [await _request_payload(db, r) for r in requests]


@router.put("/request/{request_id}")
async def update_mentorship_request(
    request_id: str, status: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.execute(select(MentorshipRequest).where(MentorshipRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if str(req.mentor_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the mentor can respond")
    req.status = status
    await db.commit()

    _, mentor_name, _, _ = (await _user_details(db, current_user)).values()
    if status == "accepted":
        await create_notification(
            db, str(req.mentee_id), "Mentorship request accepted",
            f"{mentor_name} accepted your mentorship request. Start your conversation!",
            type="mentorship", link="/alumnidashboard/mentorship"
        )
    else:
        await create_notification(
            db, str(req.mentee_id), "Mentorship request declined",
            f"{mentor_name} declined your mentorship request.",
            type="mentorship", link="/alumnidashboard/mentorship"
        )
    await db.commit()
    return {"message": f"Mentorship request {status}"}


@router.get("/{request_id}/messages")
async def get_mentorship_messages(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(MentorshipRequest).where(MentorshipRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if not (str(req.mentor_id) == str(current_user.id) or str(req.mentee_id) == str(current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized")
    messages_result = await db.execute(
        select(MentorshipMessage).where(MentorshipMessage.request_id == request_id)
        .order_by(MentorshipMessage.created_at.asc())
    )
    messages = messages_result.scalars().all()
    return [
        {
            "id": str(m.id), "sender_id": str(m.sender_id),
            "content": m.content,
            "created_at": m.created_at.isoformat() if m.created_at else None
        }
        for m in messages
    ]


@router.post("/{request_id}/messages")
async def send_mentorship_message(
    request_id: str, content: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(MentorshipRequest).where(MentorshipRequest.id == request_id))
    req = result.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if not (str(req.mentor_id) == str(current_user.id) or str(req.mentee_id) == str(current_user.id)):
        raise HTTPException(status_code=403, detail="Not authorized")
    if not content or not content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    msg = MentorshipMessage(
        request_id=request_id,
        sender_id=current_user.id,
        content=content.strip()
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return {
        "id": str(msg.id), "sender_id": str(msg.sender_id),
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None
    }
