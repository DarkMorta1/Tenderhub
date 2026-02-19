import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    budget: { type: Number, required: true },
    deadline: { type: Date, required: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['OPEN', 'IN_REVIEW', 'AWARDED', 'CLOSED', 'CANCELLED'],
      default: 'OPEN'
    }
  },
  { timestamps: true }
);

// Indexes for query performance
requirementSchema.index({ buyer: 1 });
requirementSchema.index({ status: 1 });
requirementSchema.index({ deadline: 1 });
requirementSchema.index({ createdAt: -1 });

export const Requirement = mongoose.model('Requirement', requirementSchema);

