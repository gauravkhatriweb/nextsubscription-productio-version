/**
 * FILE: server.js
 * PURPOSE: Application entry point - initializes server and database connection
 * AUTHOR: Next Subscription Engineering
 * UPDATED: 2025-11-14
 */

import app from './src/app.js';
import connectDB, { disconnectDB } from './src/config/connectDB.js';
import { validateEnvVars, getEnvConfig } from './src/config/env.js';

// CONFIG: Get environment configuration
const env = getEnvConfig();
const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

/**
 * SERVER: Start server and establish database connection
 */
const startServer = async () => {
  // CONFIG: Validate environment variables before starting
  validateEnvVars();
  
  try {
    // CONFIG: Connect to MongoDB
    await connectDB();

    // SERVER: Start Express server
    app.listen(PORT, () => {
      console.log(`
✅ Next Subscription Backend Server Status:
   • Environment: ${NODE_ENV}
   • Port: ${PORT}
   • URL: http://localhost:${PORT}
   • Health Check: http://localhost:${PORT}/health
   • Timestamp: ${new Date().toISOString()}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

/**
 * SERVER: Graceful shutdown handler
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  try {
    await disconnectDB();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error.message);
    process.exit(1);
  }
};

// PROCESS: Event handlers for unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err?.message || err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err?.message || err);
  process.exit(1);
});

// PROCESS: Graceful shutdown on SIGTERM and SIGINT
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// SERVER: Start the server
startServer();

