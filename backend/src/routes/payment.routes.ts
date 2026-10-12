import { Router } from 'express';
import { initiatePayment, webhook, getPaymentStatus } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/initiate', authenticate, initiatePayment);
router.post('/webhook', webhook); // No auth - Midtrans callback
router.get('/:id/status', authenticate, getPaymentStatus);

export default router;
