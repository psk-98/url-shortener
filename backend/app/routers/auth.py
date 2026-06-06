from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.deps import db_dependency
from app.core.security import (
    create_access_token,
)
from app.core.settings import settings
from app.schemas.users import (
    CreateUserRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user_service,
    create_user_service,
    forgot_password_service,
    reset_password_service,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/login/access_token",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    description="Login in with your username or email in the username field.",
)
def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency
):
    user = authenticate_user_service(form_data.username, form_data.password, db)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate user"
        )

    token = create_access_token(
        user.username,  # type: ignore
        user.id,  # type: ignore
        user.role,  # type: ignore
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {"access_token": token, "token_type": "Bearer"}


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(request: ForgotPasswordRequest, db: db_dependency):
    return forgot_password_service(request, db)


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: db_dependency):
    return reset_password_service(request, db)


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def create_user(request: CreateUserRequest, db: db_dependency):
    return create_user_service(request, db)
