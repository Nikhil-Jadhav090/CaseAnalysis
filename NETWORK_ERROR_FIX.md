# 🔧 NETWORK ERROR FIX - Complete Troubleshooting Guide

## ❌ Problem You Were Facing
**Network Error** when trying to run AI Analysis on the form.

## ✅ What I Fixed

### 1. **CORS Configuration** (Main Issue)
The backend CORS settings only allowed port 5173, but your frontend was running on **port 5175**.

**File Modified**: `backend/core/settings.py`

**Before**:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Only this port
]
```

**After**:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://localhost:5174",  # Vite fallback
    "http://localhost:5175",  # Vite fallback (where you are)
    "http://localhost:5176",  # Vite fallback
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
]
```

### 2. **Backend Server Restarted**
Django server was restarted with updated CORS settings at 08:18:42

---

## 🚀 What to Do Now

### Step 1: Hard Refresh the Frontend
1. Open your browser: http://localhost:5175
2. Press: **Ctrl + Shift + R** (hard refresh, clears cache)
3. Or: **Ctrl + R** twice quickly

### Step 2: Try the Form Again
1. Navigate to: **AI Analysis** link in navbar
2. Fill the form:
   - Case Title: "State v. Mehta - Online Investment Fraud"
   - Accused Name: "Rohit Mehta"
   - Description: "The complainant, Neha Verma, reported losing ₹75,000 after investing in a fake online stock trading platform promoted through social media ads."
3. Click: **"🚀 Run AI Analysis"**
4. Wait 3-5 seconds for results

### Step 3: Check for Success
You should now see:
- ✅ Keywords extracted (blue badges)
- ✅ Sentiment score with bar
- ✅ Category confidence scores
- ✅ AI-generated summary

---

## 🔍 If You Still Get Network Error

### Check 1: Backend is Running
Open a terminal and verify:
```powershell
# This should show the server is running
curl http://127.0.0.1:8000/
```

### Check 2: Browser Console
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Look for error messages (copy them)
4. Go to **Network** tab
5. Try the form again
6. Look for request to `analyze_upload`
7. Check the response status code

### Check 3: Network Request Details
If request fails:
1. In DevTools → Network tab
2. Click on the failed request
3. Check the "Response" tab
4. Tell me what error message appears

---

## ✅ Verification Steps

Run these checks to ensure everything is working:

### ✓ Check 1: Backend Running
```powershell
Invoke-WebRequest http://127.0.0.1:8000/ -Method Get
# Should return 200 (OK) or redirect
```

### ✓ Check 2: Frontend Running
```powershell
Invoke-WebRequest http://localhost:5175/ -Method Get
# Should return 200 (OK)
```

### ✓ Check 3: API Endpoint Accessible
```powershell
Invoke-WebRequest http://127.0.0.1:8000/api/cases/ -Method Get
# Should return 401 Unauthorized (this is normal - needs auth)
```

### ✓ Check 4: CORS Working
1. Open http://localhost:5175 in browser
2. Press F12 → Console tab
3. Paste this code:
```javascript
fetch('http://127.0.0.1:8000/api/cases/', {
  method: 'GET',
  headers: {'Content-Type': 'application/json'}
})
.then(r => r.text())
.then(t => console.log('Response:', t))
.catch(e => console.log('Error:', e.message))
```
4. If you see "detail: Authentication credentials were not provided" → CORS is working ✓

---

## 🧪 Test the Full Flow

### Option A: Frontend Form Test (Easiest)
1. Go to http://localhost:5175/case-analysis
2. Fill the form with your case details
3. Click "Run AI Analysis"
4. Results should appear in right panel

### Option B: Direct API Test (PowerShell)
```powershell
$body = @{
    title = "State v. Mehta - Online Investment Fraud"
    accused_name = "Rohit Mehta"
    description = "The complainant, Neha Verma, reported losing ₹75,000 after investing in a fake online stock trading platform promoted through social media ads."
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/cases/analyze_upload/" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $($response.Content)"
```

### Option C: Python Test
```python
import requests
import json

response = requests.post(
    "http://127.0.0.1:8000/api/cases/analyze_upload/",
    json={
        "title": "State v. Mehta - Online Investment Fraud",
        "accused_name": "Rohit Mehta",
        "description": "The complainant, Neha Verma, reported losing ₹75,000 after investing in a fake online stock trading platform promoted through social media ads."
    }
)

print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
```

---

## 📋 Common Issues & Solutions

### ❌ "Network Error" (CORS Issue)
**Solution**: 
- ✅ Already fixed! CORS now allows port 5175
- Hard refresh browser: Ctrl+Shift+R

### ❌ "401 Unauthorized"
**Solution**:
- You're not logged in
- Requirement: This is CORRECT - API requires authentication
- Fix: Log in first, then try again

### ❌ "400 Bad Request"
**Solution**:
- Title or description is empty
- Fix: Fill in all required fields
- Ensure title and description are not blank

### ❌ "500 Internal Server Error"
**Solution**:
- GEMINI_API_KEY issue
- Fix: Check `.env` file has valid key
- Current key in `.env`: AIzaSyDEmk1srwQT1u3oBccFVA56K73QPXBUj3U
- Verify key is valid at: https://console.cloud.google.com

### ❌ "Failed to fetch" or Network Timeout
**Solution**:
- Backend might not be running
- Fix: Check terminal shows "Starting development server at http://0.0.0.0:8000/"
- Restart: `python manage.py runserver 0.0.0.0:8000`

---

## 🔐 Important: Gemini API Key Status

Current API key in your `.env`:
```
GEMINI_API_KEY=AIzaSyDEmk1srwQT1u3oBccFVA56K73QPXBUj3U
```

### ✅ API Key is Set (Good!)
The key is already configured in your backend.

### 🔍 Verify API Key is Valid
1. Go to: https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → Credentials
4. Check if the key is active
5. Check quota usage under "Generative AI API"

### ⚠️ If API Key is Invalid
Replace the key:
1. Open: `backend/.env`
2. Get new key from Google Cloud Console
3. Replace line: `GEMINI_API_KEY=your_new_key_here`
4. Restart backend: `python manage.py runserver 0.0.0.0:8000`

---

## 📊 Current Server Status

| Component | Status | Port | URL |
|-----------|--------|------|-----|
| Django Backend | ✅ Running | 8000 | http://localhost:8000 |
| Vite Frontend | ✅ Running | 5175 | http://localhost:5175 |
| CORS | ✅ Fixed | - | Allows 5173-5176 |
| Gemini API | ✅ Configured | - | Using provided key |
| MySQL Database | ✅ Connected | 3306 | CaseAnalysis |

---

## 🎯 Next Actions

1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Navigate** to http://localhost:5175/case-analysis
3. **Fill** the case form
4. **Click** "Run AI Analysis"
5. **Wait** 3-5 seconds
6. **See** results appear!

---

## 📝 If It Still Doesn't Work

Please share:
1. **Browser DevTools Error** (F12 → Console)
2. **Backend Terminal Error** (if any red text)
3. **Network Request Response** (F12 → Network → analyze_upload)
4. **Your exact steps** (what you clicked, what you filled)

---

**TLDR**: 
- ✅ CORS fixed to allow port 5175
- ✅ Gemini API key is configured
- ✅ Backend restarted
- 👉 Now: Hard refresh browser and try again!

---

**Last Updated**: November 11, 2025, 08:18  
**Status**: Ready to test!
