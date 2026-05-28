from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
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
    owner: Mapped[str] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    is_utm: Mapped[bool] = mapped_column(nullable=False, index=True)
    utm_details: Mapped[dict] = mapped_column(
        JSONB, nullable=False
    )  # if you using sqlite use JSON
    visits = relationship("Visit", back_populates="redirect")
