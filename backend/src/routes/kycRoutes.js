import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { validateKyc, validateKycReview, validatePagination } from '../middleware/validators.js';
import {
  submitKyc,
  getMyKyc,
  adminListPendingKyc,
  adminReviewKyc
} from '../controllers/kycController.js';

const router = Router();

router.post('/', authRequired, requireRole('VENDOR'), generalLimiter, validateKyc, submitKyc);
router.get('/me', authRequired, requireRole('VENDOR'), getMyKyc);

router.get('/pending', authRequired, requireRole('ADMIN'), validatePagination, adminListPendingKyc);
router.post('/:id/review', authRequired, requireRole('ADMIN'), validateKycReview, adminReviewKyc);

export default router;
