import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getVendorProfile } from '../controllers/vendorController.js';

const router = Router();

// Public to authenticated users: get vendor profile by user id
router.get('/:id', authRequired, getVendorProfile);

export default router;
