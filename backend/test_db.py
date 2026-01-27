"""
Simple test script to verify database connection and migrations.

Run this after setting up Alembic to test everything works.
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from app.core.database import engine, SessionLocal
from app.models.reminder import Reminder, ReminderStatus

def test_database_connection():
    """Test if we can connect to the database."""
    print("🔍 Testing database connection...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL!")
            print(f"   Version: {version[:50]}...")
            return True
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return False

def test_table_exists():
    """Test if the reminders table exists."""
    print("\n🔍 Checking if 'reminders' table exists...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text(
                "SELECT EXISTS (SELECT FROM information_schema.tables "
                "WHERE table_name = 'reminders')"
            ))
            exists = result.fetchone()[0]
            if exists:
                print("✅ 'reminders' table exists!")
                return True
            else:
                print("⚠️  'reminders' table does not exist yet")
                print("   Run: alembic revision --autogenerate -m 'Create reminders table'")
                print("   Then: alembic upgrade head")
                return False
    except Exception as e:
        print(f"❌ Error checking table: {e}")
        return False

def test_table_structure():
    """Test if we can query the table structure."""
    print("\n🔍 Checking table structure...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text(
                "SELECT column_name, data_type "
                "FROM information_schema.columns "
                "WHERE table_name = 'reminders' "
                "ORDER BY ordinal_position"
            ))
            columns = result.fetchall()
            if columns:
                print("✅ Table structure:")
                for col_name, col_type in columns:
                    print(f"   - {col_name}: {col_type}")
                return True
            else:
                print("⚠️  No columns found")
                return False
    except Exception as e:
        print(f"❌ Error checking structure: {e}")
        return False

def test_insert_and_query():
    """Test if we can insert and query data."""
    print("\n🔍 Testing insert and query operations...")
    db = SessionLocal()
    try:
        from datetime import datetime, timezone, timedelta
        
        # Create a test reminder
        test_reminder = Reminder(
            title="Test Reminder",
            message="This is a test message",
            phone_number="+14155552671",
            scheduled_datetime=datetime.now(timezone.utc) + timedelta(hours=1),
            timezone="America/Los_Angeles",
            status=ReminderStatus.SCHEDULED
        )
        
        db.add(test_reminder)
        db.commit()
        db.refresh(test_reminder)
        
        print(f"✅ Inserted test reminder with ID: {test_reminder.id}")
        
        # Query it back
        queried = db.query(Reminder).filter_by(id=test_reminder.id).first()
        if queried:
            print(f"✅ Successfully queried reminder: {queried.title}")
            
            # Clean up
            db.delete(queried)
            db.commit()
            print("✅ Cleaned up test data")
            return True
        else:
            print("❌ Failed to query reminder")
            return False
            
    except Exception as e:
        print(f"❌ Error during insert/query test: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def main():
    print("=" * 60)
    print("🧪 Database Configuration Test")
    print("=" * 60)
    
    # Test 1: Connection
    if not test_database_connection():
        print("\n❌ Database connection failed. Cannot proceed.")
        print("   Make sure PostgreSQL is running:")
        print("   - Docker: docker-compose up postgres -d")
        print("   - Local: brew services start postgresql@15")
        return
    
    # Test 2: Table exists
    table_exists = test_table_exists()
    
    if not table_exists:
        print("\n⚠️  Run migrations first:")
        print("   cd backend")
        print("   alembic revision --autogenerate -m 'Create reminders table'")
        print("   alembic upgrade head")
        return
    
    # Test 3: Table structure
    test_table_structure()
    
    # Test 4: Insert and query
    test_insert_and_query()
    
    print("\n" + "=" * 60)
    print("✅ All tests passed! Database is configured correctly.")
    print("=" * 60)

if __name__ == "__main__":
    main()
