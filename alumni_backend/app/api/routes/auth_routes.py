from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.security import create_access_token, get_current_user
from app.core.roles import UserRole
from app.utils.password_utils import hash_password, verify_password
from app.utils.otp_utils import generate_otp
from app.utils.email_utils import send_email_otp
from app.schemas.auth_schema import (
    AdminRegisterSchema, AlumniRegisterSchema, StudentRegisterSchema,
    LoginSchema, TokenResponse, SendEmailOtpSchema, VerifyEmailOtpSchema,
    SendPhoneOtpSchema, VerifyPhoneOtpSchema
)
from app.models.user_model import User
from app.models.admin_model import AdminProfile
from app.models.alumni_model import AlumniProfile
from app.models.student_model import StudentProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/send-email-otp")
async def send_email_otp_endpoint(data: SendEmailOtpSchema, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    user = existing.scalar_one_or_none()
    if user and user.is_verified:
        raise HTTPException(status_code=400, detail="Email already registered")
    otp = generate_otp()
    if not user and data.phone_number:
        phone_existing = await db.execute(select(User).where(User.phone_number == data.phone_number))
        phone_user = phone_existing.scalar_one_or_none()
        if phone_user and not phone_user.is_verified:
            phone_user.email = data.email
            phone_user.email_otp = otp
            phone_user.email_otp_expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5)
            await db.commit()
            await send_email_otp(data.email, otp)
            return {"message": "OTP sent to email"}
    if not user:
        user = User(username=data.email, email=data.email, email_otp=otp, email_otp_expiry=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5))
        db.add(user)
    else:
        user.email_otp = otp
        user.email_otp_expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5)
    await db.commit()
    await send_email_otp(data.email, otp)
    return {"message": "OTP sent to email"}


@router.post("/verify-email-otp")
async def verify_email_otp_endpoint(data: VerifyEmailOtpSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not user.email_otp:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")
    if user.email_otp_expiry and datetime.utcnow() > user.email_otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if user.email_otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user.email_verified = True
    user.email_otp = None
    await db.commit()
    return {"message": "Email verified successfully"}


@router.post("/send-phone-otp")
async def send_phone_otp_endpoint(data: SendPhoneOtpSchema, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.phone_number == data.phone_number))
    user = existing.scalar_one_or_none()
    if user and user.is_verified:
        raise HTTPException(status_code=400, detail="Phone already registered")
    otp = "123456"
    if not user and data.email:
        email_existing = await db.execute(select(User).where(User.email == data.email))
        email_user = email_existing.scalar_one_or_none()
        if email_user and not email_user.is_verified:
            email_user.phone_number = data.phone_number
            email_user.phone_otp = otp
            email_user.phone_otp_expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5)
            await db.commit()
            return {"message": "OTP sent to phone"}
    if not user:
        user = User(phone_number=data.phone_number, phone_otp=otp, phone_otp_expiry=datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5))
        db.add(user)
    else:
        user.phone_otp = otp
        user.phone_otp_expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=5)
    await db.commit()
    return {"message": "OTP sent to phone"}


@router.post("/verify-phone-otp")
async def verify_phone_otp_endpoint(data: VerifyPhoneOtpSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.phone_number == data.phone_number))
    user = result.scalar_one_or_none()
    if not user or not user.phone_otp:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")
    if user.phone_otp_expiry and datetime.utcnow() > user.phone_otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if user.phone_otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user.phone_verified = True
    user.phone_otp = None
    await db.commit()
    return {"message": "Phone verified successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginSchema, response: Response, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(or_(User.username == data.username, User.email == data.username))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Account not verified. Please wait for admin approval.")

    full_name = None
    if user.role == UserRole.ADMIN:
        profile_result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == user.id))
        profile = profile_result.scalar_one_or_none()
        full_name = profile.full_name if profile else None
    elif user.role == UserRole.ALUMNI:
        profile_result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == user.id))
        profile = profile_result.scalar_one_or_none()
        full_name = profile.full_name if profile else None
    elif user.role == UserRole.STUDENT:
        profile_result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        profile = profile_result.scalar_one_or_none()
        full_name = profile.full_name if profile else None

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    max_age = 7 * 24 * 60 * 60
    response.set_cookie(
        key="token", value=token, max_age=max_age, expires=max_age,
        path="/", httponly=False, samesite="lax"
    )
    response.set_cookie(
        key="role", value=user.role.value, max_age=max_age, expires=max_age,
        path="/", httponly=False, samesite="lax"
    )
    response.set_cookie(
        key="userId", value=str(user.id), max_age=max_age, expires=max_age,
        path="/", httponly=False, samesite="lax"
    )
    response.set_cookie(
        key="fullName", value=full_name or "", max_age=max_age, expires=max_age,
        path="/", httponly=False, samesite="lax"
    )
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        role=user.role.value,
        full_name=full_name
    )


@router.post("/register-admin")
async def register_admin(data: AdminRegisterSchema, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where((User.email == data.email) | (User.username == data.username)))
    existing_users = existing.scalars().all()
    verified_users = [u for u in existing_users if u.is_verified]
    if verified_users:
        raise HTTPException(status_code=400, detail="Email or username already exists")

    email_user = next((u for u in existing_users if u.email == data.email and u.email_verified), None)
    if not email_user:
        raise HTTPException(status_code=400, detail="Email not verified. Please verify your email first.")

    user = email_user
    user.username = data.username
    user.hashed_password = hash_password(data.password)
    user.phone_number = data.phone_number
    user.role = UserRole.ADMIN
    user.is_verified = True
    await db.flush()
    profile = AdminProfile(user_id=user.id, full_name=data.full_name, designation=data.designation, department=data.department)
    db.add(profile)
    await db.commit()
    return {"message": "Admin registered successfully. Please login."}


@router.post("/register-alumni")
async def register_alumni(data: AlumniRegisterSchema, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(
        (User.email == data.email) | (User.username == data.username) | (User.phone_number == data.phone_number)
    ))
    existing_users = existing.scalars().all()
    verified_users = [u for u in existing_users if u.is_verified]
    if verified_users:
        raise HTTPException(status_code=400, detail="Email, username, or phone already registered")

    email_user = next((u for u in existing_users if u.email == data.email and u.email_verified), None)
    if not email_user:
        raise HTTPException(status_code=400, detail="Email not verified. Please verify your email first.")

    phone_user = next((u for u in existing_users if u.phone_number == data.phone_number and u.phone_verified), None)
    if not phone_user:
        raise HTTPException(status_code=400, detail="Phone not verified. Please verify your phone first.")

    base_user = email_user
    base_user.username = data.username
    base_user.hashed_password = hash_password(data.password)
    base_user.role = UserRole.ALUMNI
    base_user.is_verified = False
    base_user.email_verified = True
    base_user.phone_verified = True
    if email_user.id != phone_user.id:
        await db.delete(phone_user)
        await db.flush()
        base_user.phone_number = data.phone_number

    await db.flush()

    profile = AlumniProfile(
        user_id=base_user.id, full_name=data.full_name, roll_number=data.roll_number,
        branch=data.branch, degree=data.degree, batch_start_year=data.batch_start_year,
        batch_end_year=data.batch_end_year, occupation=data.occupation, company_name=data.company_name,
        current_location=data.current_location, address=data.address,
        profile_image=data.profile_image
    )
    db.add(profile)

    await db.commit()
    return {"message": "Alumni registered successfully"}


@router.post("/register-student")
async def register_student(data: StudentRegisterSchema, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where((User.email == data.email) | (User.username == data.username)))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email or username already exists")
    user = User(
        username=data.username, email=data.email, phone_number=data.phone_number,
        hashed_password=hash_password(data.password), role=UserRole.STUDENT, is_verified=False
    )
    db.add(user)
    await db.flush()
    profile = StudentProfile(
        user_id=user.id, full_name=data.full_name, roll_number=data.roll_number,
        branch=data.branch, degree=data.degree, batch_start_year=data.batch_start_year,
        batch_end_year=data.batch_end_year, current_semester=data.current_semester
    )
    db.add(profile)
    await db.commit()
    return {"message": "Student registered successfully. Awaiting admin approval."}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified
    }
