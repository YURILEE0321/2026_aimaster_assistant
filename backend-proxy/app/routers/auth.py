from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import TOKEN_PREFIX, get_current_user
from ..errors import AppError
from ..models import User
from ..schemas import (
    MeResponse,
    SwitchUserRequest,
    SwitchUserResponse,
    UserListResponse,
    UserSchema,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/users", response_model=UserListResponse)
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return UserListResponse(items=[UserSchema.model_validate(u) for u in users])


@router.post("/switch", response_model=SwitchUserResponse)
def switch_user(body: SwitchUserRequest, db: Session = Depends(get_db)):
    user = db.get(User, body.user_id)
    if not user:
        raise AppError(404, "AUTH_USER_NOT_FOUND", "존재하지 않는 사용자입니다.")

    token = f"{TOKEN_PREFIX}{user.user_id}"
    return SwitchUserResponse(token=token, user=UserSchema.model_validate(user))


@router.get("/me", response_model=MeResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return MeResponse(user=UserSchema.model_validate(current_user))
