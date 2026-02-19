import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { authRequired } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateAuth, validateLogin } from '../middleware/validators.js';

const router = Router();

router.post('/register', authLimiter, validateAuth, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', authRequired, me);

export default router;

