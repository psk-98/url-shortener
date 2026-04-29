from celery import Celery

from app.core.db import CelerySessionLocal
from app.core.settings import settings
from app.models.visit import Visit

celery_app = Celery(main="tasks", broker=settings.CELERY_BROKER_URL)


@celery_app.task
def add_redirect_visit(redirect_id: str):
    db = CelerySessionLocal()
    try:
        visit = Visit(redirect_id=redirect_id)
        db.add(visit)
        db.commit()
    finally:
        db.close()
