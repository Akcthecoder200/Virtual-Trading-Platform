# Backend API Testing Script
# Virtual Trading Platform - Step 6: Backend Testing & Verification

Write-Host "🚀 Starting Backend API Tests..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET
    Write-Host "✅ Health Check: PASSED" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Cyan
    Write-Host "   Database Connected: $($health.database.connected)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Route Availability
Write-Host "`n2. Testing Route Availability..." -ForegroundColor Yellow

$routes = @(
    @{name="Auth"; url="http://localhost:5000/api/auth/test"},
    @{name="Users"; url="http://localhost:5000/api/users/test"},
    @{name="Wallet"; url="http://localhost:5000/api/wallet/test"}
)

foreach ($route in $routes) {
    try {
        $result = Invoke-RestMethod -Uri $route.url -Method GET
        Write-Host "✅ $($route.name) Routes: PASSED" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($route.name) Routes: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Authentication - Login with Admin
Write-Host "`n3. Testing Admin Login..." -ForegroundColor Yellow
$adminLogin = @{
    email = "admin@virtualtrading.com"
    password = "admin123456"
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResult = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $adminLogin -ContentType "application/json"
    Write-Host "✅ Admin Login: PASSED" -ForegroundColor Green
    $global:adminToken = $loginResult.data.tokens.accessToken
    Write-Host "   User: $($loginResult.data.user.firstName) $($loginResult.data.user.lastName)" -ForegroundColor Cyan
    Write-Host "   Email: $($loginResult.data.user.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($loginResult.data.user.role)" -ForegroundColor Cyan
    Write-Host "   Wallet Balance: `$$($loginResult.data.wallet.balance)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Admin Login: FAILED" -ForegroundColor Red
    try {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
        Write-Host "   Error Code: $($errorContent.error.code)" -ForegroundColor Red
        Write-Host "   Error Message: $($errorContent.error.message)" -ForegroundColor Red
    } catch {
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Protected Routes (if login successful)
if ($global:adminToken) {
    Write-Host "`n4. Testing Protected Routes..." -ForegroundColor Yellow
    $headers = @{ "Authorization" = "Bearer $global:adminToken" }
    
    # Test User Profile
    try {
        $profile = Invoke-RestMethod -Uri "http://localhost:5000/api/users/profile" -Method GET -Headers $headers
        Write-Host "✅ User Profile: PASSED" -ForegroundColor Green
        Write-Host "   Profile loaded for: $($profile.data.user.email)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ User Profile: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Wallet Balance
    try {
        $wallet = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/balance" -Method GET -Headers $headers
        Write-Host "✅ Wallet Balance: PASSED" -ForegroundColor Green
        Write-Host "   Balance: `$$($wallet.data.wallet.balance)" -ForegroundColor Cyan
        Write-Host "   Currency: $($wallet.data.wallet.currency)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Wallet Balance: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test Wallet Transactions
    try {
        $transactions = Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/transactions" -Method GET -Headers $headers
        Write-Host "✅ Wallet Transactions: PASSED" -ForegroundColor Green
        Write-Host "   Transaction Count: $($transactions.data.transactions.Count)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Wallet Transactions: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Input Validation
Write-Host "`n5. Testing Input Validation..." -ForegroundColor Yellow

# Test invalid login
$invalidLogin = @{
    email = "invalid-email"
    password = ""
} | ConvertTo-Json

try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $invalidLogin -ContentType "application/json"
    Write-Host "❌ Input Validation: FAILED (should have rejected invalid data)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq "BadRequest") {
        Write-Host "✅ Input Validation: PASSED" -ForegroundColor Green
        Write-Host "   Correctly rejected invalid input" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Input Validation: FAILED" -ForegroundColor Red
        Write-Host "   Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Unauthorized Access
Write-Host "`n6. Testing Unauthorized Access..." -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:5000/api/users/profile" -Method GET
    Write-Host "❌ Unauthorized Access: FAILED (should require authentication)" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq "Unauthorized") {
        Write-Host "✅ Unauthorized Access: PASSED" -ForegroundColor Green
        Write-Host "   Correctly blocked unauthenticated request" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Unauthorized Access: FAILED" -ForegroundColor Red
        Write-Host "   Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=================================" -ForegroundColor Green
Write-Host "🎯 Backend API Testing Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green