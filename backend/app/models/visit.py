from sqlalchemy import Column, ForeignKey, Integer

from app.models import Base
from app.models.mixins import TimestampMixin


class Visit(TimestampMixin, Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True)
    redirect = Column(Integer, ForeignKey("redirects.id"), nullable=False, index=True)
