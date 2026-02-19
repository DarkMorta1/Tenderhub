import { body, param, query, validationResult } from 'express-validator';

export const validateAuth = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').isIn(['BUYER', 'VENDOR']).withMessage('Invalid role'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateKyc = [
  body('documents').isArray({ min: 1 }).withMessage('At least one document is required'),
  handleValidationErrors
];

export const validateKycReview = [
  body('action').isIn(['APPROVE', 'REJECT']).withMessage('Invalid action'),
  body('remarks').optional().trim(),
  param('id').isMongoId().withMessage('Invalid KYC ID'),
  handleValidationErrors
];

export const validateRequirement = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('deadline').isISO8601().withMessage('Invalid deadline date'),
  handleValidationErrors
];

export const validateBid = [
  body('requirementId').isMongoId().withMessage('Invalid requirement ID'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('deliveryTimeDays').isInt({ min: 1 }).withMessage('Delivery time must be at least 1 day'),
  body('notes').optional().trim(),
  handleValidationErrors
];

export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  handleValidationErrors
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation error', errors: errors.array() });
  }
  next();
}
