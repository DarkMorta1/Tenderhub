import mongoose from 'mongoose';

const vendorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true },
    website: { type: String },
    description: { type: String },
    products: [{ type: String }],
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    address: { type: String },
    phone: { type: String }
  },
  { timestamps: true }
);

export const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);

