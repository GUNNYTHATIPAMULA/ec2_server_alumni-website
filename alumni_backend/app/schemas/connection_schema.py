from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class ConnectionResponseSchema(BaseModel):

    id: UUID

    sender_id: UUID

    receiver_id: UUID

    status: str

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True


class ConnectionDetailsSchema(BaseModel):

    id: UUID

    sender_id: UUID

    receiver_id: UUID

    status: str

    created_at: datetime

    updated_at: datetime

    other_user_id: UUID | None = None

    full_name: str | None = None

    profile_image: str | None = None

    occupation: str | None = None

    company_name: str | None = None

    branch: str | None = None

    batch_end_year: int | None = None


class ConnectionUpdateSchema(BaseModel):

    status: str  # accepted or rejected
