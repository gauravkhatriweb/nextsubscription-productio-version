# Next Subscription — Backend

**Version:** 1.0  
**Author:** Gaurav Khatri

---

## 📋 Description

The Next Subscription backend is a RESTful API built with Node.js and Express.js that provides customer authentication, profile management, and email notification services. The backend uses MongoDB for data persistence and implements JWT-based authentication with secure password hashing and OTP verification systems.

### Key Features

- ✅ User registration and authentication
- ✅ JWT-based session management
- ✅ Email verification via OTP
- ✅ Password reset functionality
- ✅ Profile picture upload and management
- ✅ Secure file upload handling
- ✅ Email notification service
- ✅ Health check endpoints
- ✅ CORS configuration
- ✅ Error handling middleware

---

## 🏗️ Project Structure

```
backend/
├── app.js                      # Main application entry point
├── config/
│   └── connectDB.js           # MongoDB database connection configuration
├── controllers/
│   └── customer.controller.js # Customer-related business logic handlers
├── middleware/
│   ├── auth.middleware.js     # JWT authentication middleware
│   └── upload.middleware.js   # File upload handling middleware
├── models/
│   └── customer.model.js     # Customer/user data model schema
├── routes/
│   └── user.route.js          # API route definitions
├── services/
│   └── email.service.js      # Email sending service
├── templates/
│   └── userEmail.template.js # Email HTML templates
└── uploads/                   # Directory for uploaded profile pictures
```

### Folder Breakdown

- **`config/`**: Contains database and external service connection configurations
- **`controllers/`**: Contains request handlers that process business logic and return responses
- **`middleware/`**: Contains Express middleware functions for authentication, file uploads, and error handling
- **`models/`**: Contains Mongoose schemas defining data structures and database models
- **`routes/`**: Contains route definitions that map URLs to controller functions
- **`services/`**: Contains reusable service functions like email sending
- **`templates/`**: Contains HTML email templates for various notifications
- **`uploads/`**: Stores uploaded user profile pictures

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance)
- Gmail account with App Password (for email service)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment variables file**
   
   Create a `.env` file in the `backend/` directory with the following variables:
   
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   MONGOOSE_URL=mongodb://localhost:27017/nextsubscription
   
   # JWT Secret Key (generate a strong random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   
   # Email Service Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the server**
   ```bash
   npm start
   # or
   node app.js
   ```

   The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port number | No | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | No | `development` |
| `MONGOOSE_URL` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `CORS_ORIGIN` | Allowed frontend origin URL | No | `http://localhost:5173` |
| `EMAIL_USER` | Gmail account for sending emails | Yes | - |
| `EMAIL_PASS` | Gmail App Password (not regular password) | Yes | - |

---

## 📡 API Routes Documentation

### Base URL

All API routes are prefixed with `/api/customers` except for health check endpoints.

### Public Routes (No Authentication Required)

#### 1. Register User

**Endpoint:** `POST /api/customers/register`

**Description:** Creates a new customer account.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "customer": {
    "_id": "...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isAccountVerified": false,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors (missing fields, invalid email format, password too short)
- `409 Conflict`: Email already exists

---

#### 2. Login User

**Endpoint:** `POST /api/customers/login`

**Description:** Authenticates a user and returns a JWT token (also set as HTTP-only cookie).

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "customer": {
    "_id": "...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "isAccountVerified": false,
    "profilePic": null
  },
  "token": "jwt-token-here"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid email or password

---

#### 3. Send Password Reset OTP

**Endpoint:** `POST /api/customers/send-reset-password-otp`

**Description:** Sends a password reset OTP to the user's email address.

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset OTP sent successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Email is required
- `404 Not Found`: No account found with this email

---

#### 4. Reset Password

**Endpoint:** `POST /api/customers/reset-password`

**Description:** Resets user password using OTP verification.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields, invalid OTP, expired OTP, or password same as current
- `404 Not Found`: User not found

---

### Protected Routes (Authentication Required)

All protected routes require a valid JWT token in either:
- **Cookie:** `accessToken` (HTTP-only cookie)
- **Header:** `Authorization: Bearer <token>`

---

#### 5. Logout User

**Endpoint:** `POST /api/customers/logout`

**Description:** Logs out the authenticated user and clears the access token cookie.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User logged out successfully",
  "customer": {
    "_id": "...",
    "firstname": "John",
    ...
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

#### 6. Get User Profile

**Endpoint:** `GET /api/customers/profile`

**Description:** Retrieves the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "customer": {
    "_id": "...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "profilePic": "/uploads/profile-pictures/user123_1234567890.jpg",
    "isAccountVerified": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

#### 7. Send Verification OTP

**Endpoint:** `POST /api/customers/send-verification-otp`

**Description:** Sends an account verification OTP to the user's email.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification OTP sent successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Account already verified
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

#### 8. Verify OTP

**Endpoint:** `POST /api/customers/verify-otp`

**Description:** Verifies the user's account using the OTP sent to their email.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account verified successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid OTP or expired OTP
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

#### 9. Check Authentication Status

**Endpoint:** `POST /api/customers/is-authenticated`

**Description:** Verifies if the current user is authenticated (middleware-protected endpoint).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User is authenticated"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

#### 10. Upload Profile Picture

**Endpoint:** `POST /api/customers/upload-profile-pic`

**Description:** Uploads a profile picture for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `profilePic`: Image file (JPG, JPEG, PNG, max 2MB)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "profilePic": "/uploads/profile-pictures/user123_1234567890.jpg"
}
```

**Error Responses:**
- `400 Bad Request`: No file uploaded, invalid file type, or file too large
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

#### 11. Update Profile Picture

**Endpoint:** `PUT /api/customers/update-profile-pic`

**Description:** Updates the user's existing profile picture (replaces old one).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `profilePic`: Image file (JPG, JPEG, PNG, max 2MB)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile picture updated successfully",
  "profilePic": "/uploads/profile-pictures/user123_1234567890.jpg"
}
```

**Error Responses:**
- `400 Bad Request`: No file uploaded, invalid file type, or file too large
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

#### 12. Delete Profile Picture

**Endpoint:** `DELETE /api/customers/delete-profile-pic`

**Description:** Deletes the user's profile picture.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: No profile picture to delete
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

### Utility Endpoints

#### Health Check

**Endpoint:** `GET /`

**Description:** Returns API status and version information.

**Response (200 OK):**
```json
{
  "success": true,
  "service": "Sawari.pk Backend API",
  "version": "2.0.0",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

#### Health Status

**Endpoint:** `GET /health`

**Description:** Returns detailed health status including MongoDB connection status.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345.67,
  "environment": "development",
  "mongodb": "connected"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "degraded",
  "mongodb": "disconnected"
}
```

---

## 🔐 Authentication Flow

### Registration Flow

1. User submits registration form with `firstname`, `lastname`, `email`, and `password`
2. Backend validates input fields
3. Checks if email already exists (customer or captain)
4. Hashes password using bcrypt
5. Creates new customer record in database
6. Generates JWT token
7. Sends welcome email
8. Returns customer data and token

### Login Flow

1. User submits email and password
2. Backend validates input
3. Finds customer by email
4. Compares password with hashed password
5. Generates JWT token
6. Sets token as HTTP-only cookie and returns in response
7. Returns customer data and token

### Token Handling

- **Generation:** JWT tokens are generated using `jwt.sign()` with user ID and secret key
- **Expiration:** Tokens expire after 1 day
- **Storage:** Tokens are stored in HTTP-only cookies (secure in production)
- **Validation:** Middleware extracts token from cookie or Authorization header and verifies it
- **Refresh:** Currently, users must log in again when token expires

### Middleware Checks

The `verifyUserJWT` middleware:
1. Extracts token from cookie or Authorization header
2. Verifies token signature using JWT_SECRET
3. Finds user in database using decoded user ID
4. Attaches user object to `req.customer` for use in controllers
5. Returns 401 if token is invalid, expired, or user not found

---

## 🗄️ Database Models

### Customer Model (`customer.model.js`)

**Collection Name:** `users`

**Schema Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstname` | String | Yes | User's first name (min 3 characters) |
| `lastname` | String | Yes | User's last name (min 3 characters) |
| `email` | String | Yes | User's email address (unique, validated) |
| `password` | String | Yes | Hashed password (not selected by default) |
| `profilePic` | String | No | Path to profile picture file |
| `isAccountVerified` | Boolean | No | Account verification status (default: false) |
| `verifyOtp` | String | No | OTP for account verification |
| `verifyOtpExpiry` | Date | No | Expiry time for verification OTP |
| `forgotPasswordOtp` | String | No | OTP for password reset |
| `forgotPasswordOtpExpiry` | Date | No | Expiry time for password reset OTP |
| `socketId` | String | No | Socket.IO connection ID (for real-time features) |
| `createdAt` | Date | Auto | Timestamp when record was created |
| `updatedAt` | Date | Auto | Timestamp when record was last updated |

**Model Methods:**

- `hashPassword(password)`: Static method to hash passwords using bcrypt
- `comparePassword(password)`: Instance method to compare plain password with hashed password
- `generateToken()`: Instance method to generate JWT token for authentication

**Indexes:**

- Unique index on `email` field

---

## ⚠️ Error Handling & Responses

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional array of validation errors
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, DELETE requests |
| `201` | Created | Successful POST request (resource created) |
| `400` | Bad Request | Validation errors, invalid input |
| `401` | Unauthorized | Missing or invalid authentication token |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists (e.g., duplicate email) |
| `500` | Internal Server Error | Server-side errors |
| `503` | Service Unavailable | Database connection issues |

### Common Error Messages

- **Validation Errors:** Array of field-specific error messages
- **Authentication Errors:** "Unauthorized request - No token provided" or "Invalid or expired access token"
- **Not Found Errors:** "User not found" or "No account found with this email"
- **Conflict Errors:** "User with this email already exists"
- **Server Errors:** "Internal server error" (detailed error in development mode)

---

## 📧 Email Service

The backend uses Nodemailer with Gmail SMTP to send transactional emails:

### Email Types

1. **Welcome Email:** Sent after successful registration
2. **Verification OTP Email:** Sent when user requests account verification
3. **Password Reset OTP Email:** Sent when user requests password reset

### Email Configuration

- **SMTP Host:** smtp.gmail.com
- **SMTP Port:** 587
- **Security:** TLS required
- **Authentication:** Uses Gmail App Password (not regular password)

### Email Templates

All email templates are HTML-based and located in `templates/userEmail.template.js`. They include:
- Modern, responsive design
- Branded styling
- OTP codes displayed prominently
- Expiry time information
- Support contact information

---

## 🔒 Security Features

1. **Password Hashing:** All passwords are hashed using bcrypt (10 rounds)
2. **JWT Tokens:** Secure token-based authentication
3. **HTTP-Only Cookies:** Tokens stored in HTTP-only cookies to prevent XSS attacks
4. **CORS Configuration:** Whitelist-based CORS policy
5. **Input Validation:** Server-side validation for all inputs
6. **File Upload Limits:** 2MB file size limit for profile pictures
7. **File Type Validation:** Only image files (JPG, JPEG, PNG) allowed
8. **Security Headers:** Production mode includes security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
9. **OTP Expiry:** OTPs expire after 10 minutes
10. **Error Message Sanitization:** Detailed errors only shown in development mode

---

## 📁 File Upload

### Profile Picture Upload

- **Storage Location:** `uploads/profile-pictures/`
- **File Naming:** `{userId}_{timestamp}.{ext}`
- **File Size Limit:** 2MB
- **Allowed Types:** JPG, JPEG, PNG
- **Automatic Cleanup:** Old profile pictures are automatically deleted when updating

### Upload Middleware

The `upload.middleware.js` handles:
- File validation (type and size)
- Unique filename generation
- Directory creation
- Error handling for upload failures

---

## 🛠️ Development Notes

### Dependencies

- **express:** Web framework for Node.js
- **mongoose:** MongoDB ODM (Object Data Modeling)
- **jsonwebtoken:** JWT token generation and verification
- **bcryptjs:** Password hashing library
- **nodemailer:** Email sending service
- **multer:** File upload handling middleware
- **cookie-parser:** Cookie parsing middleware
- **cors:** Cross-Origin Resource Sharing middleware
- **dotenv:** Environment variable management

### File Structure Best Practices

- Controllers handle business logic and database operations
- Routes define API endpoints and middleware chains
- Models define data structures and database schemas
- Middleware handles cross-cutting concerns (auth, uploads, errors)
- Services contain reusable utility functions

### Environment-Specific Behavior

- **Development Mode:** Detailed error messages and stack traces
- **Production Mode:** Generic error messages, security headers enabled

---

## 🧪 Testing

Currently, the backend does not include automated tests. For testing endpoints:

1. Use Postman or similar API testing tool
2. Start the server: `npm start`
3. Test endpoints using the API documentation above
4. Check MongoDB for data persistence
5. Verify email delivery in the configured email account

---

---

## ✅ Integration Note

**Status:** ✅ **FULLY INTEGRATED WITH FRONTEND**

The backend API is now successfully connected to the Next Subscription frontend application. All API routes are tested and fully functional.

### Integration Summary

- ✅ **Frontend Connection:** Frontend configured to communicate with backend at `http://localhost:3000`
- ✅ **CORS Configuration:** Backend accepts requests from `http://localhost:5173` (Vite default port)
- ✅ **Authentication:** JWT tokens work seamlessly with frontend session management
- ✅ **Cookie Support:** HTTP-only cookies configured for secure token storage
- ✅ **All Endpoints Tested:** Login, Register, Profile, OTP, Password Reset all working
- ✅ **Error Handling:** Standardized error responses compatible with frontend error handling

### Frontend Integration Details

**Frontend URL:** `http://localhost:5173` (development)  
**Backend URL:** `http://localhost:3000` (default)

**Environment Variable Required:**
- Frontend `.env`: `VITE_API_BASE_URL=http://localhost:3000`
- Backend `.env`: `CORS_ORIGIN=http://localhost:5173`

### Verified Integration Points

1. ✅ **Registration:** Frontend sends registration data → Backend creates user → Returns token
2. ✅ **Login:** Frontend sends credentials → Backend validates → Returns token + user data
3. ✅ **Profile Fetch:** Frontend requests profile → Backend validates token → Returns user data
4. ✅ **OTP Verification:** Frontend sends OTP → Backend validates → Updates verification status
5. ✅ **Password Reset:** Frontend requests OTP → Backend sends email → Frontend resets password
6. ✅ **File Upload:** Frontend uploads profile picture → Backend saves file → Returns path

### Request/Response Format Compatibility

All endpoints follow consistent JSON structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "customer": { ... },
  "token": "jwt-token-here"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional for validation errors
}
```

### CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite default port)
- `http://localhost:3000` (Backend port)
- Custom origin via `CORS_ORIGIN` environment variable

**Credentials:** Enabled (`credentials: true`) to support HTTP-only cookies

### Session Management

- **Token Storage:** Frontend stores tokens in localStorage/sessionStorage
- **Token Transmission:** Sent via `Authorization: Bearer <token>` header
- **Cookie Support:** Backend also sets HTTP-only cookies for additional security
- **Token Expiration:** 7 days (configured in backend)

### Integration Version

**Version:** 1.0  
**Made by:** Gaurav Khatri  
**Integration Date:** January 2025

---

## 📝 Notes

- Ensure MongoDB is running before starting the server
- Gmail App Password must be generated from Google Account settings (not regular password)
- OTP codes are 6-digit numbers
- JWT tokens expire after 1 day
- Profile pictures are served statically from `/uploads` route

---

## 📄 Version Information

**Version:** 1.0  
**Made by:** Gaurav Khatri  
**Last Updated:** 2024

---

## 📞 Support

For questions or issues, please contact:
- **Email:** support@nextsubscription.com
- **GitHub:** [Project Repository](https://github.com/gauravkhatriweb)

---

## 📜 License

This project is proprietary software developed by Gaurav Khatri.

---

**Thank you for using Next Subscription Backend! 🚀**

