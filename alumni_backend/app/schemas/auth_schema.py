from pydantic import BaseModel, EmailStr, Field, field_validator


class AdminRegisterSchema(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    phone_number: str = Field(pattern=r"^\d{10}$")
    password: str = Field(min_length=6, max_length=32)
    designation: str | None = None
    department: str | None = None


class AlumniRegisterSchema(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    phone_number: str = Field(pattern=r"^\d{10}$")
    password: str = Field(min_length=6, max_length=32)
    roll_number: str
    branch: str
    degree: str
    batch_start_year: int
    batch_end_year: int
    occupation: str | None = None
    company_name: str | None = None
    current_location: str | None = None
    address: str | None = None
    profile_image: str | None = None

    @field_validator("batch_end_year")
    @classmethod
    def batch_end_after_start(cls, v, info):
        start = info.data.get("batch_start_year")
        if start is not None and v < start:
            raise ValueError("Batch ending year must be greater than or equal to batch starting year")
        return v


class StudentRegisterSchema(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    phone_number: str = Field(pattern=r"^\d{10}$")
    password: str = Field(min_length=6, max_length=32)
    roll_number: str
    branch: str
    degree: str
    batch_start_year: int
    batch_end_year: int
    current_semester: int | None = None

    @field_validator("batch_end_year")
    @classmethod
    def batch_end_after_start(cls, v, info):
        start = info.data.get("batch_start_year")
        if start is not None and v < start:
            raise ValueError("Batch ending year must be greater than or equal to batch starting year")
        return v


class LoginSchema(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    full_name: str | None = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    is_active: bool
    is_verified: bool


class SendEmailOtpSchema(BaseModel):
    email: EmailStr
    phone_number: str | None = None


class VerifyEmailOtpSchema(BaseModel):
    email: EmailStr
    otp: str


class SendPhoneOtpSchema(BaseModel):
    phone_number: str
    email: str | None = None


class VerifyPhoneOtpSchema(BaseModel):
    phone_number: str
    otp: str
