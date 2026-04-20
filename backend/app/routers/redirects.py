import secrets
import string
from typing import List

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from app.core.deps import db_dependency, user_dependency
from app.models import Redirect
from app.models.visit import Visit
from app.schema.redirects import (
    CreateRedirectRequest,
    RedirectResponse,
    RedirectTopResponse,
    UpdateRedirectRequest,
)
from app.tasks import add_redirect_visit

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


@router.get("/redirects/top", response_model=list[RedirectTopResponse])
def get_top_redirects(db: db_dependency, limit: int = 20):
    top_redirects = (
        db.query(Redirect, func.count(Visit.id).label("visit_count"))
        .outerjoin(Visit, Visit.redirect_id == Redirect.id)
        .group_by(Redirect.id)
        .order_by(func.count(Visit.id).desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": redirect.id,
            "alias": redirect.alias,
            "url": redirect.url,
            "visit_count": visit_count,
        }
        for redirect, visit_count in top_redirects
    ]


@router.get("/", response_model=List[RedirectResponse])
def get_auth_user_redirects(
    # auth_user: user_dependency,
    db: db_dependency,
):

    return (
        db.query(Redirect)
        # .options(selectinload(Redirect.visits))
        # .filter(Redirect.owner == auth_user.get("user_id"))
        .all()
    )


@router.get("/visit/{redirect_alias}", response_model=RedirectResponse)
def get_redirect_user_is_visiting(db: db_dependency, redirect_alias: str):
    redirect = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    add_redirect_visit.apply_async(args=[redirect.id])
    return redirect


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
