import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createPayment, handlePaymentNotification } from '../services/payment.service';

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID required' });
    }

    const payment = await createPayment(appointmentId);
    res.json(payment);
  } catch (error: any) {
    console.error('Initiate payment error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const webhook = async (req: AuthRequest, res: Response) => {
  try {
    const notification = req.body;
    
    // Queue webhook processing via RabbitMQ
    const { publishToQueue } = await import('../config/rabbitmq');
    await publishToQueue('payment.webhooks', notification);

    res.json({ status: 'queued' });
  } catch (error: any) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const prisma = await import('../config/database').then(m => m.default);
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        appointment: {
          include: {
            consultant: { include: { profile: true } },
            client: { include: { profile: true } }
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check authorization
    if (
      transaction.appointment.clientId !== req.user.userId &&
      transaction.appointment.consultantId !== req.user.userId
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(transaction);
  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
};
