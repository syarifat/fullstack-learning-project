import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateVideoToken, endVideoCall, getRoomStatus } from '../services/video.service';

export const getToken = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'Appointment ID required' });
    }

    const token = await generateVideoToken(appointmentId, req.user.userId);
    res.json(token);
  } catch (error: any) {
    console.error('Get video token error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const endCall = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { appointmentId, actualDuration } = req.body;

    if (!appointmentId || actualDuration === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await endVideoCall(appointmentId, req.user.userId, actualDuration);
    res.json(result);
  } catch (error: any) {
    console.error('End call error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const roomStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await getRoomStatus(req.params.id, req.user.userId);
    res.json(status);
  } catch (error: any) {
    console.error('Room status error:', error);
    res.status(400).json({ error: error.message });
  }
};
