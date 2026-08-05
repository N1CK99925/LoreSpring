from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_database
from app.domain.user_token import UserRequest, UserResponse, Token
from app.auth.jwt import create_access_token, authenticate_user
from app.auth.passwords import hash_password
from app.api.deps import get_current_user
from app.config.settings import settings
from app.core.limiter import limiter, user_id_key
from app.config.rate_limits import RateLimits


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
@limiter.limit(RateLimits.REGISTER, key_func=user_id_key)
async def register(
    request: Request, user_data: UserRequest, db: AsyncSession = Depends(get_database)
):
    stmt = select(User).where(
        (User.username == user_data.username) | (User.email == user_data.email)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    hashed_pw = await hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserResponse(
        id=new_user.id, username=new_user.username, email=new_user.email
    )


from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=Token)
@limiter.limit(RateLimits.LOGIN, key_func=user_id_key)
async def login(
    request: Request, body: LoginRequest, db: AsyncSession = Depends(get_database)
):
    user = await authenticate_user(db, body.username, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = await create_access_token(
        data={"sub": user.username}, expires_delta=settings.access_token_expire_minutes
    )
    return Token(access_token=access_token, token_type="bearer")


@router.post("/logout")
async def logout(current_user=Depends(get_current_user)):
    # TODO redis blacklist
    return {"message": "Logged out successfully"}
