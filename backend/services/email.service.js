/**
 * Email Service - Transactional Email Sending
 * 
 * Handles sending transactional emails using Nodemailer with Gmail SMTP.
 * Provides a centralized email sending service for the application.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Email Configuration Constants
 * 
 * Gmail SMTP configuration for sending emails.
 * Uses port 587 with TLS encryption.
 */
const EMAIL_CONFIG = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true, // Requires TLS encryption
};

/**
 * Creates and Configures Email Transporter
 * 
 * Creates a Nodemailer transporter instance with Gmail credentials.
 * Validates that email credentials are configured before creating transporter.
 * 
 * @returns {nodemailer.Transporter} Configured nodemailer transporter
 * @throws {Error} If email credentials are not configured
 */
let cachedTransporter = null;

const createTransporter = () => {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are not configured');
    }

    cachedTransporter = nodemailer.createTransport({
        ...EMAIL_CONFIG,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    return cachedTransporter;
};

/**
 * Sends an Email
 * 
 * Sends an email using the configured transporter.
 * Supports both plain text and HTML content.
 * 
 * @param {string} email - Recipient's email address
 * @param {string} subject - Email subject line
 * @param {string} message - Email body content (HTML supported)
 * @returns {Promise<boolean>} True if email sent successfully
 * @throws {Error} If email sending fails or parameters are invalid
 */
export const sendEmail = async (email, subject, message) => {
    try {
        // Validate input parameters
        if (!email || !subject || !message) {
            throw new Error('Email, subject, and message are required');
        }

        // Create transporter instance
        const transporter = createTransporter();

        // Send email with configured options
        const info = await transporter.sendMail({
            // FIX: Allow configurable from name/address for consistency across environments
            from: process.env.EMAIL_FROM || `Next Subscription Admin <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: message, // Plain text version
            // Add HTML version for better email client compatibility
            html: message.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
        });

        // Log success message
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        // Log error and rethrow with descriptive message
        console.error('Email Service Error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export default sendEmail;
