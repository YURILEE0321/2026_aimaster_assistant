from fastapi import Depends, Header
from sqlalchemy.orm import Session

from .database import get_db
from .errors import AppError
from .models import User

TOKEN_PREFIX = "demo."


def decode_token(token: str) -> str:
    if not token.startswith(TOKEN_PREFIX):
        raise AppError(401, "UNAUTHORIZED", "유효하지 않은 토큰입니다.")
    return token[len(TOKEN_PREFIX) :]


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppError(401, "UNAUTHORIZED", "인증 토큰이 필요합니다.")

    token = authorization[len("Bearer ") :]
    user_id = decode_token(token)

    user = db.get(User, user_id)
    if not user:
        raise AppError(401, "UNAUTHORIZED", "유효하지 않은 토큰입니다.")
    return user
