from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class Redirect(TimestampMixin, Base):
    __tablename__ = "redirects"

    id = Column(Integer, primary_key=True)
    alias = Column(String, unique=True, nullable=False, index=True)
    url = Column(String, nullable=False)
    owner = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    visits = relationship("Visit", back_populates="redirect")
