# app/models/alumni_model.py

from sqlalchemy import (
    String,
    Integer,
    ForeignKey,
    Boolean
)

from sqlalchemy.orm import (
    mapped_column,
    Mapped,
    relationship
)

from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class AlumniProfile(Base, UUIDMixin, TimestampMixin):

    __tablename__ = "alumni_profiles"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"),
        unique=True
    )

    full_name: Mapped[str] = mapped_column(
        String(255)
    )

    roll_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True
    )

    branch: Mapped[str] = mapped_column(
        String(100)
    )

    degree: Mapped[str] = mapped_column(
        String(100)
    )

    batch_start_year: Mapped[int] = mapped_column(
        Integer
    )

    batch_end_year: Mapped[int] = mapped_column(
        Integer
    )

    occupation: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    company_name: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    current_location: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    linkedin_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )

    github_url: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )

    profile_image: Mapped[str] = mapped_column(
        String(500),
        nullable=True
    )

    bio: Mapped[str] = mapped_column(
        String(1000),
        nullable=True
    )

    mentorship_available: Mapped[bool] = mapped_column(
        Boolean,
        default=False
    )

    user = relationship("User")