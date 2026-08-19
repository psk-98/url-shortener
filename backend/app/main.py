from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import RedirectResponse
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from starlette.middleware.cors import CORSMiddleware

from app.core.db import engine
from app.core.deps import db_dependency
from app.core.settings import settings
from app.logger import logger
from app.middleware import MetricsMiddleware, RequestLoggerMiddleware
from app.models import Base, Redirect
from app.routers import auth, redirects, users, visits
from app.tasks import add_redirect_visit

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # docs_url="/docs",  # default
    # redoc_url="/redoc", # default
)

logger.info("Starting url shortener...")

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.add_middleware(RequestLoggerMiddleware)

app.add_middleware(MetricsMiddleware)

Base.metadata.create_all(engine)


@app.get("/metrics")
def metrics():
    logger.info("Metrics endpoint accessed")
    return Response(
        content=generate_latest(),
        media_type=CONTENT_TYPE_LATEST,
    )


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(redirects.router, prefix=settings.API_V1_STR)
app.include_router(visits.router, prefix=settings.API_V1_STR)


@app.get("/{redirect_alias}")
def handle_redirects(db: db_dependency, redirect_alias: str):
    redirect = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    add_redirect_visit.apply_async(args=[redirect.id])  # type: ignore[prop-decorator]
    return RedirectResponse(url=str(redirect.url), status_code=302)
