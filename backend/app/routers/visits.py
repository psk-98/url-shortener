from typing import List

from fastapi import APIRouter, status

from app.core.deps import db_dependency
from app.models.visit import Visit
from app.schema.visits import CreateVisitRequest, VisitResponse

router = APIRouter(prefix="/visits", tags=["visits"])


@router.get("/{redirect_alias}", response_model=List[VisitResponse])
def get_visits(db: db_dependency, redirect_alias: str):
    return db.query(Visit).filter(Visit.redirect == redirect_alias).all()


@router.get("/{redirect_alias}", status_code=status.HTTP_204_NO_CONTENT)
def create_visit(request: CreateVisitRequest, db: db_dependency):
    visit = Visit(**request.model_dump())
    db.add(visit)
    db.commit()
