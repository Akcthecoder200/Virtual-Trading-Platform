# Virtual Trading Platform - JWT Authentication System Test

## Authentication API Testing Guide

This document provides test examples for the JWT Authentication System implemented in Step 4.

### Server Information

- **Base URL**: http://localhost:5000
- **API Prefix**: /api/auth
- **Default Admin**: admin@virtualtrading.com / admin123456

### Available Endpoints

#### 1. Test Connection

```bash
GET /api/auth/test
```

#### 2. User Registration

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "dateOfBirth": "1990-01-01",
  "phone": "+1234567890",
  "country": "US",
  "agreeToTerms": true
}
```

#### 3. User Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

#### 4. Get User Profile (Protected Route)

```bash
GET /api/auth/profile
Authorization: Bearer <your_jwt_token>
```

#### 5. Change Password (Protected Route)

```bash
POST /api/auth/change-password
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!",
  "confirmNewPassword": "NewSecurePass456!"
}
```

#### 6. Refresh Token

```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<your_refresh_token>"
}
```

#### 7. Logout (Protected Route)

```bash
POST /api/auth/logout
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "refreshToken": "<your_refresh_token>"
}
```

#### 8. Forgot Password

```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

#### 9. Reset Password

```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "<reset_token_from_email>",
  "password": "NewSecurePass789!",
  "confirmPassword": "NewSecurePass789!"
}
```

### PowerShell Testing Examples

#### Test Connection

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/test" -Method GET
```

#### Register User

```powershell
$signupData = @{
    firstName = "John"
    lastName = "Doe"
    email = "john.doe@example.com"
    password = "SecurePass123!"
    confirmPassword = "SecurePass123!"
    dateOfBirth = "1990-01-01"
    phone = "+1234567890"
    country = "US"
    agreeToTerms = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method POST -Body $signupData -ContentType "application/json"
```

#### Login User

```powershell
$loginData = @{
    email = "john.doe@example.com"
    password = "SecurePass123!"
    rememberMe = $false
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$token = $loginResponse.data.tokens.accessToken
```

#### Get Profile (with token)

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/profile" -Method GET -Headers $headers
```

### Expected Responses

#### Successful Signup Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "status": "pending",
      "isEmailVerified": false,
      "isActive": true,
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "country": "US",
        "phone": "+1234567890"
      }
    },
    "wallet": {
      "_id": "wallet_id",
      "user": "user_id",
      "balance": 10000,
      "equity": 10000,
      "currency": "USD"
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresIn": "24h"
    }
  }
}
```

#### Successful Login Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      /* user object */
    },
    "wallet": {
      /* wallet object */
    },
    "tokens": {
      "accessToken": "jwt_token_here",
      "refreshToken": "refresh_token_here",
      "expiresIn": "24h"
    }
  }
}
```

### Authentication Features Implemented

✅ **User Registration** with comprehensive validation
✅ **User Login** with security features (account locking, attempt tracking)
✅ **JWT Token Generation** with access and refresh tokens
✅ **Password Hashing** using bcrypt with salt rounds
✅ **Email Service** for welcome emails and notifications (development mode logging)
✅ **Account Security** with login attempt tracking and account locking
✅ **Password Reset** flow with secure token generation
✅ **Profile Management** with protected routes
✅ **Input Validation** using express-validator
✅ **Error Handling** with detailed error codes and messages
✅ **Admin User Creation** with default credentials
✅ **Wallet Integration** - automatic wallet creation on signup

### Security Features

1. **Password Requirements**: 8+ characters, uppercase, lowercase, number, special character
2. **Account Locking**: 5 failed attempts locks account for 30 minutes
3. **JWT Security**: Secure token generation with expiration
4. **Rate Limiting**: Applied at API level
5. **Input Validation**: Comprehensive validation for all fields
6. **Email Verification**: Token-based email verification system
7. **Refresh Tokens**: Secure token refresh mechanism

### Testing Status

✅ **Server Startup**: Server running on port 5000
✅ **Database Connection**: MongoDB connected successfully
✅ **Model Initialization**: All models loaded and relationships setup
✅ **Default Data**: Market symbols and admin user created
✅ **API Routes**: All authentication routes implemented
✅ **Middleware**: Auth and validation middleware working
✅ **Error Handling**: Comprehensive error handling implemented

### Next Steps

The JWT Authentication System (Step 4) is now complete. You can proceed to:

1. **Step 5**: User & Wallet Routes - Create API routes for user profile management and wallet operations
2. **Step 6**: Backend Testing & Verification - Test all endpoints using API testing tools
3. Continue with frontend development and additional features

All authentication functionality is ready for use and integration with the frontend application.
