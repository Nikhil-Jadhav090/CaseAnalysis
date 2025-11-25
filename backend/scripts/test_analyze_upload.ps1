# Posts a simple form to analyze_upload to verify AI pipeline
param(
    [string]$BaseUrl = "http://127.0.0.1:8000",
    [string]$Country = "India",
    [string]$State = "Maharashtra",
    [string]$City = "Pune",
    [string]$Pincode = "411001"
)

$ErrorActionPreference = 'Stop'

$endpoint = "$BaseUrl/api/cases/analyze_upload/"
Write-Host "POST $endpoint" -ForegroundColor Cyan

# Use curl.exe to simplify multipart/form posting on Windows PowerShell 5.1
& curl.exe -X POST $endpoint `
 -F "title=Sanity check" `
 -F "description=Simple test from script" `
 -F "country=$Country" `
 -F "state=$State" `
 -F "city=$City" `
 -F "pincode=$Pincode"
