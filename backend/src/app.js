/**
 * FILE: app.js
 * PURPOSE: Express application setup and middleware configuration
 * AUTHOR: Next Subscription Engineering
 * UPDATED: 2025-11-14
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// CONFIG: Import configuration
import { getEnvConfig } from './config/env.js';
import { UPLOAD_LIMITS } from './config/constants.js';

// ROUTES: Import route handlers
import userRoutes from './routes/user.route.js';
import vendorRoutes from './routes/vendor.route.js';
import adminRoutes from './routes/admin.route.js';
import adminVendorRoutes from './routes/admin.vendor.route.js';
import adminProductRequestRoutes from './routes/admin.productRequest.route.js';
import adminStockRequestRoutes from './routes/admin.stockRequests.route.js';
import adminSettingsRoutes from './routes/admin.settings.route.js';
import adminSystemRoutes from './routes/admin.system.route.js';

// CONTROLLERS: Import health controller
import { getHealth } from './controllers/health.controller.js';

// MIDDLEWARE: Import middleware
import metricsMiddleware from './middleware/metrics.middleware.js';

// CONFIG: Get environment configuration
const env = getEnvConfig();
const NODE_ENV = env.NODE_ENV;

// APP: Initialize Express application
const app = express();

// CORS: Configure CORS with allowed origins
const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://localhost:5173'
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

// SECURITY: Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// MIDDLEWARE: Body parsing with limits
app.use(express.json({ limit: UPLOAD_LIMITS.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: UPLOAD_LIMITS.URL_ENCODED_LIMIT }));
app.use(cookieParser());

// MIDDLEWARE: Metrics tracking for API requests
app.use(metricsMiddleware);

// STATIC: Serve uploads directory
app.use('/uploads', express.static('uploads'));

// ROUTES: API endpoint registration
app.use('/api/users', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/vendor', adminVendorRoutes);
app.use('/api/admin/product-requests', adminProductRequestRoutes);
app.use('/api/admin/stock-requests', adminStockRequestRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/system', adminSystemRoutes);

// SECURITY: Production security headers
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// ROUTES: Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Next Subscription Backend API',
    version: '2.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ROUTES: Health check endpoints
app.get('/api/health', getHealth);
app.get('/health', getHealth); // Backward compatibility

// ERROR HANDLING: 404 catch-all (must be after all routes but before error handler)
app.use((req, res) => {
  // Log unmatched routes in development
  if (NODE_ENV === 'development') {
    console.log(`⚠️  Route not found: ${req.method} ${req.originalUrl}`);
  }
  
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ERROR HANDLING: Global error handler (after routes and 404)
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

export default app;

