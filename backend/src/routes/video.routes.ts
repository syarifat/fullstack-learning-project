import { Router } from 'express';
import { getToken, endCall, roomStatus } from '../controllers/video.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/token', getToken);
router.post('/end', endCall);
router.get('/room/:id', roomStatus);

export default router;
