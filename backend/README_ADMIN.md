# Admin One-Time-Code Login System

## Overview

This admin authentication system provides a secure, production-grade login flow using one-time secret codes emailed exclusively to the authorized admin. The system is designed to prevent unauthorized access while maintaining ease of use for the legitimate administrator.

## Features

- **One-Time Secret Codes**: Cryptographically secure 20-30 character codes
- **Email-Only Delivery**: Codes sent exclusively to `ADMIN_EMAIL`
- **Short TTL**: Codes expire after 10 minutes (configurable)
- **Rate Limiting**: Protection against brute force and enumeration attacks
- **Secure Hashing**: Codes are hashed with bcrypt before storage
- **Attempt Tracking**: Codes invalidated after max failed attempts
- **Comprehensive Logging**: All attempts logged for security monitoring

## Environment Variables

Add these to your `.env` file:

```env
# Admin Configuration
ADMIN_EMAIL=gauravkhatriweb@gmail.com
ADMIN_CODE_TTL_MINUTES=10
ADMIN_CODE_LENGTH_MIN=20
ADMIN_CODE_LENGTH_MAX=30
ADMIN_MAX_REQUESTS_PER_HOUR=6

# Email Configuration (existing)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Configuration (existing)
JWT_SECRET=your-secret-key

# Frontend URL (if needed for email links)
FRONTEND_BASE_URL=http://localhost:5173
```

## API Endpoints

### 1. Request Admin Code

**POST** `/api/admin/request-code`

Request a one-time admin access code.

**Request Body:**
```json
{
  "email": "gauravkhatriweb@gmail.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Secret code sent to admin email"
}
```

**Error Responses:**
- `403 Forbidden`: Email does not match `ADMIN_EMAIL`
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Rate Limit:** 6 requests per hour per IP address

### 2. Verify Admin Code

**POST** `/api/admin/verify-code`

Verify the one-time code and receive an admin JWT token.

**Request Body:**
```json
{
  "email": "gauravkhatriweb@gmail.com",
  "code": "your-20-30-character-code"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Admin authenticated",
  "token": "jwt-token-here"
}
```

The server also sets an HTTP-only cookie named `adminToken` for secure session management.

**Error Responses:**
- `400 Bad Request`: Invalid or expired code
- `403 Forbidden`: Invalid email or code
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

**Rate Limit:** 20 verification attempts per hour per IP address

### 3. Get Admin Info

**GET** `/api/admin/me`

Get authenticated admin information (requires admin token).

**Headers:**
```
Authorization: Bearer <admin-token>
```
or
```
Cookie: adminToken=<admin-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "admin": {
    "email": "gauravkhatriweb@gmail.com",
    "role": "admin"
  }
}
```

## Security Features

### Code Generation
- Uses `crypto.randomBytes()` for cryptographically secure randomness
- Ensures character diversity (uppercase, lowercase, digits, special chars)
- Random length between `ADMIN_CODE_LENGTH_MIN` and `ADMIN_CODE_LENGTH_MAX`

### Code Storage
- Codes are hashed with bcrypt (12 salt rounds) before storage
- Plaintext codes are never stored in the database
- MongoDB TTL index automatically cleans up expired codes

### Rate Limiting
- Request code endpoint: 6 requests/hour per IP
- Verify code endpoint: 20 attempts/hour per IP
- In-memory store (consider Redis for production scaling)

### Attempt Tracking
- Failed verification attempts are tracked
- Codes invalidated after 5 failed attempts
- Prevents brute force attacks

### Email Security
- Codes sent only to `ADMIN_EMAIL` (enforced by backend)
- Email includes security warnings
- No clickable links in code emails

## Usage Flow

1. **Admin visits** `/admin` on frontend
2. **Enters email** (must match `ADMIN_EMAIL`)
3. **Backend validates** email and generates secure code
4. **Code emailed** to `ADMIN_EMAIL` only
5. **Admin receives email** with one-time code
6. **Admin enters code** on frontend
7. **Backend verifies** code and issues JWT token
8. **Frontend redirects** to `/admin/dashboard`

## Testing

### Manual Testing Steps

1. **Request Code with Correct Email:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/request-code \
     -H "Content-Type: application/json" \
     -d '{"email":"gauravkhatriweb@gmail.com"}'
   ```
   - Should return 200
   - Check email inbox for code

2. **Request Code with Wrong Email:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/request-code \
     -H "Content-Type: application/json" \
     -d '{"email":"wrong@email.com"}'
   ```
   - Should return 403 Forbidden

3. **Verify Correct Code:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/verify-code \
     -H "Content-Type: application/json" \
     -d '{"email":"gauravkhatriweb@gmail.com","code":"your-code-here"}'
   ```
   - Should return 200 with token

4. **Verify Wrong Code:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/verify-code \
     -H "Content-Type: application/json" \
     -d '{"email":"gauravkhatriweb@gmail.com","code":"wrong-code"}'
   ```
   - Should return 400 Bad Request

5. **Test Rate Limiting:**
   - Make 7 requests to `/request-code` within an hour
   - 7th request should return 429 Too Many Requests

## Production Considerations

### Recommended Enhancements

1. **Redis for Rate Limiting**: Replace in-memory store with Redis for distributed rate limiting
2. **IP Whitelisting**: Optionally whitelist admin IP addresses
3. **2FA Integration**: Consider adding second factor authentication
4. **Audit Logging**: Store all admin actions in an audit log
5. **Session Management**: Implement token refresh mechanism
6. **Email Service**: Use dedicated email service (SendGrid, AWS SES, etc.)
7. **Monitoring**: Set up alerts for suspicious activity
8. **HTTPS**: Ensure all communication uses TLS in production

### Security Checklist

- [x] Cryptographically secure code generation
- [x] Code hashing before storage
- [x] Short TTL (10 minutes)
- [x] Rate limiting on all endpoints
- [x] Attempt tracking and invalidation
- [x] Email-only delivery to `ADMIN_EMAIL`
- [x] HTTP-only cookies for token storage
- [x] Comprehensive logging
- [ ] Redis for distributed rate limiting (recommended)
- [ ] IP whitelisting (optional)
- [ ] Audit logging (recommended)

## File Structure

```
backend/
  models/
    adminCode.model.js          # Admin code database model
  controllers/
    admin.controller.js         # Admin authentication controllers
  services/
    adminCode.service.js        # Code generation and verification
  routes/
    admin.route.js              # Admin API routes
  middleware/
    adminAuth.middleware.js     # Admin JWT verification
    rateLimitAdmin.js           # Rate limiting middleware
  templates/
    adminEmail.template.js      # Email template
```

## Troubleshooting

### Email Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASS` are set correctly
- Check Gmail App Password is configured (not regular password)
- Verify SMTP settings in `email.service.js`

### Code Not Working
- Check code hasn't expired (10 minute TTL)
- Verify code was copied exactly (case-sensitive)
- Check if code was already used (one-time use)
- Verify attempts haven't exceeded limit (5 max)

### Rate Limit Issues
- Wait for rate limit window to reset (1 hour)
- Check IP address isn't blocked
- Review rate limit configuration in `.env`

## Support

For issues or questions, contact the development team or refer to the main backend README.

---

## 🛰️ System Monitoring & Performance Tab

### Overview

The System Monitoring tab provides real-time system health metrics, performance monitoring, and maintenance controls for the admin dashboard. This is a visual health console only — no destructive commands are available.

### Features

- **Live System Metrics**: CPU, memory, disk usage, API latency, database latency
- **Real-time Updates**: Auto-refresh every 30 seconds (toggleable)
- **System Health Status**: Visual indicators for healthy, warning, and critical states
- **Maintenance Actions**: Safe system operations (cache refresh, database ping, API health checks)
- **System Logs**: Real-time log viewer with error tracking
- **Audit Trail**: All admin actions logged for security monitoring

### API Endpoints

#### 1. Get System Status

**GET** `/api/admin/system/status`

Returns current system metrics.

**Headers:**
```
Authorization: Bearer <admin-token>
```
or
```
Cookie: adminToken=<admin-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "cpuUsage": "15%",
    "memoryUsage": "62%",
    "diskUsage": "48%",
    "apiLatency": "180ms",
    "dbLatency": "72ms",
    "activeUsers": 142,
    "uptime": "99.98%",
    "lastChecked": "2025-11-07T08:30:00Z",
    "status": "healthy"
  }
}
```

**Status Values:**
- `healthy`: All metrics within normal range
- `warning`: Some metrics approaching thresholds
- `critical`: Metrics exceed critical thresholds

#### 2. Get System Logs

**GET** `/api/admin/system/logs?limit=50`

Returns recent system logs and errors.

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "logs": [
    {
      "timestamp": "2025-11-07T08:30:00Z",
      "level": "info",
      "message": "refresh-cache - success",
      "details": { "message": "Cache flushed successfully" }
    }
  ]
}
```

#### 3. Refresh Cache

**POST** `/api/admin/system/refresh-cache`

Flushes cached data (in-memory or Redis if available).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cache refreshed successfully",
  "executionTime": "523ms"
}
```

**Rate Limit:** 5 actions per minute per IP address

#### 4. Ping Database

**POST** `/api/admin/system/ping-database`

Verifies database connection and returns response time.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Database connection healthy",
  "latency": "72ms",
  "connected": true,
  "executionTime": "75ms"
}
```

**Rate Limit:** 5 actions per minute per IP address

#### 5. Ping API Endpoints

**POST** `/api/admin/system/ping-api`

Pings internal API endpoints and returns latency map.

**Success Response (200):**
```json
{
  "success": true,
  "message": "API endpoints checked",
  "endpoints": [
    {
      "name": "User API",
      "path": "/api/users",
      "latency": "45ms",
      "status": "healthy"
    }
  ],
  "executionTime": "156ms"
}
```

**Rate Limit:** 5 actions per minute per IP address

#### 6. System Diagnostics

**POST** `/api/admin/system/diagnostics`

Runs comprehensive system diagnostics.

**Success Response (200):**
```json
{
  "success": true,
  "message": "System diagnostics completed",
  "diagnostics": {
    "database": { "connected": true, "latency": "72ms" },
    "system": { "cpuUsage": "15%", "memoryUsage": "62%" },
    "timestamp": "2025-11-07T08:30:00Z"
  },
  "executionTime": "234ms"
}
```

**Rate Limit:** 5 actions per minute per IP address

### Security

- All endpoints require admin authentication (`verifyAdminJWT` middleware)
- Rate limiting on all maintenance actions (5 actions/minute)
- All actions logged in audit trail (`SystemAction` model)
- No sensitive internal information exposed (no keys, IPs, or secrets)
- IP tracking for security monitoring

### Frontend Components

The System Monitoring tab consists of:

- **SystemMonitoring.jsx**: Main dashboard page
- **SystemCard.jsx**: Reusable metric cards with status indicators
- **MetricChart.jsx**: Animated progress bars for CPU/memory/disk
- **MaintenanceActions.jsx**: Interactive buttons for system actions
- **LogViewer.jsx**: Scrollable console-style log viewer

### Usage

1. Navigate to `/admin/monitoring` in the admin dashboard
2. View real-time system metrics (auto-refreshes every 30 seconds)
3. Use maintenance buttons to perform system checks
4. Monitor system logs in the log viewer
5. Toggle auto-refresh on/off as needed

### Maintenance Actions

All maintenance actions are safe and non-destructive:

- **Flush Cache**: Clears cached data (does not affect database)
- **Recheck Database**: Verifies database connection (read-only)
- **Ping API Endpoints**: Health checks for API routes (read-only)
- **System Diagnostics**: Comprehensive system health check (read-only)

### Status Thresholds

- **CPU Usage**: 
  - Healthy: < 70%
  - Warning: 70-90%
  - Critical: > 90%

- **Memory Usage**:
  - Healthy: < 70%
  - Warning: 70-90%
  - Critical: > 90%

- **API Latency**:
  - Healthy: < 300ms
  - Warning: 300-500ms
  - Critical: > 500ms

- **Database Latency**:
  - Healthy: < 100ms
  - Warning: 100-200ms
  - Critical: > 200ms

### File Structure

```
backend/
  models/
    systemAction.model.js          # Audit trail for system actions
  controllers/
    admin.system.controller.js     # System monitoring controllers
  services/
    systemMonitoring.service.js    # System metrics collection
  routes/
    admin.system.route.js          # System monitoring API routes
  middleware/
    rateLimitSystem.js             # Rate limiting for system actions
frontend/src/pages/admin/system-monitoring/
  SystemMonitoring.jsx            # Main dashboard
  SystemCard.jsx                  # Metric cards
  MetricChart.jsx                  # Progress bars
  MaintenanceActions.jsx           # Action buttons
  LogViewer.jsx                    # Log display
```

### Notes

- This is a **visual health console only** — no destructive commands
- All metrics are collected in real-time from the system
- System actions are logged for audit purposes
- Rate limiting prevents abuse of maintenance endpoints
- Auto-refresh can be toggled on/off by the admin

---

**Version:** 1.1  
**Last Updated:** 2025  
**Author:** Gaurav Khatri

