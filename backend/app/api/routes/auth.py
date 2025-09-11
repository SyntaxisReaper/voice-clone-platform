from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.core.database import get_db
from app.models import User
from app.services.auth import auth_service

router = APIRouter()
security = HTTPBearer()


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    display_name: Optional[str] = None
    firebase_uid: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    firebase_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    display_name: Optional[str]
    is_active: bool
    is_verified: bool
    is_premium: bool
    monthly_usage_limit: int
    current_month_usage: int
    
    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with Firebase token"""
    if user_data.firebase_uid:
        # If Firebase UID is provided, verify it's valid
        try:
            firebase_token = await auth_service.verify_firebase_token(user_data.firebase_uid)
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Firebase token"
            )
        
        user = await auth_service.get_or_create_user(db, firebase_token)
    else:
        # Direct registration (for development/testing)
        user = User(
            email=user_data.email,
            username=user_data.username,
            display_name=user_data.display_name or user_data.username,
            is_verified=False
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_premium=user.is_premium,
        monthly_usage_limit=user.monthly_usage_limit,
        current_month_usage=user.current_month_usage
    )


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
async def login_user(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user with Firebase token"""
    # Verify Firebase token
    firebase_token = await auth_service.verify_firebase_token(login_data.firebase_token)
    
    # Get or create user
    user = await auth_service.get_or_create_user(db, firebase_token)
    
    # Generate JWT tokens
    access_token = auth_service.generate_jwt_token(user)
    refresh_token = auth_service.generate_refresh_token(user)
    
    user_response = UserResponse(
        id=str(user.id),
        email=user.email,
        username=user.username,
        display_name=user.display_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        is_premium=user.is_premium,
        monthly_usage_limit=user.monthly_usage_limit,
        current_month_usage=user.current_month_usage
    )
    
    return LoginResponse(
        user=user_response,
        access_token=access_token,
        refresh_token=refresh_token
    )


async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    return await auth_service.get_current_user(db, token)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_dependency)
):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        display_name=current_user.display_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        is_premium=current_user.is_premium,
        monthly_usage_limit=current_user.monthly_usage_limit,
        current_month_usage=current_user.current_month_usage
    )


@router.post("/logout")
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Logout user"""
    # TODO: Invalidate token if using blacklist
    return {"message": "Successfully logged out"}
