from pydantic import BaseModel, ConfigDict

from app.schema.visits import VisitResponse


class RedirectTopResponse(BaseModel):
    id: int
    alias: str
    url: str
    visit_count: int


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
