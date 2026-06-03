from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class Visit(TimestampMixin, Base):
    __tablename__ = "visits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    redirect_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("redirects.id"), nullable=False, index=True
    )

    redirect: Mapped["Redirect"] = relationship(back_populates="visits")
