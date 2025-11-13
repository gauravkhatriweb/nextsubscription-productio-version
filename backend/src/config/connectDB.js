/**
 * FILE: connectDB.js
 * PURPOSE: MongoDB database connection configuration and management
 * AUTHOR: Next Subscription Engineering
 * UPDATED: 2025-11-14
 */

import mongoose from 'mongoose';

/**
 * CONFIG: Establishes connection to MongoDB database
 * 
 * Reads the MongoDB connection string from MONGOOSE_URL environment variable
 * and connects to the database. Exits the process if connection fails.
 * 
 * @throws {Error} If MONGOOSE_URL is not defined or connection fails
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // CONFIG: Get MongoDB connection string from environment variables
        const connectionString = process.env.MONGOOSE_URL;
        
        // CONFIG: Validate that connection string is provided
        if (!connectionString) {
            throw new Error('MONGOOSE_URL environment variable is not defined');
        }
        
        // CONFIG: Connect to MongoDB with Mongoose
        // useNewUrlParser and useUnifiedTopology are legacy options (kept for compatibility)
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // CONFIG: Log successful connection with database name
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
    } catch (error) {
        // CONFIG: Log connection error and exit process
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

/**
 * CONFIG: Gracefully close database connection
 * Used during server shutdown
 */
export const disconnectDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error.message);
    }
};

export default connectDB;

