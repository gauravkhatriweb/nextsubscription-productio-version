# Next Subscription Frontend Environment Variables

Copy this file to `.env` in the frontend directory and update with your actual values.

```env
# Backend API Base URL
# Development: http://localhost:3000
# Production: Update this to your production backend URL
VITE_API_BASE_URL=http://localhost:3000
```

## Instructions

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `VITE_API_BASE_URL` with your backend URL if different from default

3. Restart the development server after creating `.env` file

## Important Notes

- The `.env` file should be in the `frontend` directory
- Do not commit `.env` to version control (already in .gitignore)
- Use `.env.example` as a template for other developers
- The frontend defaults to `http://localhost:3000` if `VITE_API_BASE_URL` is not set

