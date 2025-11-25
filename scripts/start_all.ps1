# Orchestrates starting the backend (Django) with venv and the frontend (Vite) in separate terminals
param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = 'Stop'

function Start-Backend {
    $backendScript = Join-Path $PSScriptRoot '..\backend\scripts\start_backend.ps1'
    if (!(Test-Path $backendScript)) { throw "Backend start script not found: $backendScript" }
    Write-Host "Launching backend window..." -ForegroundColor Cyan
    Start-Process powershell.exe -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy','Bypass',
        '-File', $backendScript,
        '-Port', $BackendPort
    ) -WindowStyle Normal | Out-Null
}

function Start-Frontend {
    $frontendDir = Join-Path $PSScriptRoot '..\frontend'
    if (!(Test-Path $frontendDir)) { throw "Frontend directory not found: $frontendDir" }
    Write-Host "Launching frontend window (Vite)..." -ForegroundColor Cyan
    $cmd = "Set-Location -Path `"$frontendDir`"; npm run dev -- --port $FrontendPort"
    Start-Process powershell.exe -ArgumentList @('-NoExit','-Command', $cmd) -WindowStyle Normal | Out-Null
}

Start-Backend
Start-Frontend

Write-Host "\nAll set!" -ForegroundColor Green
Write-Host "- Backend: http://127.0.0.1:$BackendPort/" -ForegroundColor Gray
Write-Host "- Frontend: http://localhost:$FrontendPort/ (Vite will auto-pick next port if busy)" -ForegroundColor Gray
Write-Host "If the frontend shows a different port (e.g., 5174), use that in your browser." -ForegroundColor DarkGray
