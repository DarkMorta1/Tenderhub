import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['BID_ACCEPTED', 'NEW_BID', 'MESSAGE', 'SYSTEM'], required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    link: { type: String }
  },
  { _id: false, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'BUYER', 'VENDOR'], required: true },
    isApprovedVendor: { type: Boolean, default: false },
      kycStatus: {
        type: String,
        enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NOT_SUBMITTED',
        index: true
      },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    notifications: [notificationSchema]
  },
  { timestamps: true }
);

userSchema.methods.toJSONSafe = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Indexes for query performance (email and kycStatus have inline index definitions)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model('User', userSchema);

