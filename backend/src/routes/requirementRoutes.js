import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { validateRequirement, validatePagination } from '../middleware/validators.js';
import {
  createRequirement,
  listOpenRequirements,
  getRequirementWithBids,
  getMyRequirements
} from '../controllers/requirementController.js';

const router = Router();

router.get('/my-requirements', authRequired, validatePagination, getMyRequirements);
router.get('/', authRequired, validatePagination, listOpenRequirements);
router.post('/', authRequired, requireRole('BUYER'), generalLimiter, validateRequirement, createRequirement);
router.get('/:id', authRequired, getRequirementWithBids);

export default router;

