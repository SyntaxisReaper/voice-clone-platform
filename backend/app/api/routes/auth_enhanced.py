"""
Enhanced Authentication API Endpoints

Provides user registration, login, profile management, and JWT token handling.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta

from app.core.auth import create_access_token, get_current_user, get_current_active_user
from app.models.mongo.user import User, SubscriptionTier

router = APIRouter()


class UserRegistration(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=30)
    full_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class UserProfile(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    subscription_tier: str
    is_verified: bool
    is_active: bool
    created_at: str
    last_activity_at: Optional[str] = None
    profile_image_url: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None


class UserStats(BaseModel):
    total_voice_samples: int
    total_training_minutes: int
    total_tts_characters: int
    total_tts_seconds: int
    credits_remaining: int
    subscription_status: dict
    monthly_limits: dict


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        # Check if email already exists
        existing_email = await User.find_one(User.email == user_data.email.lower())
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        existing_username = await User.find_one(User.username == user_data.username.lower())
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create new user
        user = User(
            email=user_data.email.lower(),
            username=user_data.username.lower(),
            full_name=user_data.full_name,
            password_hash=""  # Will be set by set_password
        )
        
        # Hash password
        user.set_password(user_data.password)
        
        # Save user
        await user.save()
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(hours=24)
        )
        
        return TokenResponse(
            access_token=access_token,
            expires_in=24 * 3600,  # 24 hours in seconds
            user=user.to_dict_safe()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login_user(login_data: UserLogin):
    """Login existing user"""
    try:
        # Find user by email
        user = await User.find_one(User.email == login_data.email.lower())
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if account is locked
        if user.is_locked():
            lock_time_remaining = user.locked_until - datetime.utcnow()
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account locked. Try again in {int(lock_time_remaining.total_seconds() / 60)} minutes."
            )
        
        # Verify password
        if not user.verify_password(login_data.password):
            # Record failed attempt
            user.record_login_attempt(success=False)
            await user.save()
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        # Record successful login
        user.record_login_attempt(success=True)
        await user.save()
        
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(hours=24)
        )
        
        return TokenResponse(
            access_token=access_token,
            expires_in=24 * 3600,  # 24 hours in seconds
            user=user.to_dict_safe()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user's profile"""
    return UserProfile(
        id=str(current_user.id),
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        subscription_tier=current_user.subscription_tier.value,
        is_verified=current_user.is_verified,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
        last_activity_at=current_user.last_activity_at.isoformat() if current_user.last_activity_at else None,
        profile_image_url=current_user.profile_image_url,
        bio=current_user.bio,
        website=current_user.website
    )


@router.put("/profile")
async def update_user_profile(
    full_name: Optional[str] = None,
    bio: Optional[str] = None,
    website: Optional[str] = None,
    profile_image_url: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Update user profile"""
    try:
        update_data = {}
        
        if full_name is not None:
            update_data["full_name"] = full_name
        if bio is not None:
            update_data["bio"] = bio
        if website is not None:
            update_data["website"] = website
        if profile_image_url is not None:
            update_data["profile_image_url"] = profile_image_url
        
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            await current_user.update({"$set": update_data})
        
        return {"message": "Profile updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.get("/stats", response_model=UserStats)
async def get_user_stats(current_user: User = Depends(get_current_active_user)):
    """Get user usage statistics"""
    try:
        subscription_status = current_user.get_subscription_status()
        monthly_limits = current_user.get_monthly_limits()
        
        return UserStats(
            total_voice_samples=current_user.total_voice_samples,
            total_training_minutes=current_user.total_training_minutes,
            total_tts_characters=current_user.total_tts_characters,
            total_tts_seconds=current_user.total_tts_seconds,
            credits_remaining=current_user.credits_remaining,
            subscription_status=subscription_status,
            monthly_limits=monthly_limits
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user statistics"
        )


@router.post("/change-password")
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Change user password"""
    try:
        # Verify current password
        if not current_user.verify_password(request.current_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Set new password
        current_user.set_password(request.new_password)
        await current_user.save()
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to change password"
        )


@router.post("/generate-api-key")
async def generate_api_key(current_user: User = Depends(get_current_active_user)):
    """Generate new API key for programmatic access"""
    try:
        api_key = current_user.generate_api_key()
        await current_user.save()
        
        return {
            "api_key": api_key,
            "created_at": current_user.api_key_created_at.isoformat(),
            "message": "API key generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate API key"
        )


@router.delete("/api-key")
async def revoke_api_key(current_user: User = Depends(get_current_active_user)):
    """Revoke current API key"""
    try:
        current_user.api_key = None
        current_user.api_key_created_at = None
        await current_user.save()
        
        return {"message": "API key revoked successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke API key"
        )


@router.post("/logout")
async def logout_user(current_user: User = Depends(get_current_user)):
    """Logout user (placeholder - client should discard token)"""
    return {"message": "Logged out successfully"}


@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_active_user)):
    """Verify if current token is valid"""
    return {
        "valid": True,
        "user_id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email
    }