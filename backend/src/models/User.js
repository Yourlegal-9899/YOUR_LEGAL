const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  googleId: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  companyName: String,
  region: {
    type: String,
    enum: ['USA', 'UK', 'UAE', 'Singapore', 'India', 'Australia', 'Netherlands', 'SaudiArabia']
  },
  servicePlan: {
    type: String,
    enum: ['Starter', 'Growth', 'Scale', 'Micro', 'Vitals', 'Elite', 'Startup', 'Compliance', 'Formation', 'AllInOne']
  },
  bypassPlan: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['lead', 'active', 'awaiting_docs', 'compliance_risk', 'paused', 'closed'],
    default: 'lead'
  },
  quickBooksConnected: {
    type: Boolean,
    default: false
  },
  quickBooksTokens: {
    accessToken: String,
    refreshToken: String,
    realmId: String,
    expiresAt: Date
  },
  stripeCustomerId: String,
  subscriptionId: String,
  subscriptionStatus: String,
  zohoLeadId: String,
  zohoLastSyncedAt: Date,
  zohoSyncError: String
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
