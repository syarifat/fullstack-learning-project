import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus
} from '../services/appointment.service';

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { consultantId, scheduledAt, duration } = req.body;

    if (!consultantId || !scheduledAt || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const appointment = await createAppointment(
      consultantId,
      req.user.userId,
      new Date(scheduledAt),
      duration
    );

    res.status(201).json(appointment);
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(400).json({ error: error.message || 'Failed to create appointment' });
  }
};

export const list = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const appointments = await getAppointments(req.user.userId, req.user.role);
    res.json(appointments);
  } catch (error: any) {
    console.error('List appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const getOne = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const appointment = await getAppointmentById(req.params.id, req.user.userId);
    res.json(appointment);
  } catch (error: any) {
    console.error('Get appointment error:', error);
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ 
      error: error.message 
    });
  }
};

export const cancel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const appointment = await cancelAppointment(req.params.id, req.user.userId);
    res.json(appointment);
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    const status = error.message === 'Unauthorized' ? 403 : 400;
    res.status(status).json({ error: error.message });
  }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status, actualDuration } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    const appointment = await updateAppointmentStatus(
      req.params.id,
      status,
      actualDuration
    );

    res.json(appointment);
  } catch (error: any) {
    console.error('Update appointment status error:', error);
    res.status(400).json({ error: error.message });
  }
};
