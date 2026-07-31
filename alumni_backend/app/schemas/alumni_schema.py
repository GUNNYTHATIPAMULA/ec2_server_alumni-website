from pydantic import BaseModel


class AlumniProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    roll_number: str
    branch: str
    degree: str
    batch_start_year: int
    batch_end_year: int
    occupation: str | None = None
    company_name: str | None = None
    current_location: str | None = None
    address: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    profile_image: str | None = None
    bio: str | None = None
    mentorship_available: bool = False


class AlumniProfileUpdate(BaseModel):
    full_name: str | None = None
    roll_number: str | None = None
    branch: str | None = None
    degree: str | None = None
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
    mentorship_available: bool | None = None


class AlumniListResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    roll_number: str
    branch: str
    batch_start_year: int
    batch_end_year: int
    occupation: str | None = None
    company_name: str | None = None
    current_location: str | None = None
    address: str | None = None
    profile_image: str | None = None
    has_experience: bool = False


class EducationItem(BaseModel):
    id: str
    degree: str | None = None
    institution: str | None = None
    field_of_study: str | None = None
    start_year: int | None = None
    end_year: int | None = None


class ExperienceItem(BaseModel):
    id: str
    company_name: str | None = None
    role: str | None = None
    start_year: int | None = None
    end_year: int | None = None
    description: str | None = None


class SkillItem(BaseModel):
    id: str
    skill_name: str


class AlumniPublicProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    roll_number: str
    branch: str
    degree: str
    batch_start_year: int
    batch_end_year: int
    occupation: str | None = None
    company_name: str | None = None
    current_location: str | None = None
    address: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
    profile_image: str | None = None
    bio: str | None = None
    mentorship_available: bool = False
    email: str | None = None
    username: str | None = None
    skills: list[SkillItem] = []
    education: list[EducationItem] = []
    experience: list[ExperienceItem] = []
    connections_count: int = 0
