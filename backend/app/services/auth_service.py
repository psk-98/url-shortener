from datetime import UTC, datetime, timedelta

from fastapi import HTTPException
from sqlalchemy import or_

from app.core.deps import db_dependency
from app.core.security import (
    generate_reset_token,
    hash_password,
    hash_reset_token,
    verify_password,
)
from app.core.settings import settings
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.users import (
    CreateUserRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.tasks import send_password_reset_email


def forgot_password_service(request: ForgotPasswordRequest, db: db_dependency):
    user = db.query(User).filter(User.email == request.email).first()

    if user:
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id
        ).delete()

        token = generate_reset_token()
        token_hash = hash_reset_token(token)
        expires_at = datetime.now(UTC) + timedelta(
            minutes=settings.EMAIL_RESET_TOKEN_EXPIRE_MINUTES
        )

        reset_token = PasswordResetToken(
            user_id=user.id, token_hash=token_hash, expires_at=expires_at
        )

        db.add(reset_token)
        db.commit()

        send_password_reset_email.apply_async(args=[user.email, user.username, token])  # type: ignore[prop-decorator]

    return {
        "message": "If an account exists with this email, you will receive password reset instructions.",
    }


def reset_password_service(request: ResetPasswordRequest, db: db_dependency):
    reset_token_instance = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == hash_reset_token(request.token))
        .first()
    )

    if not reset_token_instance:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    if reset_token_instance.expires_at < datetime.now(UTC):
        db.delete(reset_token_instance)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    user = db.query(User).filter(User.id == reset_token_instance.user_id).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    user.password = hash_password(request.password)
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.id).delete()
    db.add(user)
    db.commit()

    return {
        "message": "Password reset successfully. You can now log in with your new password.",
    }


def create_user_service(request: CreateUserRequest, db: db_dependency):
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")

    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=409, detail="Email already taken")

    request_data = request.model_dump()
    request_data["password"] = hash_password(request.password)
    create_user_model = User(**request_data)
    db.add(create_user_model)
    db.commit()

    return create_user_model


def authenticate_user_service(username_email: str, password: str, db) -> User | bool:
    user = (
        db.query(User)
        .filter(or_(User.username == username_email, User.email == username_email))
        .first()
    )
    if not user:
        return False
    if not verify_password(password, user.password):
        return False

    return user
