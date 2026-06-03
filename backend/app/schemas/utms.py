from pydantic import BaseModel


class CreateUtmRequest(BaseModel):
    base_url: str
    generated_url: str
    source: str
    medium: str
    campaign: str
    term: str | None = None
    content: str | None = None
    custom_fields: list | None = None
