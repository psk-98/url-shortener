from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.mixins import TimestampMixin


class Utm(TimestampMixin, Base):
    __tablename__ = "utms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(100), nullable=True)
    medium: Mapped[str] = mapped_column(String(100), nullable=True)
    campaign: Mapped[str] = mapped_column(String(100), nullable=True)
    term: Mapped[str] = mapped_column(String(100), nullable=True)
    content: Mapped[str] = mapped_column(String(100), nullable=True)
    custom_fields: Mapped[dict] = mapped_column(JSONB, nullable=True)
    url: Mapped[str] = mapped_column(String(100), nullable=False)
    redirect_id: Mapped[int] = mapped_column(
        ForeignKey("redirects.id"), unique=True, nullable=False
    )

    redirect: Mapped["Redirect"] = relationship(back_populates="utm")
