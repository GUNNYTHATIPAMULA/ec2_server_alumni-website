from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router
from app.core.database import engine, Base

from app.models.user_model import User
from app.models.admin_model import AdminProfile
from app.models.alumni_model import AlumniProfile
from app.models.student_model import StudentProfile
from app.models.event_model import Event, EventRegistration
from app.models.post_model import Post
from app.models.connection_model import Connection
from app.models.mentorship_model import MentorshipRequest
from app.models.notification_model import Notification

from datetime import datetime, timedelta, timezone
from sqlalchemy import select, and_, text
import os

app = FastAPI(title="College Alumni Platform API", version="1.0.0")
origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
] or [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://16.170.33.58",
    "http://16.170.33.58:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with engine.begin() as conn:
        raw = await conn.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_name='users' AND column_name='email_otp_expiry'"
            )
        )
        if not raw.fetchone():
            await conn.execute(text(
                "ALTER TABLE users ADD COLUMN email_otp_expiry TIMESTAMP"
            ))
            await conn.execute(text(
                "ALTER TABLE users ADD COLUMN phone_otp_expiry TIMESTAMP"
            ))
            await conn.execute(text(
                "UPDATE users SET email_otp_expiry = otp_expiry, phone_otp_expiry = otp_expiry WHERE otp_expiry IS NOT NULL"
            ))
            await conn.execute(text(
                "ALTER TABLE users DROP COLUMN otp_expiry"
            ))
    async with engine.begin() as conn:
        from sqlalchemy.ext.asyncio import AsyncSession
        async_session = AsyncSession(bind=conn)
        cutoff = datetime.utcnow() - timedelta(hours=1)
        result = await async_session.execute(
            select(User).where(
                and_(
                    User.role.is_(None),
                    User.is_verified == False,
                    User.created_at < cutoff
                )
            )
        )
        orphans = result.scalars().all()
        for orphan in orphans:
            await async_session.delete(orphan)
        if orphans:
            await async_session.commit()
        await async_session.close()


app.include_router(router)

from app.core.config import settings
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
async def home():
    return {"message": "Alumni Backend Running"}
