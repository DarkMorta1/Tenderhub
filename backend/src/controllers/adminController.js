import { User } from '../models/User.js';
import { Payment } from '../models/Payment.js';
import { Order } from '../models/Order.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { Kyc } from '../models/Kyc.js';
import { Requirement } from '../models/Requirement.js';

export const listUsers = async (req, res, next) => {
  try {
    const { role, kycStatus, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const approveVendor = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'VENDOR') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    user.isApprovedVendor = true;
    user.kycStatus = 'APPROVED';
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'APPROVE_VENDOR',
      targetUser: user._id,
      details: { by: req.user._id }
    });

    await Notification.create({
      user: user._id,
      type: 'KYC',
      message: 'Your vendor account has been approved by admin',
      link: '/dashboard'
    });

    res.json(user.toJSONSafe());
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = false;
    await user.save();

    await AuditLog.create({
      actor: req.user._id,
      action: 'DEACTIVATE_USER',
      targetUser: user._id,
      details: { by: req.user._id }
    });

    await Notification.create({
      user: user._id,
      type: 'SYSTEM',
      message: 'Your account has been suspended by admin',
      link: '/support'
    });

    res.json(user.toJSONSafe());
  } catch (err) {
    next(err);
  }
};

export const platformAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, vendors, buyers, requirementsCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'VENDOR' }),
      User.countDocuments({ role: 'BUYER' }),
      Requirement.countDocuments()
    ]);

    res.json({
      totalUsers,
      vendors,
      buyers,
      requirements: requirementsCount
    });
  } catch (err) {
    next(err);
  }
};

export const listPendingKyc = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    
    const kycRecords = await Kyc.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Kyc.countDocuments(filter);
    
    res.json({ kycRecords, items: kycRecords, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const adminAuditList = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const items = await AuditLog.find()
      .populate('actor', 'name email')
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await AuditLog.countDocuments();
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

