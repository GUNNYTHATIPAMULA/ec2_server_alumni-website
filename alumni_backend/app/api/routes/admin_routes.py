from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.core.roles import UserRole
from app.schemas.admin_schema import (
    AdminProfileResponse, AdminProfileUpdate, PendingUserResponse,
    DashboardStats, AlumniAdminResponse, AlumniDetailResponse,
    AdminJobResponse, AdminMentorshipResponse, AdminPostResponse,
    PostRequestResponse
)
from app.services.notification_service import create_notification
from app.schemas.job_schema import CreateJobSchema
from app.models.user_model import User
from app.models.admin_model import AdminProfile
from app.models.alumni_model import AlumniProfile
from app.models.student_model import StudentProfile
from app.models.event_model import Event
from app.models.post_model import Post
from app.models.job_model import Job
from app.models.mentorship_model import MentorshipRequest

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/profile", response_model=AdminProfileResponse)
async def get_admin_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return AdminProfileResponse(
        id=str(profile.id), user_id=str(profile.user_id), full_name=profile.full_name,
        designation=profile.designation, department=profile.department,
        office_email=profile.office_email, profile_image=profile.profile_image
    )


@router.put("/profile", response_model=AdminProfileResponse)
async def update_admin_profile(data: AdminProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return AdminProfileResponse(
        id=str(profile.id), user_id=str(profile.user_id), full_name=profile.full_name,
        designation=profile.designation, department=profile.department,
        office_email=profile.office_email, profile_image=profile.profile_image
    )


@router.get("/dashboard", response_model=DashboardStats)
async def get_admin_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    alumni_count = (await db.execute(select(func.count(AlumniProfile.id)))).scalar()
    student_count = (await db.execute(select(func.count(StudentProfile.id)))).scalar()
    admin_count = (await db.execute(select(func.count(AdminProfile.id)))).scalar()
    event_count = (await db.execute(select(func.count(Event.id)))).scalar()
    post_count = (await db.execute(select(func.count(Post.id)))).scalar()
    job_count = (await db.execute(select(func.count(Job.id)))).scalar()
    mentorship_count = (await db.execute(select(func.count(MentorshipRequest.id)))).scalar()
    pending = (await db.execute(select(func.count(User.id)).where(User.is_verified == False))).scalar()
    pending_posts = (await db.execute(select(func.count(Post.id)).where(Post.is_published == False))).scalar()
    return DashboardStats(
        total_alumni=alumni_count or 0, total_students=student_count or 0,
        total_admins=admin_count or 0, total_events=event_count or 0,
        total_posts=post_count or 0, total_jobs=job_count or 0,
        total_mentorship_requests=mentorship_count or 0, pending_approvals=pending or 0,
        pending_posts=pending_posts or 0
    )


@router.get("/pending-users", response_model=List[PendingUserResponse])
async def get_pending_users(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(AlumniProfile, User).join(User, AlumniProfile.user_id == User.id)
        .where(User.is_verified == False).order_by(User.created_at.desc())
    )
    rows = result.all()
    return [
        PendingUserResponse(
            user_id=str(a.AlumniProfile.user_id), full_name=str(a.AlumniProfile.full_name or ''),
            email=str(a.User.email), roll_number=str(a.AlumniProfile.roll_number or ''),
            branch=str(a.AlumniProfile.branch or ''), batch_start_year=a.AlumniProfile.batch_start_year,
            batch_end_year=a.AlumniProfile.batch_end_year, is_verified=bool(a.User.is_verified),
            created_at=a.User.created_at
        )
        for a in rows
    ]


@router.put("/verify-user/{user_id}")
async def verify_user(user_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    await db.commit()
    return {"message": "User verified successfully"}


@router.get("/alumni", response_model=List[AlumniAdminResponse])
async def list_all_alumni(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(AlumniProfile, User).join(User, AlumniProfile.user_id == User.id).order_by(AlumniProfile.full_name)
    )
    rows = result.all()
    return [
        AlumniAdminResponse(
            id=str(a.AlumniProfile.id), user_id=str(a.AlumniProfile.user_id),
            full_name=a.AlumniProfile.full_name, roll_number=a.AlumniProfile.roll_number,
            branch=a.AlumniProfile.branch, degree=a.AlumniProfile.degree,
            batch_start_year=a.AlumniProfile.batch_start_year, batch_end_year=a.AlumniProfile.batch_end_year,
            occupation=a.AlumniProfile.occupation, company_name=a.AlumniProfile.company_name,
            email=a.User.email, username=a.User.username, phone_number=a.User.phone_number,
            profile_image=a.AlumniProfile.profile_image, current_location=a.AlumniProfile.current_location,
            address=a.AlumniProfile.address,
            is_verified=a.User.is_verified, is_active=a.User.is_active
        )
        for a in rows
    ]


@router.get("/alumni/{user_id}", response_model=AlumniDetailResponse)
async def get_alumni_detail(user_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(AlumniProfile, User).join(User, AlumniProfile.user_id == User.id)
        .where(AlumniProfile.user_id == user_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Alumni not found")
    a, u = row
    return AlumniDetailResponse(
        id=str(a.id), user_id=str(a.user_id), full_name=a.full_name,
        roll_number=a.roll_number, branch=a.branch, degree=a.degree,
        batch_start_year=a.batch_start_year, batch_end_year=a.batch_end_year,
        occupation=a.occupation, company_name=a.company_name,
        current_location=a.current_location, address=a.address,
        linkedin_url=a.linkedin_url,
        github_url=a.github_url, profile_image=a.profile_image, bio=a.bio,
        mentorship_available=a.mentorship_available, email=u.email,
        phone_number=u.phone_number, username=u.username,
        is_verified=u.is_verified, is_active=u.is_active, created_at=u.created_at
    )


@router.patch("/block-user/{user_id}")
async def toggle_block_user(user_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    await db.commit()
    return {"is_active": user.is_active, "message": f"User {'unblocked' if user.is_active else 'blocked'} successfully"}


@router.get("/jobs", response_model=List[AdminJobResponse])
async def admin_list_jobs(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(Job, User).join(User, Job.posted_by_id == User.id).order_by(Job.created_at.desc())
    )
    rows = result.all()
    return [
        AdminJobResponse(
            id=str(j.id), title=j.title, company=j.company, location=j.location,
            description=j.description, requirements=j.requirements,
            employment_type=j.employment_type, experience_level=j.experience_level,
            salary_range=j.salary_range, application_deadline=j.application_deadline,
            contact_email=j.contact_email, is_active=j.is_active,
            posted_by_id=str(j.posted_by_id), posted_by_name=u.username,
            created_at=j.created_at
        )
        for j, u in rows
    ]


@router.post("/jobs", response_model=AdminJobResponse)
async def admin_create_job(data: CreateJobSchema, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    job = Job(**data.model_dump(), posted_by_id=current_user.id)
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return AdminJobResponse(
        id=str(job.id), title=job.title, company=job.company, location=job.location,
        description=job.description, requirements=job.requirements,
        employment_type=job.employment_type, experience_level=job.experience_level,
        salary_range=job.salary_range, application_deadline=job.application_deadline,
        contact_email=job.contact_email, is_active=job.is_active,
        posted_by_id=str(job.posted_by_id), posted_by_name=current_user.username,
        created_at=job.created_at
    )


@router.delete("/jobs/{job_id}")
async def admin_delete_job(job_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    await db.delete(job)
    await db.commit()
    return {"message": "Job deleted successfully"}


@router.get("/mentorship", response_model=List[AdminMentorshipResponse])
async def admin_list_mentorship(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(MentorshipRequest).order_by(MentorshipRequest.created_at.desc())
    )
    requests = result.scalars().all()
    result_data = []
    for r in requests:
        mentor = await db.execute(select(User).where(User.id == r.mentor_id))
        mentor_user = mentor.scalar_one_or_none()
        mentee = await db.execute(select(User).where(User.id == r.mentee_id))
        mentee_user = mentee.scalar_one_or_none()
        result_data.append(AdminMentorshipResponse(
            id=str(r.id), mentor_id=str(r.mentor_id),
            mentor_name=mentor_user.username if mentor_user else None,
            mentee_id=str(r.mentee_id),
            mentee_name=mentee_user.username if mentee_user else None,
            message=r.message, status=r.status, created_at=r.created_at
        ))
    return result_data


async def _admin_post_payload(post: Post, db: AsyncSession):
    author_result = await db.execute(select(User).where(User.id == post.author_id))
    author = author_result.scalar_one_or_none()
    author_name, author_role, author_image, author_email, author_phone = None, None, None, None, None
    if author:
        author_role = author.role.value if author.role else None
        author_email = author.email
        author_phone = author.phone_number
        if author.role == UserRole.ADMIN:
            prof_result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == author.id))
            prof = prof_result.scalar_one_or_none()
            author_name = prof.full_name if prof else author.username
            author_image = prof.profile_image if prof else None
        elif author.role == UserRole.ALUMNI:
            prof_result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == author.id))
            prof = prof_result.scalar_one_or_none()
            author_name = prof.full_name if prof else author.username
            author_image = prof.profile_image if prof else None
        else:
            author_name = author.username
    return {
        "id": str(post.id), "title": post.title, "content": post.content,
        "author_id": str(post.author_id), "author_name": author_name,
        "author_role": author_role, "author_image": author_image,
        "author_email": author_email, "author_phone": author_phone,
        "is_published": post.is_published, "tags": post.tags,
        "image_url": post.image_url, "like_count": post.like_count,
        "created_at": post.created_at
    }


@router.get("/posts", response_model=List[AdminPostResponse])
async def admin_list_posts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(Post, User).join(User, Post.author_id == User.id).order_by(Post.created_at.desc())
    )
    rows = result.all()
    return [await _admin_post_payload(p, db) for p, u in rows]


@router.get("/posts/pending", response_model=List[PostRequestResponse])
async def admin_list_pending_posts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(
        select(Post).where(Post.is_published == False).order_by(Post.created_at.desc())
    )
    posts = result.scalars().all()
    payloads = []
    for post in posts:
        payload = await _admin_post_payload(post, db)
        payload["is_published"] = False
        payloads.append(payload)
    return payloads


@router.put("/posts/{post_id}/approve")
async def admin_approve_post(post_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.is_published = True
    await db.commit()
    await create_notification(
        db, str(post.author_id), "Post approved",
        f"Your post '{post.title}' has been approved and is now visible to everyone.",
        type="post_approved", link="/alumnidashboard/posts"
    )
    await db.commit()
    return {"message": "Post approved and published"}


@router.delete("/posts/{post_id}")
async def admin_delete_post(post_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()
    return {"message": "Post deleted successfully"}
