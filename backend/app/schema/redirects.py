from pydantic import BaseModel


class RedirectResponse(BaseModel):
    id: int
    alias: str
    url: str


class CreateRedirectRequest(BaseModel):
    alias: str | None = None
    url: str


class UpdateRedirectRequest(BaseModel):
    url: str
