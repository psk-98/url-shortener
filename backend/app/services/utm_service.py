from app.core.deps import db_dependency, user_dependency
from app.models.redirect import Redirect
from app.models.utm import Utm
from app.schemas.utms import CreateUtmRequest
from app.utils.redirect import generate_unique_code


def create_utm_service(
    request: CreateUtmRequest, auth_user: user_dependency, db: db_dependency
):
    redirect = Redirect(
        alias=generate_unique_code(db),
        url=request.generated_url,
        owner_id=auth_user.get("user_id"),
    )

    redirect.utm = Utm(
        **request.model_dump(exclude={"base_url", "generated_url"}),
        url=request.base_url,
    )

    db.add(redirect)
    db.commit()

    return redirect.utm
