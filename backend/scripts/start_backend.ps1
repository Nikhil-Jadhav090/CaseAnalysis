# Starts Django with the project venv and prevents autoreloader from switching interpreters
param(
    [int]$Port = 8000
)

$ErrorActionPreference = 'Stop'

function Stop-PortProcess {
    param([int]$Port)
    try {
        $pid = (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue).OwningProcess
        if ($pid) {
            Write-Host "Stopping existing process on port $Port (PID $pid)..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Start-Sleep -Seconds 1
        }
    } catch {}
}

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$venvPython = Join-Path $root 'venv2\Scripts\python.exe'
$managePy   = Join-Path $root 'manage.py'

if (!(Test-Path $venvPython)) { throw "Venv Python not found at $venvPython" }
if (!(Test-Path $managePy))   { throw "manage.py not found at $managePy" }

Stop-PortProcess -Port $Port

Write-Host "Starting Django with: $venvPython" -ForegroundColor Cyan
& $venvPython $managePy runserver --noreload
