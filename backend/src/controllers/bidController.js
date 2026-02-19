import { Bid } from '../models/Bid.js';
import { Requirement } from '../models/Requirement.js';
import { Order } from '../models/Order.js';
import { createMockPaymentIntent } from '../services/paymentService.js';

let socketUtils = null;
export const setSocketUtils = (utils) => {
  socketUtils = utils;
};

export const submitBid = async (req, res, next) => {
  try {
    const { requirementId, price, deliveryTimeDays, notes } = req.body;
    const requirement = await Requirement.findById(requirementId);
    if (!requirement || requirement.status !== 'OPEN') {
      return res.status(400).json({ message: 'Requirement not open for bidding' });
    }
    // check deadline
    if (new Date() > new Date(requirement.deadline)) {
      return res.status(400).json({ message: 'Bidding deadline has passed' });
    }
    // enforce KYC approval for vendors
    if (req.user.role === 'VENDOR' && req.user.kycStatus !== 'APPROVED') {
      return res.status(403).json({ message: 'Vendor KYC must be approved before bidding' });
    }
    const bid = await Bid.create({
      requirement: requirementId,
      vendor: req.user._id,
      price,
      deliveryTimeDays,
      notes
    });
    if (socketUtils) {
      socketUtils.emitBidUpdated(requirementId, bid);
    }
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
};

export const updateBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid || String(bid.vendor) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    if (bid.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending bids can be edited' });
    }
    const { price, deliveryTimeDays, notes } = req.body;
    if (price !== undefined) bid.price = price;
    if (deliveryTimeDays !== undefined) bid.deliveryTimeDays = deliveryTimeDays;
    if (notes !== undefined) bid.notes = notes;
    await bid.save();
    if (socketUtils) {
      socketUtils.emitBidUpdated(bid.requirement, bid);
    }
    res.json(bid);
  } catch (err) {
    next(err);
  }
};

export const getMyBids = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const bids = await Bid.find({ vendor: req.user._id })
      .populate('requirement', 'title description budget quantity deadline deadline buyer')
      .populate('requirement.buyer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Bid.countDocuments({ vendor: req.user._id });

    res.json({
      items: bids,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

export const withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid || String(bid.vendor) !== String(req.user._id)) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    if (bid.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending bids can be withdrawn' });
    }
    bid.status = 'WITHDRAWN';
    await bid.save();
    if (socketUtils) {
      socketUtils.emitBidUpdated(bid.requirement, bid);
    }
    res.json(bid);
  } catch (err) {
    next(err);
  }
};

export const acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('requirement');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    if (String(bid.requirement.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your requirement' });
    }
    bid.status = 'ACCEPTED';
    await bid.save();

    bid.requirement.status = 'AWARDED';
    await bid.requirement.save();

    const order = await Order.create({
      requirement: bid.requirement._id,
      buyer: bid.requirement.buyer,
      vendor: bid.vendor,
      bid: bid._id,
      escrowAmount: bid.price
    });

    const payment = await createMockPaymentIntent({
      orderId: order._id,
      amount: bid.price
    });

    if (socketUtils) {
      socketUtils.emitBidUpdated(bid.requirement._id, bid);
    }

    res.json({ bid, order, payment });
  } catch (err) {
    next(err);
  }
};

export const rejectBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('requirement');
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    if (String(bid.requirement.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your requirement' });
    }
    bid.status = 'REJECTED';
    await bid.save();
    if (socketUtils) {
      socketUtils.emitBidUpdated(bid.requirement._id, bid);
    }
    res.json(bid);
  } catch (err) {
    next(err);
  }
};

