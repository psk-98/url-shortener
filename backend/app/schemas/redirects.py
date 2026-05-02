from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict

from app.schemas.visits import VisitResponse


class RedirectsSortBy(str, Enum):
    created_at = "created_at"
    visits_count = "visits_count"


class SortDirection(str, Enum):
    asc = "asc"
    desc = "desc"


class RedirectTopResponse(BaseModel):
    id: int
    alias: str
    url: str
    visit_count: int
    created_at: datetime


# class UserRedirect


class RedirectResponse(BaseModel):
    id: int
    alias: str
    url: str
    visits: list[VisitResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CreateRedirectRequest(BaseModel):
    alias: str | None = None
    url: str


class UpdateRedirectRequest(BaseModel):
    url: str
