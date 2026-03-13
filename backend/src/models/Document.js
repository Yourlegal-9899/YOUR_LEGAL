const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    source: {
      type: String,
      enum: ['client_uploads', 'legal_docs'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    data: {
      type: Buffer,
      required: false,
    },
    storageProvider: {
      type: String,
      enum: ['mongo', 's3'],
      default: 'mongo',
      index: true,
    },
    s3Bucket: {
      type: String,
      default: null,
    },
    s3Key: {
      type: String,
      default: null,
    },
    s3Region: {
      type: String,
      default: null,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    taxFiling: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxFiling',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
