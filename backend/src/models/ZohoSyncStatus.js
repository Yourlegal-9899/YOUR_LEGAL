const mongoose = require('mongoose');

const zohoSyncStatusSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      index: true
    },
    lastSyncedAt: Date,
    lastSyncError: String,
    lastStats: {
      total: Number,
      new: Number,
      updated: Number
    },
    status: {
      type: String,
      enum: ['success', 'error', 'idle'],
      default: 'idle'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ZohoSyncStatus', zohoSyncStatusSchema);
