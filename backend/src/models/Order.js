import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', required: true },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING_PAYMENT'
    },
    escrowAmount: { type: Number, required: true },
    releasedAt: { type: Date }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);

