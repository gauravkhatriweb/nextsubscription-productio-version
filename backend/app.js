/**
 * Next Subscription Backend - Main Application Entry Point
 *
 * Cleaned: removed Redis and Socket code and fixed the catch-all route
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import connectDB from './config/connectDB.js';

// Import routes
import userRoutes from './routes/user.route.js';
import vendorRoutes from './routes/vendor.route.js';
import adminRoutes from './routes/admin.route.js';
import adminVendorRoutes from './routes/admin.vendor.route.js';
import adminProductRequestRoutes from './routes/admin.productRequest.route.js';
import adminStockRequestRoutes from './routes/admin.stockRequests.route.js';
import adminSettingsRoutes from './routes/admin.settings.route.js';
import adminSystemRoutes from './routes/admin.system.route.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`⚠️  CORS blocked origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/vendors', adminVendorRoutes);
app.use('/api/admin/product-requests', adminProductRequestRoutes);
app.use('/api/admin/stock-requests', adminStockRequestRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/system', adminSystemRoutes);

if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Next Subscription Backend API',
    version: '2.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: NODE_ENV
    };

    try {
      await mongoose.connection.db.admin().ping();
      health.mongodb = 'connected';
    } catch (error) {
      health.mongodb = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});



/**
 * 404 catch-all — must be after all routes but before error handler
 */
app.use((req, res) => {
  // Log unmatched routes in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚠️  Route not found: ${req.method} ${req.originalUrl}`);
  }
  
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler (after routes and 404)
 */
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', {
    message: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(err.status || 500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Internal server error' : err.message,
    error: NODE_ENV === 'development' ? { stack: err.stack, details: err } : undefined
  });
});

/**
 * Validate critical environment variables
 */
const validateEnvVars = () => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const warnings = [];
  
  required.forEach(key => {
    if (!process.env[key]) {
      console.error(`❌ CRITICAL: ${key} environment variable is not set!`);
      process.exit(1);
    }
  });
  
  // FIX: Enforce strong encryption key at startup to avoid runtime password failures
  const rawKey = process.env.ENCRYPTION_KEY;
  const keyError = (() => {
    if (!rawKey) {
      return 'ENCRYPTION_KEY environment variable is missing. Generate a 32-byte key (e.g. node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))") and add it to your .env file.';
    }

    const trimmed = rawKey.trim();
    let buffer;

    try {
      if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
        buffer = Buffer.from(trimmed, 'hex');
      } else if (/^[A-Za-z0-9+/]{43}=*$/.test(trimmed)) {
        buffer = Buffer.from(trimmed, 'base64');
      } else {
        buffer = Buffer.from(trimmed, 'utf8');
      }
    } catch (error) {
      return `ENCRYPTION_KEY could not be parsed: ${error.message}`;
    }

    if (!buffer || buffer.length < 32) {
      return 'ENCRYPTION_KEY must resolve to at least 32 bytes. Use 32 ASCII chars, a 64-character hex string, or a 44-character base64 value.';
    }

    return null;
  })();

  if (keyError) {
    console.error(`❌ CRITICAL: ${keyError}`);
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(w));
  }
};

/**
 * Start server (no Redis, no Socket.IO)
 */
const startServer = async () => {
  // Validate environment variables before starting
  validateEnvVars();
  
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
✅ Next Subscription Backend Server Status:
   • Environment: ${NODE_ENV}
   • Port: ${PORT}
   • URL: http://localhost:${PORT}
   • Health Check: http://localhost:${PORT}/
   • Timestamp: ${new Date().toISOString()}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

/**
 * Process event handlers
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err?.message || err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err?.message || err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
