import { Router } from 'express';
import { create, list, getOne, cancel, updateStatus } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

router.post('/', create);
router.get('/', list);
router.get('/:id', getOne);
router.patch('/:id/cancel', cancel);
router.patch('/:id/status', updateStatus);

export default router;
