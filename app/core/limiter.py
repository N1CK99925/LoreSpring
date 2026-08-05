from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.models.user import User


def user_id_key(request: Request) -> str:
    user: User | None = getattr(request.state, "user", None)
    if user is not None:
        return str(user.id)
    return get_remote_address(request)


limiter = Limiter(key_func=user_id_key)
