from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.db import engine
from app.core.settings import settings
from app.models import Base
from app.routers import auth, redirects, users, visits

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # docs_url="/docs",  # default
    # redoc_url="/redoc", # default
)

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

Base.metadata.create_all(engine)

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(redirects.router, prefix=settings.API_V1_STR)
app.include_router(visits.router, prefix=settings.API_V1_STR)
