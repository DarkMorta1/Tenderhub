import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    deliveryTimeDays: { type: Number, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

// Indexes for query performance
bidSchema.index({ requirement: 1 });
bidSchema.index({ vendor: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ createdAt: -1 });

export const Bid = mongoose.model('Bid', bidSchema);

