# NextSubscription - Setup Instructions

## ⚠️ MongoDB Connection Required

The backend server requires a MongoDB database connection. You have two options:

### Option 1: Use MongoDB Atlas (Recommended - Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (Free M0 tier)
4. Create a database user with a password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
7. Update `/tmp/cc-agent/60591773/project/backend/.env`:
   ```
   MONGOOSE_URL=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/nextsubscription?retryWrites=true&w=majority
   ```

### Option 2: Install MongoDB Locally

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

## 🚀 Starting the Application

Once MongoDB is configured:

### Backend (Terminal 1)
```bash
cd /tmp/cc-agent/60591773/project/backend
npm start
```

Backend will run on: http://localhost:3000

### Frontend (Terminal 2)
```bash
cd /tmp/cc-agent/60591773/project/frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## 📧 Email Configuration (Optional)

To enable email notifications, update in `/tmp/cc-agent/60591773/project/backend/.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note:** For Gmail, you need to create an [App Password](https://support.google.com/accounts/answer/185833).

## 🔑 Admin Access

- Admin Email: `admin@nextsubscription.com`
- Login at: http://localhost:5173/admin
- Request a one-time code via email (requires EMAIL configuration)

## 🌐 Default Ports

- Backend API: http://localhost:3000
- Frontend UI: http://localhost:5173
- MongoDB: mongodb://localhost:27017 (if running locally)

## 📝 Environment Variables

Backend (`.env` already created at `/tmp/cc-agent/60591773/project/backend/.env`):
- ✅ JWT_SECRET - Generated
- ✅ ENCRYPTION_KEY - Generated
- ⚠️ MONGOOSE_URL - Needs configuration
- ⚠️ EMAIL_USER - Optional
- ⚠️ EMAIL_PASS - Optional

Frontend uses `/tmp/cc-agent/60591773/project/.env`:
- ✅ VITE_API_BASE_URL - Set to http://localhost:3000
- ✅ Supabase credentials - Already configured

## 🔍 Health Check

Once running, check backend health:
```bash
curl http://localhost:3000/health
```

## 📚 API Documentation

Base URL: http://localhost:3000/api

Key Endpoints:
- `/api/users/*` - User operations
- `/api/vendor/*` - Vendor operations
- `/api/admin/*` - Admin operations

See the analysis report for full API mapping.
