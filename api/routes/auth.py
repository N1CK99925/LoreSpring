from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from database.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.session import get_database
from src.schemas.api.user_token import UserRequest, UserResponse, Token
from src.services.user_auth import create_access_token, authenticate_user
from api.auth.utils import hash_password
from api.auth.dependencies import get_current_user
from config.settings import settings


router = APIRouter(prefix="/auth",tags=["auth"])

@router.post("/register",response_model=UserResponse)
async def register(user_data: UserRequest, db: AsyncSession = Depends(get_database)):
    stmt = select(User).where((User.username == user_data.username) | (User.email == user_data.email))
    result = await db.execute(stmt)
    user = result.scalars().first()
    if user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username or email already registered")

    hashed_pw = await hash_password(user_data.password)
    new_user = User(username=user_data.username, email=user_data.email, hashed_password=hashed_pw, is_active=True)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserResponse(id=new_user.id, username=new_user.username, email=new_user.email)





@router.post("/login",response_model=Token)    
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_database)):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = await create_access_token(data={"sub": user.username}, expires_delta=settings.access_token_expire_minutes)
    return Token(access_token=access_token, token_type="bearer")






@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    # TODO redis blacklist
    return {"message": "Logged out successfully"}
