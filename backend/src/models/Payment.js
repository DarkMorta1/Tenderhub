import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'AUTHORIZED', 'CAPTURED', 'REFUNDED', 'FAILED'],
      default: 'PENDING'
    },
    provider: { type: String, default: 'MOCK_STRIPE' },
    providerPaymentId: { type: String },
    metadata: { type: Object }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);

