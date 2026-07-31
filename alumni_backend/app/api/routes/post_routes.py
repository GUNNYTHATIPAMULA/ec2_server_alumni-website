from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.core.roles import UserRole
from app.models.user_model import User
from app.models.post_model import Post
from app.models.admin_model import AdminProfile
from app.models.alumni_model import AlumniProfile
from app.models.student_model import StudentProfile
from app.services.notification_service import create_notification

router = APIRouter(prefix="/posts", tags=["Posts"])


async def _author_info(db: AsyncSession, user: User):
    if user.role == UserRole.ADMIN:
        result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile:
            return str(user.id), profile.full_name, profile.profile_image, user.role.value
        return str(user.id), user.username, None, user.role.value
    if user.role == UserRole.ALUMNI:
        result = await db.execute(select(AlumniProfile).where(AlumniProfile.user_id == user.id))
        profile = result.scalar_one_or_none()
        if profile:
            return str(user.id), profile.full_name, profile.profile_image, user.role.value
        return str(user.id), user.username, None, user.role.value
    result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
    profile = result.scalar_one_or_none()
    if profile:
        return str(user.id), profile.full_name, profile.profile_image, user.role.value
    return str(user.id), user.username, None, user.role.value


async def _post_payload(post: Post, db: AsyncSession):
    author_result = await db.execute(select(User).where(User.id == post.author_id))
    author = author_result.scalar_one_or_none()
    author_name, author_image, author_role = post.author_id, None, None
    if author:
        _, author_name, author_image, author_role = await _author_info(db, author)
    return {
        "id": str(post.id), "title": post.title, "content": post.content,
        "author_id": str(post.author_id), "author_name": author_name,
        "author_image": author_image, "author_role": author_role,
        "is_published": post.is_published, "tags": post.tags,
        "image_url": post.image_url, "like_count": post.like_count,
        "created_at": post.created_at.isoformat()
    }


@router.get("")
async def list_posts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.is_published == True).order_by(Post.created_at.desc()))
    posts = result.scalars().all()
    return [await _post_payload(p, db) for p in posts]


@router.get("/my")
async def list_my_posts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post).where(Post.author_id == current_user.id).order_by(Post.created_at.desc())
    )
    posts = result.scalars().all()
    return [await _post_payload(p, db) for p in posts]


@router.post("")
async def create_post(
    title: str, content: str, tags: str = None, image_url: str = None,
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    auto_publish = current_user.role == UserRole.ADMIN
    post = Post(
        title=title, content=content, tags=tags, image_url=image_url,
        author_id=current_user.id, is_published=auto_publish
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    if not auto_publish:
        _, author_name, _, _ = await _author_info(db, current_user)
        admin_result = await db.execute(select(User).where(User.role == UserRole.ADMIN))
        admins = admin_result.scalars().all()
        for admin in admins:
            await create_notification(
                db, str(admin.id), "New post request",
                f"{author_name or current_user.username} submitted a new post: '{title}'. Review it in Post Requests.",
                type="post_request", link="/admindashboard/posts"
            )
        await db.commit()
        return {"id": str(post.id), "message": "Post submitted. It will be visible after admin approval.", "is_published": False}

    return {"id": str(post.id), "message": "Post created successfully", "is_published": True}


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if str(post.author_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    await db.delete(post)
    await db.commit()
    return {"message": "Post deleted successfully"}
