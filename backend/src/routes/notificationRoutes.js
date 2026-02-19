import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationController.js';

const router = Router();

router.use(authRequired);
router.get('/', listNotifications);
router.post('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
