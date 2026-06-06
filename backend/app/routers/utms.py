from fastapi import APIRouter, status

from app.core.deps import db_dependency, user_dependency
from app.schemas.utms import CreateUtmRequest
from app.services.utm_service import create_utm_service

router = APIRouter(prefix="/utms", tags=["utms"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_utm(
    request: CreateUtmRequest, auth_user: user_dependency, db: db_dependency
):
    return create_utm_service(request, auth_user, db)
