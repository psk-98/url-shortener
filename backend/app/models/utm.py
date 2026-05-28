from app.models.base import Base
from app.models.mixins import TimestampMixin


class Utm(TimestampMixin,Base):
    __tablename__= ""