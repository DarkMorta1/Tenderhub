import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['KYC', 'BID', 'SYSTEM', 'ORDER'], required: true },
    message: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Indexes for query performance
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
