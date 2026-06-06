from fastapi import APIRouter, status

from app.core.deps import db_dependency, user_dependency
from app.models.user import User
from app.schemas.users import ChangeUserPasswordRequest, UpdateUserRequest, UserResponse
from app.services.user_service import change_password_service, update_user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_auth_user(auth_user: user_dependency, db: db_dependency):
    return db.query(User).filter(User.id == auth_user.get("user_id")).first()


@router.put("/change_password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    request: ChangeUserPasswordRequest, auth_user: user_dependency, db: db_dependency
):
    change_password_service(request, auth_user, db)


@router.patch("/", status_code=status.HTTP_204_NO_CONTENT)
def update_user(
    request: UpdateUserRequest, auth_user: user_dependency, db: db_dependency
):
    update_user_service(request, auth_user, db)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def delete_auth_user(auth_user: user_dependency, db: db_dependency):
    db.query(User).filter(User.id == auth_user.get("user_id")).delete()
    db.commit()
