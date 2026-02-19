import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import {
  listUsers,
  approveVendor,
  deactivateUser,
  platformAnalytics,
  adminAuditList,
  listPendingKyc
} from '../controllers/adminController.js';
import { adminReviewKyc } from '../controllers/kycController.js';

const router = Router();

router.use(authRequired, requireRole('ADMIN'));

router.get('/users', listUsers);
router.post('/vendors/:id/approve', approveVendor);
router.post('/users/:id/deactivate', deactivateUser);
router.get('/analytics', platformAnalytics);
router.get('/audit', adminAuditList);
router.get('/kyc/pending', listPendingKyc);
router.post('/kyc/:id/approve', adminReviewKyc);
router.post('/kyc/:id/reject', adminReviewKyc);

export default router;

