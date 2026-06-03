from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class Redirect(TimestampMixin, Base):
    __tablename__ = "redirects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    alias: Mapped[str] = mapped_column(
        String(20), unique=True, index=True, nullable=False
    )
    url: Mapped[str] = mapped_column(nullable=False)
    owner_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )

    visits: Mapped[list["Visit"]] = relationship(
        back_populates="redirect", cascade="all, delete-orphan"
    )

    utm: Mapped["Utm"] = relationship(
        back_populates="redirect", uselist=False, cascade="all, delete-orphan"
    )
