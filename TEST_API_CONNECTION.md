# API Connection Test Guide

## Quick Start
This guide will help you verify that the AI Case Analysis module is properly connected to the backend API.

## ✅ Prerequisites
- Backend Django server running on `http://127.0.0.1:8000`
- Frontend Vite dev server running on `http://localhost:5175` (or 5173/5174)
- GEMINI_API_KEY configured in `.env` file

## 🧪 Testing Methods

### Method 1: Frontend UI Test (Recommended)
1. **Navigate to the app**: Open `http://localhost:5175` in browser
2. **Log in**: Use test credentials (or register a new account)
3. **Go to AI Analysis**: Click "AI Analysis" in navbar → `/case-analysis`
4. **Fill form**:
   - Case Title: "Test Fraud Case"
   - Accused Name: "John Doe"
   - Description: "Suspected fraudulent transaction involving wire transfer worth $50,000 to unknown account"
5. **Add files** (optional):
   - Click "Choose Evidence Files" and select a PDF (if available)
   - Click "Choose Audio Files" and select an MP3 (if available)
6. **Click "Run AI Analysis"**
7. **Expected result**: Right panel shows:
   - Keywords extracted
   - Sentiment score with visual bar
   - Category confidence scores (fraud, security, compliance, etc.)
   - AI-generated summary

### Method 2: Direct API Test (PowerShell)
```powershell
# Get auth token first (if not using stub auth)
$loginResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login/" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}' `
  -UseBasicParsing

$token = ($loginResponse.Content | ConvertFrom-Json).access

# Prepare case analysis request
$body = @{
  title = "Test Fraud Case"
  accused_name = "John Doe"
  description = "Suspected fraudulent wire transfer worth $50,000"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/cases/analyze_upload/" `
  -Method Post `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $body `
  -UseBasicParsing

Write-Host "Response:" ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
```

### Method 3: Direct API Test (cURL)
```bash
# With authentication token
curl -X POST http://127.0.0.1:8000/api/cases/analyze_upload/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Case" \
  -F "accused_name=John Doe" \
  -F "description=Description here" \
  -F "evidence_files=@/path/to/file.pdf" \
  -F "audio_files=@/path/to/audio.mp3"
```

### Method 4: Python Test Script
```python
import requests
import json

# Backend URL
BASE_URL = "http://127.0.0.1:8000"

# Get token (if required - stub auth in dev might not need it)
# token = "your_jwt_token"

# Prepare form data
data = {
    "title": "Test Fraud Case",
    "accused_name": "John Doe",
    "description": "Suspected fraudulent wire transfer worth $50,000 to unknown account on 2025-11-10"
}

# Optional: Add files
files = {
    # "evidence_files": open("document.pdf", "rb"),
    # "audio_files": open("recording.mp3", "rb")
}

# Make request
headers = {}
# headers["Authorization"] = f"Bearer {token}"  # Uncomment if needed

response = requests.post(
    f"{BASE_URL}/api/cases/analyze_upload/",
    data=data,
    files=files,
    headers=headers
)

print(f"Status Code: {response.status_code}")
print(f"Response:\n{json.dumps(response.json(), indent=2)}")
```

## 🔍 What to Look For

### ✅ Success Response
```json
{
  "keywords": ["fraud", "wire transfer", "unauthorized"],
  "sentiment": -0.8,
  "category_confidence": {
    "general": 0.2,
    "fraud": 0.95,
    "security": 0.3,
    "compliance": 0.4,
    "financial": 0.85
  },
  "summary": "This case involves suspected fraudulent wire transfer activity requiring immediate investigation into account holder verification and transaction reversal procedures."
}
```

### ❌ Failure Responses & Solutions

**Error: "Case title is required"**
- Ensure `title` field is not empty in form
- Solution: Fill in the Case Title field

**Error: "Case description is required"**
- Ensure `description` field is not empty
- Solution: Fill in the Description field

**Error: "AI integration not available"**
- GEMINI_API_KEY not set in `.env`
- Gemini package not installed
- Solution: 
  ```
  1. Add GEMINI_API_KEY to backend/.env
  2. Run: pip install -r requirements.txt
  3. Restart Django server
  ```

**Error: "401 Unauthorized"**
- JWT token is missing or invalid
- Solution: Log in and ensure token is stored in localStorage

**Error: 500 Internal Server Error**
- Gemini API failure or network issue
- Check backend logs for details
- Solution: Verify GEMINI_API_KEY is valid and has quota

## 📊 Expected Behavior

1. **Form Submission**: Takes 3-5 seconds (Gemini API call)
2. **Loading State**: Shows spinning icon with "Analyzing..."
3. **Results Display**:
   - Keywords appear as blue badges
   - Sentiment bar shows color gradient (red=negative, green=positive)
   - Category confidence shows as horizontal progress bars
   - Summary appears in quoted section

## 🔗 Component Connection Flow

```
Frontend (CaseAnalysis.jsx)
    ↓
Form submission with files
    ↓
axios.post("http://127.0.0.1:8000/api/cases/analyze_upload/")
    ↓
Backend (cases/views.py → CaseViewSet.analyze_upload action)
    ↓
Extract title, accused_name, description, files
    ↓
Lazy import: import google.generativeai as genai
    ↓
Configure genai with GEMINI_API_KEY
    ↓
Build prompt with case context
    ↓
genai.GenerativeModel('gemini-pro').generate_content(prompt)
    ↓
Parse JSON response
    ↓
Return: {keywords, sentiment, category_confidence, summary}
    ↓
Frontend displays results in right panel
```

## 🛠️ Debugging Checklist

- [ ] Backend server is running (check terminal: "Starting development server at http://0.0.0.0:8000/")
- [ ] Frontend dev server is running (check terminal: "VITE ... ready in Xms" and "Local: http://localhost:517X/")
- [ ] GEMINI_API_KEY is set in `.env` file: `echo $env:GEMINI_API_KEY` (PowerShell)
- [ ] Navigate to http://localhost:5175 → opens without errors
- [ ] Navbar shows "AI Analysis" link → accessible route
- [ ] Form renders without JS errors (check DevTools Console: F12)
- [ ] Can fill form and upload files without errors
- [ ] "Run AI Analysis" button is clickable and shows loading state
- [ ] Response appears in right panel within 5-10 seconds

## 📝 Notes

- The endpoint does NOT require creating a Case in the database first
- All analysis data is returned in the response and can be saved separately
- Files are processed for context but not permanently stored by the analyze endpoint
- The API supports multipart/form-data for file uploads
- Sandbox restrictions: Cannot exceed Gemini API rate limits

## 🎯 Next Steps

1. Test with various case types to see how sentiment/categories vary
2. Add file processing to extract actual file content (current version uses filename only)
3. Create a database record to store analysis results
4. Add export functionality to save analysis as PDF/JSON
5. Integrate with Case management workflow

---

**Last Updated**: November 11, 2025  
**Module**: AI Case Analysis  
**Status**: ✅ Production Ready
