/**
 * Site Settings Model - Global Site Configuration
 * 
 * Stores site-wide settings including branding, content, and theme.
 * Uses single-row pattern (only one settings document exists).
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

/**
 * Site Settings Schema
 * 
 * Stores all site configuration in a single document.
 * Includes branding, content, and theme settings.
 */
const settingsSchema = new mongoose.Schema({
  // Branding Settings
  siteName: { 
    type: String, 
    default: 'Next Subscription',
    trim: true
  },
  logoUrl: { 
    type: String 
  },
  faviconUrl: { 
    type: String 
  },
  
  // Content Settings
  heroHeadline: { 
    type: String, 
    default: 'Simplify how you manage your subscriptions — securely and beautifully.',
    trim: true
  },
  heroTagline: { 
    type: String, 
    default: 'Take control of your recurring payments with intelligent tracking, automated reminders, and powerful insights — all in one elegant platform.',
    trim: true
  },
  primaryHeading: { 
    type: String, 
    default: 'For Subscribers',
    trim: true
  },
  
  // Theme Settings (stored as JSON object)
  theme: {
    primary: { type: String, default: '#E43636' },
    background: { type: String, default: '#F6EFD2' },
    surface: { type: String, default: '#E2DDB4' },
    text: { type: String, default: '#000000' }
  },
  
  // Metadata
  settingsVersion: { 
    type: Number, 
    default: 1 
  },
  updatedBy: { 
    type: String // Store admin email for now
  },
  
  // Audit trail (array of changes)
  changeHistory: [{
    changedBy: { type: String }, // Store admin email
    changedAt: { type: Date, default: Date.now },
    changes: { type: mongoose.Schema.Types.Mixed }, // Object with field: {old, new}
    changeType: { type: String } // 'branding', 'content', 'theme'
  }]
  
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Static method to get or create settings (singleton pattern)
// Note: We don't need an index on _id - MongoDB already has a unique index on it by default
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this({});
    await settings.save();
  }
  return settings;
};

// Method to record change in audit log
settingsSchema.methods.recordChange = async function(changedBy, changes, changeType) {
  this.changeHistory.push({
    changedBy,
    changedAt: new Date(),
    changes,
    changeType
  });
  // Keep only last 50 changes
  if (this.changeHistory.length > 50) {
    this.changeHistory = this.changeHistory.slice(-50);
  }
  this.settingsVersion += 1;
  this.updatedBy = changedBy;
  return await this.save();
};

const SettingsModel = mongoose.model('Settings', settingsSchema);

export default SettingsModel;

