from celery import Celery

from app.core.db import CelerySessionLocal
from app.core.settings import settings
from app.models.visit import Visit
from app.utils.email import generate_password_reset_email, send_email

celery_app = Celery(main="tasks", broker=settings.CELERY_BROKER_URI)


@celery_app.task(name="add_redirect_visit")
def add_redirect_visit(redirect_id: str) -> None:
    db = CelerySessionLocal()
    try:
        visit = Visit(redirect_id=redirect_id)
        db.add(visit)
        db.commit()
    finally:
        db.close()


@celery_app.task(name="send_password_reset_email")
def send_password_reset_email(email: str, username: str, token: str) -> None:
    email_data = generate_password_reset_email(username=username, token=token)
    send_email(
        email_to=email,
        subject=email_data.subject,
        html_content=email_data.html_content,
        plain_text=email_data.plain_text,
    )
