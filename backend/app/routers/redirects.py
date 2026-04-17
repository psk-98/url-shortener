import secrets
import string
from typing import List

from fastapi import APIRouter, HTTPException, status

from app.core.deps import db_dependency, user_dependency
from app.models import Redirect
from app.schema.redirects import (
    CreateRedirectRequest,
    RedirectResponse,
    UpdateRedirectRequest,
)

router = APIRouter(prefix="/redirects", tags=["redirects"])


def random_string(min_length: int = 5, max_length: int = 20) -> str:
    length = secrets.randbelow(max_length - min_length + 1) + min_length
    return "".join(secrets.choice(string.ascii_letters) for _ in range(length))


def generate_unique_code(db):
    while True:
        alias = random_string()

        exists = db.query(Redirect).filter(Redirect.alias == alias).first()

        if not exists:
            return alias


@router.get("/", response_model=List[RedirectResponse])
def get_auth_user_redirects(auth_user: user_dependency, db: db_dependency):

    return db.query(Redirect).filter(Redirect.owner == auth_user.get("user_id")).all()


@router.post("/", response_model=RedirectResponse, status_code=status.HTTP_201_CREATED)
def create_auth_user_redirect(
    request: CreateRedirectRequest, auth_user: user_dependency, db: db_dependency
):
    if request.alias and db.query(Redirect).filter(Redirect.alias == request.alias):
        raise HTTPException(status_code=409, detail="Alias already taken")

    redirect = Redirect(**request.model_dump(), owner=auth_user.get("user_id"))

    if request.alias is None:
        redirect.alias = generate_unique_code(db)

    db.add(redirect)
    db.commit()
    return redirect


@router.post(
    "/guest_redirect",
    response_model=RedirectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_redirect(request: CreateRedirectRequest, db: db_dependency):
    print(request)
    if request.alias and db.query(Redirect).filter(Redirect.alias == request.alias):
        raise HTTPException(status_code=409, detail="Alias already taken")

    redirect = Redirect(**request.model_dump())

    if request.alias is None:
        redirect.alias = generate_unique_code(db)

    db.add(redirect)
    db.commit()
    return redirect


@router.patch(
    "/{redirect_alias}",
    response_model=RedirectResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def update_redirect(
    request: UpdateRedirectRequest,
    auth_user: user_dependency,
    db: db_dependency,
    redirect_alias: str,
):
    redirect_model = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect_model is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    if redirect_model.id != auth_user.get("user_id"):
        raise HTTPException(status_code=401, detail="Unathorized")

    redirect_model.url = request.url
    db.add(redirect_model)
    db.commit()

    return redirect_model


@router.delete("/{redirect_alias}", status_code=status.HTTP_204_NO_CONTENT)
def delete_redirect(auth_user: user_dependency, db: db_dependency, redirect_alias: str):
    redirect_model = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect_model is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    if redirect_model.id != auth_user.get("user_id"):
        raise HTTPException(status_code=401, detail="Unathorized")

    db.query(Redirect).filter(Redirect.alias == redirect_alias).delete()
    db.commit()
