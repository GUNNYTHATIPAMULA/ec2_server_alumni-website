from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.dependencies import get_db
from app.schemas.connection_schema import (
    ConnectionResponseSchema,
    ConnectionDetailsSchema,
    ConnectionUpdateSchema
)
from app.services.connection_service import (
    send_connection_request_service,
    update_connection_request_service,
    list_pending_requests_service,
    list_connections_service
)
from app.core.security import get_current_user
from app.models.user_model import User

router = APIRouter(
    prefix="/connections",
    tags=["Connections"]
)


@router.post(
    "/request/{receiver_id}",
    response_model=ConnectionResponseSchema
)
async def send_connection_request(
    receiver_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:

        return await send_connection_request_service(
            current_user.id,
            receiver_id,
            db
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.patch(
    "/request/{request_id}",
    response_model=ConnectionResponseSchema
)
async def update_connection_request(
    request_id: str,
    data: ConnectionUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:

        return await update_connection_request_service(
            request_id,
            current_user.id,
            data.status,
            db
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get(
    "/pending",
    response_model=List[ConnectionDetailsSchema]
)
async def list_pending_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:

        return await list_pending_requests_service(
            current_user.id,
            db
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get(
    "",
    response_model=List[ConnectionDetailsSchema]
)
async def list_connections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    try:

        return await list_connections_service(
            current_user.id,
            db
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
