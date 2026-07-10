from config.settings import settings
import jwt
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models.user import User
from datetime import datetime, timedelta, timezone
from api.auth.utils import verify_password


async def create_access_token(data: dict, expires_delta: int | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + timedelta(minutes=expires_delta)
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    encoded_jwt = await asyncio.to_thread(
        jwt.encode, to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


async def authenticate_user(database: AsyncSession, username: str, password: str):
    stmt = select(User).where(User.username == username)
    result = await database.execute(stmt)
    user = result.scalars().first()
    if not user:
        return False
    if not await verify_password(password, user.hashed_password):
        return False
    return user
