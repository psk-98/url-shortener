from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, or_

from app.core.deps import db_dependency, user_dependency
from app.models import Redirect
from app.models.visit import Visit
from app.schemas.redirects import (
    CreateRedirectRequest,
    RedirectResponse,
    RedirectsSortBy,
    RedirectTopResponse,
    SortDirection,
    UpdateRedirectRequest,
)
from app.services.redirect_service import (
    create_auth_user_redirect_service,
    create_redirect_service,
    get_top_redirects_service,
)

router = APIRouter(prefix="/redirects", tags=["redirects"])


# update for utm
@router.get("/top", response_model=list[RedirectTopResponse])
def get_top_redirects(db: db_dependency, limit: int = 20):
    return get_top_redirects_service(db, limit)


@router.get(
    "/",
    # response_model=List[RedirectResponse]
)
def get_auth_user_redirects(
    auth_user: user_dependency,
    db: db_dependency,
    search: str | None = Query(default=None),
    skip: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    sort_by: RedirectsSortBy = Query(default=RedirectsSortBy.created_at),
    sort_dir: SortDirection = Query(default=SortDirection.desc),
):

    visits_count = func.count(Visit.id).label("visits_count")
    query = (
        db.query(Redirect, visits_count)
        .outerjoin(Visit, Visit.redirect_id == Redirect.id)
        .filter(Redirect.owner_id == auth_user.get("user_id"))
        .group_by(Redirect.id)
    )

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Redirect.alias.ilike(search_term),
                Redirect.url.ilike(search_term),
            )
        )

    sort_columns = {
        RedirectsSortBy.created_at: Redirect.created_at,
        RedirectsSortBy.visits_count: visits_count,
    }

    sort_column = sort_columns[sort_by]

    if sort_dir == SortDirection.desc:
        sort_column = sort_column.desc()
    else:
        sort_column = sort_column.asc()

    total = query.count()

    result_query = (
        query.order_by(sort_column).offset((skip - 1) * limit).limit(limit).all()
    )

    return {
        "data": [
            {
                "id": redirect.id,
                "alias": redirect.alias,
                "url": redirect.url,
                "created_at": redirect.created_at,
                "visit_count": count,
            }
            for redirect, count in result_query
        ],
        "meta": {
            "page": skip,
            "per_page": limit,
            "total": total,
            "last_page": (total + limit - 1) // limit,
            "search": search,
            "sort_by": sort_by,
            "sort_dir": sort_dir,
        },
    }


@router.post("/", response_model=RedirectResponse, status_code=status.HTTP_201_CREATED)
def create_auth_user_redirect(
    request: CreateRedirectRequest, auth_user: user_dependency, db: db_dependency
):
    return create_auth_user_redirect_service(request, auth_user, db)


@router.post(
    "/guest_redirect",
    response_model=RedirectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_redirect(request: CreateRedirectRequest, db: db_dependency):
    return create_redirect_service(request, db)


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

    redirect_model.url = request.url  # type: ignore
    db.add(redirect_model)
    db.commit()

    return redirect_model


@router.delete("/{redirect_alias}", status_code=status.HTTP_204_NO_CONTENT)
def delete_redirect(auth_user: user_dependency, db: db_dependency, redirect_alias: str):
    redirect_model = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect_model is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    if redirect_model.id != auth_user.get("user_id"):
        raise HTTPException(status_code=401, detail="Unauthorized")

    db.query(Redirect).filter(Redirect.alias == redirect_alias).delete()
    db.commit()
