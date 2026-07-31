from fastapi import APIRouter

from app.api.routes.auth_routes import router as auth_router
from app.api.routes.alumni_routes import router as alumni_router
from app.api.routes.admin_routes import router as admin_router
from app.api.routes.student_routes import router as student_router
from app.api.routes.event_routes import router as event_router
from app.api.routes.post_routes import router as post_router
from app.api.routes.connection_routes import router as connection_router
from app.api.routes.mentorship_routes import router as mentorship_router
from app.api.routes.contribution_routes import router as contribution_router
from app.api.routes.education_routes import router as education_routes
from app.api.routes.job_routes import router as job_routes
from app.api.routes.event_image_routes import router as event_image_routes
from app.api.routes.notification_routes import router as notification_router
from app.api.routes.skill_routes import router as skill_routes
from app.api.routes.experience_routes import router as experience_routes
from app.api.routes.upload_routes import router as upload_router
from app.api.routes.referral_routes import router as referral_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(education_routes)
router.include_router(skill_routes)
router.include_router(experience_routes)
router.include_router(alumni_router)
router.include_router(admin_router)
router.include_router(student_router)
router.include_router(event_router)
router.include_router(post_router)
router.include_router(connection_router)
router.include_router(mentorship_router)
router.include_router(contribution_router)
router.include_router(job_routes)
router.include_router(event_image_routes)
router.include_router(notification_router)
router.include_router(upload_router)
router.include_router(referral_router)
