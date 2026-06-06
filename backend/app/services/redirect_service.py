from fastapi import HTTPException
from sqlalchemy import func

from app.core.deps import db_dependency, user_dependency
from app.models.redirect import Redirect
from app.models.visit import Visit
from app.schemas.redirects import CreateRedirectRequest
from app.utils.redirect import generate_unique_code


def create_auth_user_redirect_service(
    request: CreateRedirectRequest, auth_user: user_dependency, db: db_dependency
):
    if (
        request.alias
        and db.query(Redirect).filter(Redirect.alias == request.alias).first()
    ):
        raise HTTPException(status_code=409, detail="Alias already taken")

    redirect = Redirect(**request.model_dump(), owner_id=auth_user.get("user_id"))

    if request.alias is None:
        redirect.alias = generate_unique_code(db)

    db.add(redirect)
    db.commit()
    return redirect


def create_redirect_service(request: CreateRedirectRequest, db: db_dependency):
    if request.alias and db.query(Redirect).filter(Redirect.alias == request.alias):
        raise HTTPException(status_code=409, detail="Alias already taken")

    redirect = Redirect(**request.model_dump())

    if request.alias is None:
        redirect.alias = generate_unique_code(db)

    db.add(redirect)
    db.commit()
    return redirect


def get_top_redirects_service(db: db_dependency, limit: int = 20):
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
            "created_at": redirect.created_at,
        }
        for redirect, visit_count in top_redirects
    ]
