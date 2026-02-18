import { Router } from 'express';
import { getMessages } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/:channelId', getMessages);

export default router;
