from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped


def _utcnow():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class UUIDMixin:

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )


class TimestampMixin:

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=_utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=_utcnow,
        onupdate=_utcnow
    )