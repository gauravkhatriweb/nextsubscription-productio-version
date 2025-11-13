/**
 * System Action Model - Audit Trail for Admin System Actions
 * 
 * Logs all admin system maintenance actions for audit purposes.
 * 
 * @author Gaurav Khatri
 * @version 1.0
 */

import mongoose from 'mongoose';

const systemActionSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'refresh-cache',
      'ping-database',
      'ping-api',
      'system-diagnostics',
      'flush-cache',
      'logs-cleared',
      'user-maintenance',
      'global-cleanup',
      'maintenance-user-stats',
      'reindex-collections',
      'storage-health-check',
      'restart-workers',
      'purge-expired-sessions',
      'log-rotation'
    ]
  },
  performedBy: {
    type: String, // Admin email
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'timeout'],
    required: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed, // Can store any result data
    default: null
  },
  executionTime: {
    type: Number, // Time in milliseconds
    default: 0
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for quick lookups
systemActionSchema.index({ performedBy: 1, createdAt: -1 });
systemActionSchema.index({ action: 1, createdAt: -1 });

const SystemActionModel = mongoose.model('SystemAction', systemActionSchema);

export default SystemActionModel;

