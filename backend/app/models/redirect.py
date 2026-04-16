from sqlalchemy import Column, ForeignKey, Integer, String

from app.models.base import Base
from app.models.mixins import TimestampMixin


class Redirect(TimestampMixin, Base):
    __tablename__ = "redirects"

    id = Column(Integer, primary_key=True)
    alias = Column(String, unique=True, nullable=False, index=True)
    url = Column(String, nullable=False)
    # visit_count = Column(Integer, default=0)
    owner = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
