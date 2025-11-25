#!/usr/bin/env python
"""
Test registration and login flow to diagnose issues
"""
import os
import sys
import django
import requests
import json
from datetime import datetime

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()
BASE_URL = 'http://127.0.0.1:8000/api'

# Generate unique email
unique_id = int(datetime.now().timestamp() * 1000)
test_email = f'testuser_{unique_id}@example.com'
test_password = 'TestPassword123'

print("=" * 70)
print("REGISTRATION & LOGIN TEST")
print("=" * 70)

print(f"\n1. Testing with unique email: {test_email}")
print("-" * 70)

# Test 1: Register
print("\n▶ Attempting Registration...")
register_payload = {
    'email': test_email,
    'password': test_password,
    'password2': test_password,
    'first_name': 'Test',
    'last_name': 'User',
    'role': 'user'
}

print(f"Request payload: {json.dumps(register_payload, indent=2)}")

try:
    register_response = requests.post(
        f'{BASE_URL}/auth/register/',
        json=register_payload,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {register_response.status_code}")
    print(f"Response: {json.dumps(register_response.json(), indent=2)}")
    
    if register_response.status_code == 201:
        print("✅ Registration SUCCESSFUL")
    else:
        print("❌ Registration FAILED")
        print("\nDetailed Error Info:")
        error_data = register_response.json()
        for field, error in error_data.items():
            print(f"  - {field}: {error}")
        
except Exception as e:
    print(f"❌ Registration ERROR: {e}")

# Test 2: Login
print("\n" + "=" * 70)
print("\n▶ Attempting Login...")
login_payload = {
    'email': test_email,
    'password': test_password
}

print(f"Request payload: {json.dumps(login_payload, indent=2)}")

try:
    login_response = requests.post(
        f'{BASE_URL}/auth/login/',
        json=login_payload,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"Status Code: {login_response.status_code}")
    response_data = login_response.json()
    print(f"Response keys: {list(response_data.keys())}")
    
    if login_response.status_code == 200:
        print("✅ Login SUCCESSFUL")
        print(f"  Access Token: {response_data.get('access', '')[:50]}...")
        print(f"  Refresh Token: {response_data.get('refresh', '')[:50]}...")
    else:
        print("❌ Login FAILED")
        print(f"Response: {json.dumps(response_data, indent=2)}")
        
except Exception as e:
    print(f"❌ Login ERROR: {e}")

# Test 3: Get Profile
if login_response.status_code == 200:
    print("\n" + "=" * 70)
    print("\n▶ Attempting to fetch Profile...")
    access_token = response_data.get('access')
    
    try:
        profile_response = requests.get(
            f'{BASE_URL}/auth/profile/',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        print(f"Status Code: {profile_response.status_code}")
        if profile_response.status_code == 200:
            print("✅ Profile fetch SUCCESSFUL")
            profile_data = profile_response.json()
            print(f"  Email: {profile_data.get('email')}")
            print(f"  Name: {profile_data.get('first_name')} {profile_data.get('last_name')}")
            print(f"  Role: {profile_data.get('role')}")
        else:
            print("❌ Profile fetch FAILED")
            print(f"Response: {json.dumps(profile_response.json(), indent=2)}")
            
    except Exception as e:
        print(f"❌ Profile fetch ERROR: {e}")

# Test 4: Verify user in DB
print("\n" + "=" * 70)
print("\n▶ Verifying user in database...")
try:
    db_user = User.objects.get(email=test_email)
    print(f"✅ User found in database")
    print(f"  Email: {db_user.email}")
    print(f"  Username: {db_user.username}")
    print(f"  Name: {db_user.first_name} {db_user.last_name}")
    print(f"  Role: {db_user.role}")
    print(f"  Is Active: {db_user.is_active}")
except User.DoesNotExist:
    print(f"❌ User NOT found in database")

print("\n" + "=" * 70)
print("TEST COMPLETE")
print("=" * 70)
