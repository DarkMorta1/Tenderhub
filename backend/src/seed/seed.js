import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { VendorProfile } from '../models/VendorProfile.js';
import { Requirement } from '../models/Requirement.js';
import { Kyc } from '../models/Kyc.js';

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    VendorProfile.deleteMany({}),
    Requirement.deleteMany({}),
    Kyc.deleteMany({})
  ]);

  const adminPassword = await bcrypt.hash('Ojash112', 10);
  const userPassword = await bcrypt.hash('Password123!', 10);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@gmail.com',
    passwordHash: adminPassword,
    role: 'ADMIN',
    isApprovedVendor: true,
    kycStatus: 'APPROVED'
  });

  const buyer = await User.create({
    name: 'Acme Corp Buyer',
    email: 'buyer@acme.local',
    passwordHash: userPassword,
    role: 'BUYER',
    isApprovedVendor: true,
    kycStatus: 'APPROVED'
  });

  const vendor = await User.create({
    name: 'Global Supplies',
    email: 'vendor@global.local',
    passwordHash: userPassword,
    role: 'VENDOR',
    isApprovedVendor: true,
    kycStatus: 'APPROVED'
  });

  // Create KYC record for vendor
  await Kyc.create({
    user: vendor._id,
    documents: ['kyc_doc_1.pdf', 'kyc_doc_2.pdf'],
    status: 'APPROVED',
    adminRemarks: 'Approved',
    reviewedAt: new Date()
  });

  await VendorProfile.create({
    user: vendor._id,
    companyName: 'Global Supplies Ltd',
    products: ['Office Supplies', 'IT Equipment']
  });

  await Requirement.create({
    buyer: buyer._id,
    title: 'Laptops for Engineering Team',
    description: 'Need 25 high-performance laptops for software engineers.',
    quantity: 25,
    budget: 50000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  console.log('Seed data created');
  console.log('Admin: admin@gmail.com / Ojash112');
  console.log('Buyer: buyer@acme.local / Password123!');
  console.log('Vendor: vendor@global.local / Password123!');
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


