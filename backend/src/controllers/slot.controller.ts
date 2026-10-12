import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createSlot,
  getSlotsByConsultant,
  deleteSlot,
  getAvailableSlots
} from '../services/slot.service';
import prisma from '../config/database';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'CONSULTANT') {
      return res.status(403).json({ error: 'Only consultants can create slots' });
    }

    const { dayOfWeek, startTime, endTime } = req.body;

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.userId }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const slot = await createSlot(profile.id, dayOfWeek, startTime, endTime);
    res.status(201).json(slot);
  } catch (error: any) {
    console.error('Create slot error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const listByConsultant = async (req: AuthRequest, res: Response) => {
  try {
    const consultantId = req.params.consultantId || req.user?.userId;

    if (!consultantId) {
      return res.status(400).json({ error: 'Consultant ID required' });
    }

    const slots = await getSlotsByConsultant(consultantId);
    res.json(slots);
  } catch (error: any) {
    console.error('List slots error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await deleteSlot(req.params.id, req.user.userId);
    res.json(result);
  } catch (error: any) {
    console.error('Delete slot error:', error);
    const status = error.message === 'Unauthorized' ? 403 : 404;
    res.status(status).json({ error: error.message });
  }
};

export const getAvailable = async (req: AuthRequest, res: Response) => {
  try {
    const { consultantId, date } = req.query;

    if (!consultantId || !date) {
      return res.status(400).json({ error: 'consultantId and date required' });
    }

    const result = await getAvailableSlots(
      consultantId as string,
      new Date(date as string)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Get available slots error:', error);
    res.status(400).json({ error: error.message });
  }
};
