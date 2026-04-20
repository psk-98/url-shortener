from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models import Base
from app.models.mixins import TimestampMixin


class Visit(TimestampMixin, Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True)
    redirect_id = Column(
        Integer, ForeignKey("redirects.id"), nullable=False, index=True
    )

    redirect = relationship("Redirect", back_populates="visits")
