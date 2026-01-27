"""
Test script for Vapi integration.

Run this to verify that your Vapi credentials are working correctly.
"""

import asyncio
import sys
from app.services.vapi_service import vapi_service


async def test_vapi_call():
    """Test making a call with Vapi."""
    
    print("🧪 Testing Vapi Integration")
    print("=" * 50)
    print()
    
    # Test phone number (replace with your number for testing)
    # Use E.164 format: +1234567890
    test_phone = input("Enter your phone number for testing (E.164 format, e.g., +1234567890): ").strip()
    
    if not test_phone.startswith('+'):
        print("❌ Phone number must start with + (E.164 format)")
        return False
    
    test_message = "This is a test reminder from your Call Me Reminder app."
    test_reminder_id = "test-123"
    
    print(f"\n📞 Attempting to call: {test_phone}")
    print(f"📝 Message: {test_message}")
    print()
    
    try:
        # Attempt to create a call
        result = await vapi_service.create_call(
            phone_number=test_phone,
            message=test_message,
            reminder_id=test_reminder_id,
            title="Test Reminder"
        )
        
        print("✅ Call initiated successfully!")
        print(f"Call ID: {result.get('id')}")
        print(f"Status: {result.get('status')}")
        print()
        
        # Get call details
        call_id = result.get('id')
        if call_id:
            print("📊 Fetching call status...")
            status = await vapi_service.get_call_status(call_id)
            print(f"Current status: {status.get('status')}")
            print()
        
        print("🎉 Vapi integration test PASSED!")
        print()
        print("Next steps:")
        print("1. Check your phone for the test call")
        print("2. Verify the message was delivered correctly")
        print("3. Proceed with Phase 2.2 in IMPLEMENTATION.md")
        
        return True
        
    except Exception as e:
        print(f"❌ Test FAILED: {str(e)}")
        print()
        print("Common issues:")
        print("- Check that VAPI_API_KEY is correct in .env")
        print("- Check that VAPI_PHONE_NUMBER_ID is correct in .env")
        print("- Ensure phone number is in E.164 format (+1234567890)")
        print("- Verify your Vapi account has sufficient credits")
        print("- Check Vapi dashboard for any API errors")
        
        return False


async def test_configuration():
    """Test that Vapi is configured correctly."""
    
    print("🔧 Checking Vapi Configuration")
    print("=" * 50)
    print()
    
    from app.core.config import settings
    
    print(f"API Key: {'✅ Set' if settings.VAPI_API_KEY else '❌ Missing'}")
    print(f"Phone Number ID: {'✅ Set' if settings.VAPI_PHONE_NUMBER_ID else '❌ Missing'}")
    print(f"Base URL: {settings.VAPI_BASE_URL}")
    print()
    
    if not settings.VAPI_API_KEY or not settings.VAPI_PHONE_NUMBER_ID:
        print("❌ Vapi credentials are missing!")
        print("Please update backend/.env with:")
        print("  VAPI_API_KEY=your_private_key")
        print("  VAPI_PHONE_NUMBER_ID=your_phone_number_id")
        return False
    
    print("✅ Configuration looks good!")
    print()
    return True


async def main():
    """Run all tests."""
    
    # Test configuration first
    config_ok = await test_configuration()
    if not config_ok:
        sys.exit(1)
    
    # Test actual call
    call_ok = await test_vapi_call()
    if not call_ok:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
