# Start the backend and frontend servers
Write-Host "Starting Feel-Lite development environment..." -ForegroundColor Cyan

# Check if the .env files exist
if (-not (Test-Path -Path ".\backend\.env")) {
    Write-Host "Backend .env file not found. Creating from example file..." -ForegroundColor Yellow
    Copy-Item -Path ".\backend\.env.example" -Destination ".\backend\.env"
    Write-Host "Backend .env created. Please update with your configuration values." -ForegroundColor Green
}

if (-not (Test-Path -Path ".\frontend\.env")) {
    Write-Host "Frontend .env file not found. Creating from example file..." -ForegroundColor Yellow
    Copy-Item -Path ".\frontend\.env.example" -Destination ".\frontend\.env"
    Write-Host "Frontend .env created. Please update with your configuration values." -ForegroundColor Green
}

# Start the services using npm script
Write-Host "Starting backend and frontend services..." -ForegroundColor Cyan
npm run dev

# Handle CTRL+C to stop all processes
try {
    Wait-Process -Id $PID
}
catch {
    Write-Host "`nShutting down services..." -ForegroundColor Yellow
}
