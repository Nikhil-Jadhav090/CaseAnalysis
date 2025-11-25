#!/usr/bin/env python3
"""
Quick System Status Check for AI Case Analysis Module
"""

import requests
import json
from pathlib import Path

def check_backend():
    """Check if Django backend is running"""
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=3)
        return True, "Running", response.status_code
    except Exception as e:
        return False, str(e), None

def check_frontend():
    """Check if Vite frontend is running"""
    try:
        response = requests.get("http://localhost:5175/", timeout=3)
        return True, "Running", response.status_code
    except Exception as e:
        return False, str(e), None

def check_api_endpoint():
    """Check if API endpoint is accessible"""
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/cases/analyze_upload/",
            json={"title": "test", "description": "test"},
            timeout=3
        )
        return True, "Accessible", response.status_code
    except Exception as e:
        if "401" in str(e) or "Unauthorized" in str(e):
            return True, "Accessible (requires auth)", 401
        return False, str(e), None

def check_env_file():
    """Check if .env has Gemini API key"""
    env_file = Path("backend/.env")
    if env_file.exists():
        content = env_file.read_text()
        if "GEMINI_API_KEY" in content:
            # Find the key line
            for line in content.split('\n'):
                if "GEMINI_API_KEY=" in line:
                    key_part = line.split("=")[1].strip("'\"")
                    masked = key_part[:10] + "..." if len(key_part) > 10 else "SET"
                    return True, "Configured", masked
            return True, "Found but empty", "EMPTY"
        return False, "Not found in .env", None
    return False, ".env file not found", None

def main():
    print("\n" + "="*60)
    print("AI CASE ANALYSIS - SYSTEM STATUS CHECK")
    print("="*60 + "\n")
    
    # Check 1: Backend
    print("[1] Django Backend Server")
    status, msg, code = check_backend()
    symbol = "[OK]" if status else "[FAIL]"
    print(f"    {symbol} http://127.0.0.1:8000")
    print(f"    Status: {msg}" if status else f"    Error: {msg}")
    if code:
        print(f"    HTTP Code: {code}\n")
    else:
        print()
    
    # Check 2: Frontend
    print("[2] Vite Frontend Server")
    status, msg, code = check_frontend()
    symbol = "[OK]" if status else "[CHECK]"
    print(f"    {symbol} http://localhost:5175")
    print(f"    Status: {msg}")
    if code:
        print(f"    HTTP Code: {code}\n")
    else:
        print("    Try: http://localhost:5173 or 5174 if 5175 not available\n")
    
    # Check 3: API Endpoint
    print("[3] API Endpoint")
    status, msg, code = check_api_endpoint()
    symbol = "[OK]" if status else "[FAIL]"
    print(f"    {symbol} POST /api/cases/analyze_upload/")
    print(f"    Status: {msg}")
    if code:
        print(f"    HTTP Code: {code}\n")
    else:
        print(f"    Error: {msg}\n")
    
    # Check 4: Gemini API Key
    print("[4] Gemini API Key")
    status, msg, key = check_env_file()
    symbol = "[OK]" if status else "[WARNING]"
    print(f"    {symbol} {msg}")
    if key:
        print(f"    Key: {key}\n")
    else:
        print()
    
    # Summary
    print("="*60)
    print("NEXT STEPS:")
    print("="*60)
    print("1. Hard refresh browser: Ctrl+Shift+R at http://localhost:5175")
    print("2. Navigate to: AI Analysis (in navbar)")
    print("3. Fill case form with your details")
    print("4. Click 'Run AI Analysis'")
    print("5. Check if results appear in right panel")
    print()
    print("For detailed troubleshooting, read: NETWORK_ERROR_FIX.md")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
