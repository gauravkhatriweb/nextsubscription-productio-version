/**
 * MongoDB Database Connection Configuration
 * 
 * This module handles the connection to MongoDB database using Mongoose.
 * It reads the connection string from environment variables and establishes
 * a connection with proper error handling.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB database
 * 
 * Reads the MongoDB connection string from MONGOOSE_URL environment variable
 * and connects to the database. Exits the process if connection fails.
 * 
 * @throws {Error} If MONGOOSE_URL is not defined or connection fails
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // Get MongoDB connection string from environment variables
        const connectionString = process.env.MONGOOSE_URL;
        
        // Validate that connection string is provided
        if (!connectionString) {
            throw new Error('MONGOOSE_URL environment variable is not defined');
        }
        
        // Connect to MongoDB with Mongoose
        // useNewUrlParser and useUnifiedTopology are legacy options (kept for compatibility)
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // Log successful connection with database name
        console.log(`✅ Connected to MongoDB: ${mongoose.connection.name}`);
    } catch (error) {
        // Log connection error and exit process
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;