from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware

from app.core.db import engine
from app.core.deps import db_dependency
from app.core.settings import settings
from app.models import Base, Redirect
from app.routers import auth, redirects, users, utms, visits
from app.tasks import add_redirect_visit

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


# still deciding if frontend will use this
@app.get("/{redirect_alias}")
def handle_redirects(db: db_dependency, redirect_alias: str):
    redirect = db.query(Redirect).filter(Redirect.alias == redirect_alias).first()
    if redirect is None:
        raise HTTPException(status_code=404, detail="Redirect not found")
    add_redirect_visit.apply_async(args=[redirect.id])  # type: ignore[prop-decorator]
    return RedirectResponse(url=str(redirect.url), status_code=302)


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(redirects.router, prefix=settings.API_V1_STR)
app.include_router(utms.router, prefix=settings.API_V1_STR)
app.include_router(visits.router, prefix=settings.API_V1_STR)
