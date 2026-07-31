from sqlalchemy.ext.asyncio import AsyncSession
from app.models.notification_model import Notification


async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    type: str = "info",
    link: str = None,
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        link=link,
    )
    db.add(notification)
    return notification
