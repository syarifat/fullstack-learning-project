import { Router } from 'express';
import { create, listByConsultant, remove, getAvailable } from '../controllers/slot.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, create);
router.get('/consultant/:consultantId', listByConsultant);
router.get('/available', getAvailable);
router.delete('/:id', authenticate, remove);

export default router;
