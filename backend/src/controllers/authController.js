import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { ENV } from '../config/env.js';

const signToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;
    if (!['BUYER', 'VENDOR'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      isApprovedVendor: role === 'VENDOR' ? false : true
    });

    if (role === 'VENDOR') {
      await VendorProfile.create({
        user: user._id,
        companyName: companyName || `${name} Vendor`
      });
    }

    const token = signToken(user);
    res.status(201).json({ token, user: user.toJSONSafe() });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (user.role === 'VENDOR' && !user.isApprovedVendor) {
      return res.status(403).json({ message: 'Vendor not yet approved by admin' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = signToken(user);
    res.json({ token, user: user.toJSONSafe() });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({ user: req.user.toJSONSafe() });
};

