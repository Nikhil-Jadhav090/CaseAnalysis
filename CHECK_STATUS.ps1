#!/usr/bin/env powershell
# Quick System Status Check
# Run this to verify all components are working

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     AI CASE ANALYSIS - SYSTEM STATUS CHECK               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check 1: Backend Server
Write-Host "1️⃣  Checking Django Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/" -Method Get -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Backend is running on http://127.0.0.1:8000" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is NOT running!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Fix: Run 'python manage.py runserver 0.0.0.0:8000'" -ForegroundColor Yellow
}
Write-Host ""

# Check 2: Frontend Server
Write-Host "2️⃣  Checking Vite Frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5175/" -Method Get -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Frontend is running on http://localhost:5175" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Frontend might not be on 5175" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   💡 Try: http://localhost:5173 or 5174 or 5176" -ForegroundColor Yellow
}
Write-Host ""

# Check 3: API Endpoint
Write-Host "3️⃣  Checking API Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/cases/analyze_upload/" -Method Post `
        -ContentType "application/json" `
        -Body '{"title":"test","description":"test"}' `
        -UseBasicParsing -ErrorAction Stop
    Write-Host "   OK Endpoint is accessible" -ForegroundColor Green
} catch {
    $errorMsg = $_.Exception.Response.StatusCode
    if ($errorMsg -eq 401) {
        Write-Host "   OK Endpoint accessible (401 Unauthorized - requires auth, normal)" -ForegroundColor Green
    } elseif ($errorMsg -eq 400) {
        Write-Host "   OK Endpoint accessible (400 Bad Request - normal for test)" -ForegroundColor Green
    } else {
        Write-Host "   ERROR Endpoint error: $errorMsg" -ForegroundColor Red
    }
}
Write-Host ""

# Check 4: CORS Configuration
Write-Host "4️⃣  Checking CORS Settings..." -ForegroundColor Yellow
$corsFile = "d:\CaseAnalysis\backend\core\settings.py"
if (Test-Path $corsFile) {
    $corsContent = Get-Content $corsFile | Select-String "localhost:517"
    if ($corsContent) {
        Write-Host "   ✅ CORS includes ports 5173-5176" -ForegroundColor Green
        Write-Host "   Found: $($corsContent.Count) port entries" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CORS configuration might be incomplete" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Settings file not found" -ForegroundColor Red
}
Write-Host ""

# Check 5: Gemini API Key
Write-Host "5️⃣  Checking Gemini API Key..." -ForegroundColor Yellow
$envFile = "d:\CaseAnalysis\backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile | Select-String "GEMINI_API_KEY"
    if ($envContent) {
        $keyLine = $envContent.Line
        if ($keyLine -match "GEMINI_API_KEY=") {
            Write-Host "   ✅ GEMINI_API_KEY is configured in .env" -ForegroundColor Green
            $key = $keyLine -replace ".*GEMINI_API_KEY='?(.+?)'?$", '$1'
            $maskedKey = $key.Substring(0, [Math]::Min(10, $key.Length)) + "..."
            Write-Host "   Key (masked): $maskedKey" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️  GEMINI_API_KEY not found in .env" -ForegroundColor Yellow
        Write-Host "   💡 Add: GEMINI_API_KEY=your_api_key_here" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env file not found at $envFile" -ForegroundColor Red
}
Write-Host ""

# Check 6: Database
Write-Host "6️⃣  Checking Database Connection..." -ForegroundColor Yellow
$dbConfig = Select-String -Path "d:\CaseAnalysis\backend\.env" -Pattern "DB_NAME|DB_HOST|DB_USER"
if ($dbConfig) {
    Write-Host "   ✅ Database configured:" -ForegroundColor Green
    $dbConfig | ForEach-Object { Write-Host "      $_" -ForegroundColor Green }
} else {
    Write-Host "   ⚠️  Database config not found" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    NEXT STEPS                             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Hard refresh browser: Ctrl+Shift+R at http://localhost:5175" -ForegroundColor White
Write-Host "2. Navigate to: AI Analysis (in navbar)" -ForegroundColor White
Write-Host "3. Fill the case form with your details" -ForegroundColor White
Write-Host "4. Click 'Run AI Analysis'" -ForegroundColor White
Write-Host "5. Check if results appear in right panel" -ForegroundColor White
Write-Host ""
Write-Host "For more details, read: NETWORK_ERROR_FIX.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
