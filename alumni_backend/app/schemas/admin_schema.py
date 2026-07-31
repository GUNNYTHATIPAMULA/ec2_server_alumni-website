from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AdminProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    designation: str | None = None
    department: str | None = None
    office_email: str | None = None
    profile_image: str | None = None


class AdminProfileUpdate(BaseModel):
    full_name: str | None = None
    designation: str | None = None
    department: str | None = None
    profile_image: str | None = None


class PendingUserResponse(BaseModel):
    user_id: str
    full_name: str | None = None
    email: str
    roll_number: str | None = None
    branch: str | None = None
    batch_start_year: int | None = None
    batch_end_year: int | None = None
    is_verified: bool
    created_at: datetime | None = None


class DashboardStats(BaseModel):
    total_alumni: int
    total_students: int
    total_admins: int
    total_events: int
    total_posts: int
    total_jobs: int = 0
    total_mentorship_requests: int = 0
    pending_approvals: int
    pending_posts: int = 0


class AlumniAdminResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    roll_number: str
    branch: str
    degree: str
    batch_start_year: int | None = None
    batch_end_year: int | None = None
    occupation: str | None = None
    company_name: str | None = None
    email: str
    username: str | None = None
    phone_number: str | None = None
    profile_image: str | None = None
    current_location: str | None = None
    address: str | None = None
    is_verified: bool
    is_active: bool


class AlumniDetailResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    roll_number: str
    branch: str
    degree: str
    batch_start_year: int | None = None
    batch_end_year: int | None = None
    occupation: str | None = None
    company_name: str | None = None
    current_location: str | None = None
    address: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    profile_image: str | None = None
    bio: str | None = None
    mentorship_available: bool = False
    email: str
    phone_number: str | None = None
    username: str
    is_verified: bool
    is_active: bool
    created_at: datetime | None = None


class AdminJobResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    description: str
    requirements: Optional[str] = None
    employment_type: str
    experience_level: Optional[str] = None
    salary_range: Optional[str] = None
    application_deadline: Optional[str] = None
    contact_email: Optional[str] = None
    is_active: bool
    posted_by_id: str
    posted_by_name: Optional[str] = None
    created_at: datetime


class AdminMentorshipResponse(BaseModel):
    id: str
    mentor_id: str
    mentor_name: Optional[str] = None
    mentee_id: str
    mentee_name: Optional[str] = None
    message: Optional[str] = None
    status: str
    created_at: datetime


class AdminPostResponse(BaseModel):
    id: str
    title: str
    content: str
    author_id: str
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    author_image: Optional[str] = None
    author_email: Optional[str] = None
    author_phone: Optional[str] = None
    is_published: bool
    tags: Optional[str] = None
    image_url: Optional[str] = None
    like_count: int
    created_at: datetime


class PostRequestResponse(BaseModel):
    id: str
    title: str
    content: str
    author_id: str
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    author_image: Optional[str] = None
    author_email: Optional[str] = None
    author_phone: Optional[str] = None
    tags: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
