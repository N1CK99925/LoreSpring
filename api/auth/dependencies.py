from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
import jwt
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from database.session import get_database
from config.settings import settings
from src.schemas.api.user_token import TokenData
from database.models.user import User
oauth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
from sqlalchemy import select
async def get_current_user(token = Depends(oauth_scheme), db : AsyncSession = Depends(get_database)):
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    result = await db.execute(select(User).where(User.username == token_data.username))
    user =  result.scalars().first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user