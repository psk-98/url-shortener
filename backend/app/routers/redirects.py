import secrets
import string

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
from app.tasks import add_redirect_visit
from sqlalchemy.exc import IntergrityError

router = APIRouter(prefix="/redirects", tags=["redirects"])


def random_string(min_length: int = 5, max_length: int = 20) -> str:
    length = secrets.randbelow(max_length - min_length + 1) + min_length
    return "".join(secrets.choice(string.ascii_letters) for _ in range(length))


def generate_unique_code(db,request) -> Redirect:
    alias = random_string()
    redirect = Redirect(**request.model_dump()
)
    # exists = db.query(Redirect).filter(Redirect.alias == alias).first()
    for _ in range(5):
      redirect.alias = random_string()

      try:
        db.add(redirect)
        db.commit()
        db.refresh(redirect)
        
        return redirect
      except IntegrityError as err:
        db.rollback()

        if isinstance(exc.orig, UniqueViolation):
          continue


    if not exists:
        return alias


@router.get("/top", response_model=list[RedirectTopResponse])
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
            "created_at": redirect.created_at,
        }
        for redirect, visit_count in top_redirects
    ]


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
        .filter(Redirect.owner == auth_user.get("user_id"))
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


@router.get("/visit/{redirect_alias}", response_model=RedirectResponse)
def get_redirect_user_is_visiting(db: db_dependency, redirect_alias: str):
    redirect = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    add_redirect_visit.apply_async(args=[redirect.id])  # type: ignore[prop-decorator]
    return redirect


@router.post("/", response_model=RedirectResponse, status_code=status.HTTP_201_CREATED)
def create_auth_user_redirect(
    request: CreateRedirectRequest, auth_user: user_dependency, db: db_dependency
):
    if (
        request.alias
        and db.query(Redirect).filter(Redirect.alias == request.alias).first()
    ):
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
    redirect = Redirect(**request.model_dump())

    if request.alias and not db.query(Redirect).filter(Redirect.alias == request.alias).first():
      db.add(redirect)
      db.commit()
      return redirect
    elif request.alias is None:
      redirect.alias = generate_unique_code(db,request)

    else
        raise HTTPException(status_code=409, detail="Alias already taken")

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
