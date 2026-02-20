"""
Enhanced Dashboard and Auth Endpoints Validation

This script validates the core functionality of our enhanced APIs
without requiring full config loading.
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent))

async def test_dashboard_models():
    """Test dashboard response models"""
    print("📊 Testing Dashboard Models...")
    
    try:
        from app.api.routes.dashboard_enhanced import (
            DashboardStats,
            ActivityItem,
            UsageChart,
            ModelSummary,
            JobSummary
        )
        
        # Test model creation with sample data
        stats = DashboardStats(
            total_samples=10,
            samples_suitable_for_training=8,
            average_sample_quality=0.85,
            total_voice_models=3,
            deployed_models=2,
            training_models=1,
            total_tts_jobs=15,
            completed_tts_jobs=12,
            total_characters_generated=50000,
            total_audio_duration=1200.5,
            credits_remaining=500,
            monthly_limits={"voice_samples": 100, "tts_characters": 100000},
            usage_this_month={"voice_samples": 10, "tts_characters": 50000},
            recent_activity=[]
        )
        
        activity = ActivityItem(
            type="sample_upload",
            description="Uploaded voice sample 'test.wav'",
            timestamp="2024-01-01T12:00:00Z",
            status="completed",
            metadata={"sample_id": "123", "duration": 30.5}
        )
        
        chart = UsageChart(
            labels=["2024-01-01", "2024-01-02", "2024-01-03"],
            datasets=[{
                "label": "TTS Characters",
                "data": [1000, 1500, 2000],
                "borderColor": "#3b82f6"
            }]
        )
        
        print(f"✅ Dashboard models validated successfully")
        print(f"   - DashboardStats: {stats.total_samples} samples")
        print(f"   - ActivityItem: {activity.type}")
        print(f"   - UsageChart: {len(chart.labels)} data points")
        
        return True
        
    except Exception as e:
        print(f"❌ Dashboard models test failed: {e}")
        return False

async def test_auth_models():
    """Test authentication response models"""
    print("🔐 Testing Authentication Models...")
    
    try:
        from app.api.routes.auth_enhanced import (
            UserRegistration,
            UserLogin,
            TokenResponse,
            UserProfile,
            UserStats
        )
        
        # Test model creation with sample data
        registration = UserRegistration(
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            password="securepassword123"
        )
        
        login = UserLogin(
            email="test@example.com",
            password="securepassword123"
        )
        
        token_response = TokenResponse(
            access_token="sample.jwt.token",
            token_type="bearer",
            expires_in=86400,
            user={"id": "123", "username": "testuser"}
        )
        
        profile = UserProfile(
            id="123",
            email="test@example.com",
            username="testuser",
            full_name="Test User",
            subscription_tier="free",
            is_verified=True,
            is_active=True,
            created_at="2024-01-01T12:00:00Z"
        )
        
        stats = UserStats(
            total_voice_samples=10,
            total_training_minutes=120,
            total_tts_characters=50000,
            total_tts_seconds=1200,
            credits_remaining=500,
            subscription_status={"tier": "free", "active": True},
            monthly_limits={"voice_samples": 100}
        )
        
        print(f"✅ Authentication models validated successfully")
        print(f"   - UserRegistration: {registration.email}")
        print(f"   - TokenResponse: {token_response.token_type} token")
        print(f"   - UserProfile: {profile.username}")
        print(f"   - UserStats: {stats.credits_remaining} credits")
        
        return True
        
    except Exception as e:
        print(f"❌ Authentication models test failed: {e}")
        return False

async def test_router_structure():
    """Test router structure and endpoints"""
    print("🛣️ Testing Router Structure...")
    
    try:
        from app.api.routes.dashboard_enhanced import router as dashboard_router
        from app.api.routes.auth_enhanced import router as auth_router
        
        # Check dashboard endpoints
        dashboard_routes = []
        for route in dashboard_router.routes:
            if hasattr(route, 'path'):
                dashboard_routes.append(f"{route.methods} {route.path}")
        
        # Check auth endpoints
        auth_routes = []
        for route in auth_router.routes:
            if hasattr(route, 'path'):
                auth_routes.append(f"{route.methods} {route.path}")
        
        print(f"✅ Router structure validated successfully")
        print(f"   Dashboard routes: {len(dashboard_routes)}")
        for route in dashboard_routes[:3]:  # Show first 3
            print(f"     - {route}")
        if len(dashboard_routes) > 3:
            print(f"     ... and {len(dashboard_routes) - 3} more")
            
        print(f"   Auth routes: {len(auth_routes)}")
        for route in auth_routes[:3]:  # Show first 3
            print(f"     - {route}")
        if len(auth_routes) > 3:
            print(f"     ... and {len(auth_routes) - 3} more")
        
        return True
        
    except Exception as e:
        print(f"❌ Router structure test failed: {e}")
        return False

async def test_service_fixes():
    """Test that our service fixes are working"""
    print("🔧 Testing Service Fixes...")
    
    try:
        from app.services.tts_service import tts_service
        from app.services.audio_processor import audio_processor
        
        # Test TTS service invalid ID handling
        result = await tts_service.get_job_status("invalid-id-format")
        assert result is None, "Should return None for invalid job ID"
        
        # Test audio processor info structure
        test_data = b"fake audio data"
        info = audio_processor.get_audio_info(test_data, "test.wav")
        # Should have either duration or error
        assert 'filename' in info, "Should include filename in response"
        
        print(f"✅ Service fixes validated successfully")
        print(f"   - TTS service handles invalid IDs correctly")
        print(f"   - Audio processor returns structured info")
        
        return True
        
    except Exception as e:
        print(f"❌ Service fixes test failed: {e}")
        return False

async def test_mongodb_imports():
    """Test MongoDB model imports work correctly"""
    print("📁 Testing MongoDB Imports...")
    
    try:
        from app.models.mongo.user import User, SubscriptionTier
        from app.models.mongo.voice_sample import VoiceSample
        from app.models.mongo.voice_model import VoiceModel
        from app.models.mongo.tts_job import TTSJob
        
        # Test that we can reference the classes
        assert User is not None, "User model should be importable"
        assert VoiceSample is not None, "VoiceSample model should be importable"
        assert VoiceModel is not None, "VoiceModel model should be importable"
        assert TTSJob is not None, "TTSJob model should be importable"
        assert SubscriptionTier is not None, "SubscriptionTier enum should be importable"
        
        print(f"✅ MongoDB imports validated successfully")
        print(f"   - All model classes imported correctly")
        print(f"   - Enums and types available")
        
        return True
        
    except Exception as e:
        print(f"❌ MongoDB imports test failed: {e}")
        return False

async def run_enhanced_validation():
    """Run all validation tests"""
    print("🚀 Starting Enhanced Dashboard & Auth Validation")
    print("=" * 60)
    
    tests = [
        test_mongodb_imports,
        test_dashboard_models,
        test_auth_models,
        test_router_structure,
        test_service_fixes,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            result = await test()
            if result:
                passed += 1
            print()  # Add spacing
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}\n")
    
    print("=" * 60)
    print(f"🏁 Validation Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All validation tests passed!")
        print("✨ Enhanced dashboard and authentication APIs are ready!")
        print("\n📋 Next steps:")
        print("   1. Fix ALLOWED_ORIGINS config parsing for production")
        print("   2. Test with actual frontend integration")
        print("   3. Add comprehensive unit tests")
        print("   4. Deploy to staging environment")
        return True
    else:
        print("⚠️ Some validation tests failed.")
        print("🔍 Check the output above for specific issues.")
        return False

if __name__ == "__main__":
    success = asyncio.run(run_enhanced_validation())
    sys.exit(0 if success else 1)