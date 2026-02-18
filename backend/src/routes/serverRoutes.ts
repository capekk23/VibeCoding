import { Router } from 'express';
import { createServer, getServers, getChannels, joinServer } from '../controllers/serverController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createServer);
router.get('/', getServers);
router.post('/:serverId/join', joinServer);
router.get('/:serverId/channels', getChannels);

export default router;
