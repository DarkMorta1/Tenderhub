import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: Object },
    ip: { type: String }
  },
  { timestamps: true }
);

// Indexes for query performance (actor has inline index definition)
auditSchema.index({ targetUser: 1 });
auditSchema.index({ action: 1 });
auditSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditSchema);
