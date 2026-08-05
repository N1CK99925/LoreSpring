from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
import jwt
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_database
from app.config.settings import settings
from app.domain.user_token import TokenData
from app.models.user import User

oauth_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
from sqlalchemy import select


async def get_current_user(
    request: Request,
    token=Depends(oauth_scheme),
    db: AsyncSession = Depends(get_database),
):
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )
        token_data = TokenData(username=username)
    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    result = await db.execute(select(User).where(User.username == token_data.username))
    user = result.scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    request.state.user = user
    return user
