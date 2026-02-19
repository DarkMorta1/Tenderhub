import { Requirement } from '../models/Requirement.js';
import { Bid } from '../models/Bid.js';

export const createRequirement = async (req, res, next) => {
  try {
    const { title, description, quantity, budget, deadline, attachments } = req.body;
    const requirement = await Requirement.create({
      buyer: req.user._id,
      title,
      description,
      quantity,
      budget,
      deadline,
      attachments: attachments || []
    });
    res.status(201).json(requirement);
  } catch (err) {
    next(err);
  }
};

export const listOpenRequirements = async (req, res, next) => {
  try {
    const { search, minBudget, maxBudget, page = 1, limit = 20, status } = req.query;
    const filter = {};
    
    // If status is specified, use it; otherwise default to OPEN
    if (status) {
      filter.status = status;
    } else {
      filter.status = 'OPEN';
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const requirements = await Requirement.find(filter)
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    const total = await Requirement.countDocuments(filter);
    res.json({ items: requirements, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getMyRequirements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const requirements = await Requirement.find({ buyer: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Requirement.countDocuments({ buyer: req.user._id });
    
    res.json({ items: requirements, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getRequirementWithBids = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id).populate('buyer', 'name email');
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    const bids = await Bid.find({ requirement: requirement._id })
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 });
    res.json({ requirement, bids });
  } catch (err) {
    next(err);
  }
};

