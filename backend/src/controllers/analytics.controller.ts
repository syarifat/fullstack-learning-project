import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getConsultantAnalytics, getClientAnalytics } from '../services/analytics.service';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analytics = req.user.role === 'CONSULTANT'
      ? await getConsultantAnalytics(req.user.userId)
      : await getClientAnalytics(req.user.userId);

    res.json(analytics);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
