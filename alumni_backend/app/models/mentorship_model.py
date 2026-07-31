from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import mapped_column, Mapped
from app.core.database import Base
from app.models.mixins import UUIDMixin, TimestampMixin


class MentorshipRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mentorship_requests"

    mentor_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    mentee_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")


class MentorshipMessage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "mentorship_messages"

    request_id: Mapped[str] = mapped_column(ForeignKey("mentorship_requests.id"))
    sender_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
