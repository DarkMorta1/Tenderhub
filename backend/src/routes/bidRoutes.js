import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { validateBid } from '../middleware/validators.js';
import { submitBid, updateBid, acceptBid, rejectBid, getMyBids, withdrawBid } from '../controllers/bidController.js';

const router = Router();

router.get('/my-bids', authRequired, requireRole('VENDOR'), getMyBids);
router.post('/', authRequired, requireRole('VENDOR'), generalLimiter, validateBid, submitBid);
router.put('/:id', authRequired, requireRole('VENDOR'), validateBid, updateBid);
router.post('/:id/accept', authRequired, requireRole('BUYER'), acceptBid);
router.post('/:id/reject', authRequired, requireRole('BUYER'), rejectBid);
router.post('/:id/withdraw', authRequired, requireRole('VENDOR'), withdrawBid);

export default router;

