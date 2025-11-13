# Next Subscription Backend - Source Code

This directory contains the main source code for the Next Subscription backend API.

## Directory Structure

```
src/
├── config/          # Environment configuration, database connections, constants
├── models/          # Mongoose schemas and database models
├── controllers/     # Route handlers (HTTP request/response logic)
├── services/         # Business logic (non-HTTP operations)
├── routes/          # Express route definitions
├── middleware/      # Request validation, authentication, error handling
├── utils/           # Helper functions and common utilities
├── templates/       # Email templates and static content
├── tests/           # Backend unit and integration tests
└── app.js           # Express application setup
```

## Entry Point

The application entry point is `../server.js` which imports and starts the Express app from `app.js`.

## Import Paths

All imports use relative paths within the `src/` directory. For example:
- Controllers import from `../models/`, `../services/`
- Routes import from `../controllers/`, `../middleware/`
- Services import from `../models/`, `../utils/`

## Environment Variables

Required environment variables are validated at startup. See `config/env.js` for details.

## Database

MongoDB connection is managed in `config/connectDB.js`. Models are defined in `models/`.

## API Routes

All API routes are registered in `app.js` and defined in `routes/`. Routes are organized by feature:
- `/api/users` - User authentication and profile management
- `/api/vendor` - Vendor operations
- `/api/admin/*` - Admin-only operations

