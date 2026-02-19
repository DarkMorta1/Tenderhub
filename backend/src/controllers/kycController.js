import { Kyc } from '../models/Kyc.js';
import { User } from '../models/User.js';

export const submitKyc = async (req, res, next) => {
  try {
    const { documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ message: 'Documents are required' });
    }

    let kyc = await Kyc.findOne({ user: req.user._id });
    if (kyc) {
      if (kyc.status === 'APPROVED') {
        return res.status(400).json({ message: 'KYC already approved' });
      }
      kyc.documents = documents;
      kyc.status = 'PENDING';
      kyc.adminRemarks = undefined;
      kyc.submittedAt = new Date();
      await kyc.save();
    } else {
      kyc = await Kyc.create({ user: req.user._id, documents });
    }

    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'PENDING' });

    res.status(201).json(kyc);
  } catch (err) {
    next(err);
  }
};

export const getMyKyc = async (req, res, next) => {
  try {
    const kyc = await Kyc.findOne({ user: req.user._id });
    res.json(kyc || null);
  } catch (err) {
    next(err);
  }
};

export const adminListPendingKyc = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const items = await Kyc.find({ status: 'PENDING' })
      .populate('user', 'name email kycStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Kyc.countDocuments({ status: 'PENDING' });
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const adminReviewKyc = async (req, res, next) => {
  try {
    const { action, remarks } = req.body;
    const kyc = await Kyc.findById(req.params.id).populate('user');
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });
    const normalized = (action || '').toUpperCase();
    if (!['APPROVE', 'REJECT'].includes(normalized)) {
      return res.status(400).json({ message: 'Invalid action' });
    }
    if (normalized === 'APPROVE') {
      kyc.status = 'APPROVED';
      await User.findByIdAndUpdate(kyc.user._id, { kycStatus: 'APPROVED', isApprovedVendor: true });
    } else {
      kyc.status = 'REJECTED';
      await User.findByIdAndUpdate(kyc.user._id, { kycStatus: 'REJECTED', isApprovedVendor: false });
    }
    kyc.adminRemarks = remarks;
    kyc.reviewedAt = new Date();
    await kyc.save();
    res.json(kyc);
  } catch (err) {
    next(err);
  }
};
