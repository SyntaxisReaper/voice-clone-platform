from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, ValidationError
from typing import Optional, Dict, Any
from loguru import logger

from app.services.auth_service import (
    AuthService, LoginRequest, SignupRequest, AuthTokens, TokenData
)
from app.models.mongo.user import User

router = APIRouter()
security = HTTPBearer(auto_error=False)


# Response Models
class UserResponse(BaseModel):
    """User response model"""
    id: str
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    subscription_tier: str
    credits_remaining: int
    total_generations: int
    created_at: str


class LoginResponse(BaseModel):
    """Login response model"""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    message: str


class SignupResponse(BaseModel):
    """Signup response model"""
    user: UserResponse
    message: str
    verification_required: bool


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class PasswordStrengthResponse(BaseModel):
    """Password strength validation response"""
    strength: str
    score: int
    checks: Dict[str, bool]
    suggestions: list


@router.post("/signup", response_model=SignupResponse)
async def signup_user(signup_data: SignupRequest):
    """Register a new user account"""
    try:
        # Create new user
        user = await AuthService.create_user(signup_data)
        
        # Create user response
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            is_active=user.is_active,
            is_verified=user.is_verified,
            subscription_tier=user.subscription_tier,
            credits_remaining=user.credits_remaining,
            total_generations=user.total_generations,
            created_at=user.created_at.isoformat()
        )
        
        return SignupResponse(
            user=user_response,
            message="Account created successfully! Please check your email to verify your account.",
            verification_required=not user.is_verified
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/login", response_model=LoginResponse)
async def login_user(login_data: LoginRequest):
    """Authenticate user with email and password"""
    try:
        # Authenticate user
        user = await AuthService.authenticate_user(login_data.email, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if account is locked
        if user.is_account_locked():
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked due to failed login attempts"
            )
        
        # Create authentication tokens
        auth_tokens = AuthService.create_auth_tokens(user, login_data.remember_me)
        
        # Create user response
        user_response = UserResponse(
            id=str(user.id),
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            is_active=user.is_active,
            is_verified=user.is_verified,
            subscription_tier=user.subscription_tier,
            credits_remaining=user.credits_remaining,
            total_generations=user.total_generations,
            created_at=user.created_at.isoformat()
        )
        
        return LoginResponse(
            user=user_response,
            access_token=auth_tokens.access_token,
            refresh_token=auth_tokens.refresh_token,
            token_type=auth_tokens.token_type,
            expires_in=auth_tokens.expires_in,
            message="Login successful"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )


@router.post("/refresh", response_model=AuthTokens)
async def refresh_token(token_request: RefreshTokenRequest):
    """Refresh access token using refresh token"""
    try:
        new_tokens = await AuthService.refresh_access_token(token_request.refresh_token)
        
        if not new_tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return new_tokens
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )


@router.get("/verify/{token}")
async def verify_email(token: str):
    """Verify user email with verification token"""
    success = await AuthService.verify_email(token)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    return {"message": "Email verified successfully"}


@router.post("/password-strength", response_model=PasswordStrengthResponse)
async def check_password_strength(password: str = Form(...)):
    """Check password strength and provide feedback"""
    result = AuthService.validate_password_strength(password)
    
    return PasswordStrengthResponse(
        strength=result["strength"],
        score=result["score"],
        checks=result["checks"],
        suggestions=[s for s in result["suggestions"] if s is not None]
    )


# Authentication dependency
async def get_current_user_dependency(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    """Dependency to get current authenticated user"""
    if not credentials:
        return None
    
    # Verify token
    token_data = AuthService.verify_token(credentials.credentials)
    if not token_data:
        return None
    
    # Get user from database
    user = await AuthService.get_user_by_id(token_data.user_id)
    if not user or not user.is_active:
        return None
    
    return user


# Required authentication dependency
async def get_current_user_required(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Dependency that requires authentication"""
    # Verify token
    token_data = AuthService.verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = await AuthService.get_user_by_id(token_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_user_required)
):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        subscription_tier=current_user.subscription_tier,
        credits_remaining=current_user.credits_remaining,
        total_generations=current_user.total_generations,
        created_at=current_user.created_at.isoformat()
    )


@router.post("/logout")
async def logout_user(
    current_user: User = Depends(get_current_user_required)
):
    """Logout user"""
    # In a production system, you might want to invalidate the refresh token
    # For now, client-side token removal is sufficient
    return {"message": "Successfully logged out"}
