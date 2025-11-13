# Configuration

This directory contains configuration files for the Next Subscription backend.

## Files

- **constants.js** - Centralized constants (status codes, roles, limits, etc.)
- **env.js** - Environment variable validation and configuration
- **connectDB.js** - MongoDB database connection management

## Usage

```javascript
import { HTTP_STATUS, USER_ROLES } from './config/constants.js';
import { getEnvConfig, validateEnvVars } from './config/env.js';
import connectDB from './config/connectDB.js';
```

## Environment Variables

Required variables:
- `JWT_SECRET` - Secret key for JWT token signing
- `MONGOOSE_URL` - MongoDB connection string
- `ENCRYPTION_KEY` - 32-byte encryption key for sensitive data

Optional variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

