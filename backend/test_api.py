"""
API Endpoints Test Script

Tests all CRUD operations for reminders API.
Make sure the backend server is running: uvicorn app.main:app --reload
"""

import requests
from datetime import datetime, timedelta, timezone
import json
from typing import Optional

# Configuration
BASE_URL = "http://localhost:8000/api/v1"
HEADERS = {"Content-Type": "application/json"}

# Test data
def get_future_datetime(hours=2):
    """Get a datetime 2 hours in the future."""
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def print_section(title: str):
    """Print a section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_result(success: bool, message: str):
    """Print test result."""
    icon = "✅" if success else "❌"
    print(f"{icon} {message}")


def test_health_check():
    """Test the health check endpoint."""
    print_section("Test 0: Health Check")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print_result(True, f"Health check passed: {response.json()}")
            return True
        else:
            print_result(False, f"Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_result(False, "Cannot connect to server. Is it running?")
        print("   Start with: uvicorn app.main:app --reload")
        return False


def test_create_reminder():
    """Test creating a reminder."""
    print_section("Test 1: Create Reminder")
    
    reminder_data = {
        "title": "Test Reminder 1",
        "message": "This is a test reminder message",
        "phone_number": "+14155552671",
        "scheduled_datetime": get_future_datetime(2),
        "timezone": "America/Los_Angeles"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/reminders/",
            json=reminder_data,
            headers=HEADERS
        )
        
        if response.status_code == 201:
            reminder = response.json()
            print_result(True, f"Created reminder with ID: {reminder['id']}")
            print(f"   Title: {reminder['title']}")
            print(f"   Status: {reminder['status']}")
            print(f"   Scheduled: {reminder['scheduled_datetime']}")
            return reminder['id']
        else:
            print_result(False, f"Failed to create: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return None


def test_list_reminders():
    """Test listing reminders."""
    print_section("Test 2: List All Reminders")
    
    try:
        response = requests.get(f"{BASE_URL}/reminders/")
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Found {data['total']} reminders")
            print(f"   Page: {data['page']}")
            print(f"   Page size: {data['page_size']}")
            
            for reminder in data['reminders']:
                print(f"   - {reminder['title']} ({reminder['status']})")
            return True
        else:
            print_result(False, f"Failed to list: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_get_reminder(reminder_id: str):
    """Test getting a specific reminder."""
    print_section("Test 3: Get Specific Reminder")
    
    try:
        response = requests.get(f"{BASE_URL}/reminders/{reminder_id}")
        
        if response.status_code == 200:
            reminder = response.json()
            print_result(True, f"Retrieved reminder: {reminder['title']}")
            print(f"   ID: {reminder['id']}")
            print(f"   Message: {reminder['message']}")
            print(f"   Phone: {reminder['phone_number']}")
            print(f"   Status: {reminder['status']}")
            return True
        else:
            print_result(False, f"Failed to get: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_filter_by_status():
    """Test filtering reminders by status."""
    print_section("Test 4: Filter by Status")
    
    try:
        response = requests.get(
            f"{BASE_URL}/reminders/",
            params={"status": "scheduled"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Found {data['total']} scheduled reminders")
            return True
        else:
            print_result(False, f"Failed to filter: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_search_reminders():
    """Test searching reminders."""
    print_section("Test 5: Search Reminders")
    
    try:
        response = requests.get(
            f"{BASE_URL}/reminders/",
            params={"search": "test"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Search found {data['total']} results")
            return True
        else:
            print_result(False, f"Failed to search: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_update_reminder(reminder_id: str):
    """Test updating a reminder."""
    print_section("Test 6: Update Reminder")
    
    update_data = {
        "title": "Updated Test Reminder",
        "message": "This message has been updated"
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/reminders/{reminder_id}",
            json=update_data,
            headers=HEADERS
        )
        
        if response.status_code == 200:
            reminder = response.json()
            print_result(True, f"Updated reminder: {reminder['title']}")
            print(f"   New message: {reminder['message']}")
            return True
        else:
            print_result(False, f"Failed to update: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_sorting():
    """Test sorting reminders."""
    print_section("Test 7: Sort Reminders")
    
    try:
        # Test ascending
        response_asc = requests.get(
            f"{BASE_URL}/reminders/",
            params={"sort": "date_asc"}
        )
        
        # Test descending
        response_desc = requests.get(
            f"{BASE_URL}/reminders/",
            params={"sort": "date_desc"}
        )
        
        if response_asc.status_code == 200 and response_desc.status_code == 200:
            print_result(True, "Sorting works (ascending and descending)")
            return True
        else:
            print_result(False, "Failed to sort")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_pagination():
    """Test pagination."""
    print_section("Test 8: Pagination")
    
    try:
        response = requests.get(
            f"{BASE_URL}/reminders/",
            params={"page": 1, "page_size": 10}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_result(True, f"Pagination works (page {data['page']}, size {data['page_size']})")
            return True
        else:
            print_result(False, f"Failed pagination: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_validation():
    """Test validation errors."""
    print_section("Test 9: Validation")
    
    # Test with past date (should fail)
    past_datetime = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    
    invalid_data = {
        "title": "Invalid Reminder",
        "message": "This should fail",
        "phone_number": "+14155552671",
        "scheduled_datetime": past_datetime,
        "timezone": "America/Los_Angeles"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/reminders/",
            json=invalid_data,
            headers=HEADERS
        )
        
        if response.status_code == 422:
            print_result(True, "Validation correctly rejected past datetime")
            return True
        else:
            print_result(False, f"Validation failed: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def test_delete_reminder(reminder_id: str):
    """Test deleting a reminder."""
    print_section("Test 10: Delete Reminder")
    
    try:
        response = requests.delete(f"{BASE_URL}/reminders/{reminder_id}")
        
        if response.status_code == 204:
            print_result(True, f"Deleted reminder {reminder_id}")
            
            # Verify it's gone
            verify = requests.get(f"{BASE_URL}/reminders/{reminder_id}")
            if verify.status_code == 404:
                print_result(True, "Verified reminder was deleted")
                return True
            else:
                print_result(False, "Reminder still exists after deletion")
                return False
        else:
            print_result(False, f"Failed to delete: {response.status_code}")
            return False
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False


def main():
    """Run all tests."""
    print("\n" + "🧪" * 30)
    print("   API ENDPOINTS TEST SUITE")
    print("🧪" * 30)
    
    # Test 0: Health check
    if not test_health_check():
        print("\n❌ Server is not running. Stopping tests.")
        return
    
    # Test 1: Create
    reminder_id = test_create_reminder()
    if not reminder_id:
        print("\n❌ Cannot continue without a reminder ID")
        return
    
    # Test 2: List all
    test_list_reminders()
    
    # Test 3: Get specific
    test_get_reminder(reminder_id)
    
    # Test 4: Filter
    test_filter_by_status()
    
    # Test 5: Search
    test_search_reminders()
    
    # Test 6: Update
    test_update_reminder(reminder_id)
    
    # Test 7: Sorting
    test_sorting()
    
    # Test 8: Pagination
    test_pagination()
    
    # Test 9: Validation
    test_validation()
    
    # Test 10: Delete
    test_delete_reminder(reminder_id)
    
    print("\n" + "=" * 60)
    print("✅ All API tests completed!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Check API docs: http://localhost:8000/docs")
    print("  2. Mark Phase 1.2 as complete in IMPLEMENTATION.md")
    print("  3. Move on to Phase 2: Vapi Integration")
    print("")


if __name__ == "__main__":
    main()
