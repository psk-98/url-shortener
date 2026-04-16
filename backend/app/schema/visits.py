from datetime import datetime

from pydantic import BaseModel


class VisitResponse(BaseModel):
    created_at: datetime


class CreateVisitRequest(BaseModel):
    redirect_alias: str
