from sqlalchemy import Column, Integer

from app.models import Base
from app.models.mixins import TimestampMixin


class Visit(TimestampMixin, Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True)
    redirect = Column(Integer, nullable=False, index=True)
