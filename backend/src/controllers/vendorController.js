import { VendorProfile } from '../models/VendorProfile.js';
import { User } from '../models/User.js';

export const getVendorProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('name email role kycStatus isApprovedVendor createdAt');
    if (!user || user.role !== 'VENDOR') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const profile = await VendorProfile.findOne({ user: userId }).lean();

    res.json({ user, profile });
  } catch (err) {
    next(err);
  }
};
