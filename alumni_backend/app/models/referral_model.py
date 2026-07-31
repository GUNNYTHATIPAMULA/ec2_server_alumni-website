from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class ReferralRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "referral_requests"

    requester_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    referee_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
