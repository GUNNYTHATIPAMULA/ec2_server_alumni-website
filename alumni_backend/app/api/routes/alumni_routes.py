from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.core.roles import UserRole
from app.schemas.alumni_schema import (
    AlumniProfileResponse, AlumniProfileUpdate, AlumniListResponse,
    AlumniPublicProfileResponse, EducationItem, ExperienceItem, SkillItem
)
from app.models.user_model import User
from app.models.alumni_model import AlumniProfile
from app.models.alumni_experience_model import AlumniExperience
from app.models.alumni_education_model import AlumniEducation
from app.models.alumni_skill_model import AlumniSkill
from app.models.connection_model import Connection

router = APIRouter(prefix="/alumni", tags=["Alumni"])


@router.get("/profile", response_model=AlumniProfileResponse)
async def get_profile(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(status_code=403, detail="Alumni access required")
    result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return AlumniProfileResponse(
        id=str(profile.id), user_id=str(profile.user_id), full_name=profile.full_name,
        roll_number=profile.roll_number, branch=profile.branch, degree=profile.degree,
        batch_start_year=profile.batch_start_year, batch_end_year=profile.batch_end_year,
        occupation=profile.occupation, company_name=profile.company_name,
        current_location=profile.current_location, address=profile.address,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url, profile_image=profile.profile_image,
        bio=profile.bio, mentorship_available=profile.mentorship_available
    )


@router.put("/profile", response_model=AlumniProfileResponse)
async def update_profile(data: AlumniProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != UserRole.ALUMNI:
        raise HTTPException(status_code=403, detail="Alumni access required")
    result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == current_user.id))
    profile = result.scalar_one_or_none()

    update_data = data.model_dump(exclude_unset=True)

    if not profile:
        required = ["full_name", "roll_number", "branch", "degree", "batch_start_year", "batch_end_year"]
        missing = [f for f in required if f not in update_data]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required fields for profile creation: {', '.join(missing)}")
        profile = AlumniProfile(user_id=current_user.id, **update_data)
        db.add(profile)
    else:
        for field, value in update_data.items():
            setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return AlumniProfileResponse(
        id=str(profile.id), user_id=str(profile.user_id), full_name=profile.full_name,
        roll_number=profile.roll_number, branch=profile.branch, degree=profile.degree,
        batch_start_year=profile.batch_start_year, batch_end_year=profile.batch_end_year,
        occupation=profile.occupation, company_name=profile.company_name,
        current_location=profile.current_location, address=profile.address,
        linkedin_url=profile.linkedin_url,
        github_url=profile.github_url, profile_image=profile.profile_image,
        bio=profile.bio, mentorship_available=profile.mentorship_available
    )


@router.get("/directory", response_model=List[AlumniListResponse])
async def get_alumni_directory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlumniProfile).order_by(AlumniProfile.full_name)
    )
    profiles = result.scalars().all()

    alumni_ids = [str(p.id) for p in profiles]
    if alumni_ids:
        exp_result = await db.execute(
            select(AlumniExperience.alumni_id).where(
                AlumniExperience.alumni_id.in_(alumni_ids)
            ).distinct()
        )
        alumni_with_experience = {str(row[0]) for row in exp_result.fetchall()}
    else:
        alumni_with_experience = set()

    return [
        AlumniListResponse(
            id=str(p.id), user_id=str(p.user_id), full_name=p.full_name, roll_number=p.roll_number,
            branch=p.branch, batch_start_year=p.batch_start_year, batch_end_year=p.batch_end_year,
            occupation=p.occupation, company_name=p.company_name, profile_image=p.profile_image,
            current_location=p.current_location, address=p.address,
            has_experience=str(p.id) in alumni_with_experience
        )
        for p in profiles
    ]


@router.get("/{user_id}", response_model=AlumniPublicProfileResponse)
async def get_alumni_by_id(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Alumni not found")

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    skills_result = await db.execute(
        select(AlumniSkill).where(AlumniSkill.alumni_id == profile.id)
    )
    skills = [
        SkillItem(id=str(s.id), skill_name=s.skill_name)
        for s in skills_result.scalars().all()
    ]

    edu_result = await db.execute(
        select(AlumniEducation).where(AlumniEducation.alumni_id == profile.id)
    )
    education = [
        EducationItem(
            id=str(e.id), degree=e.degree, institution=e.institution,
            field_of_study=e.field_of_study, start_year=e.start_year, end_year=e.end_year
        )
        for e in edu_result.scalars().all()
    ]

    exp_result = await db.execute(
        select(AlumniExperience).where(AlumniExperience.alumni_id == profile.id)
    )
    experience = [
        ExperienceItem(
            id=str(x.id), company_name=x.company_name, role=x.role,
            start_year=x.start_year, end_year=x.end_year, description=x.description
        )
        for x in exp_result.scalars().all()
    ]

    conn_result = await db.execute(
        select(func.count(Connection.id)).where(
            ((Connection.sender_id == user_id) | (Connection.receiver_id == user_id))
            & (Connection.status == "accepted")
        )
    )
    connections_count = conn_result.scalar() or 0

    return AlumniPublicProfileResponse(
        id=str(profile.id), user_id=str(profile.user_id), full_name=profile.full_name,
        roll_number=profile.roll_number, branch=profile.branch, degree=profile.degree,
        batch_start_year=profile.batch_start_year, batch_end_year=profile.batch_end_year,
        occupation=profile.occupation, company_name=profile.company_name,
        current_location=profile.current_location, address=profile.address,
        linkedin_url=profile.linkedin_url, github_url=profile.github_url,
        profile_image=profile.profile_image, bio=profile.bio,
        mentorship_available=profile.mentorship_available,
        email=user.email if user else None, username=user.username if user else None,
        skills=skills, education=education, experience=experience,
        connections_count=connections_count
    )
