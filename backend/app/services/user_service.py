from fastapi import HTTPException

from app.core.deps import db_dependency, user_dependency
from app.core.security import bcrypt_context
from app.models.user import User
from app.schemas.users import ChangeUserPasswordRequest, UpdateUserRequest


def change_password_service(
    request: ChangeUserPasswordRequest, auth_user: user_dependency, db: db_dependency
):
    user = db.query(User).filter(User.id == auth_user.get("user_id")).first()

    if not bcrypt_context.verify(request.password, user.password):  # type: ignore
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if bcrypt_context.hash(request.password) == user.password:  # type: ignore
        raise HTTPException(
            status_code=400, detail="New password cannot be the same as the current one"
        )

    user.password = bcrypt_context.hash(request.new_password)  # type: ignore
    db.commit()


def update_user_service(
    request: UpdateUserRequest, auth_user: user_dependency, db: db_dependency
):
    user_model = db.query(User).filter(User.id == auth_user.get("user_id")).first()

    if request.username:
        existing_user = db.query(User).filter(User.username == request.username).first()
        if existing_user and existing_user.id != user_model.id:  # type: ignore
            raise HTTPException(status_code=409, detail="Username already taken")
        user_model.username = request.username  # type: ignore

    if request.email:
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user and existing_user.id != user_model.id:  # type: ignore
            raise HTTPException(status_code=409, detail="Email already taken")
        user_model.email = request.email  # type: ignore

    db.add(user_model)
    db.commit()
