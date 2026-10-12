import prisma from '../config/database';
import { AppointmentStatus } from '@prisma/client';
import { sendAppointmentConfirmation, sendAppointmentCancellation } from './email.service';

export const createAppointment = async (
  consultantId: string,
  clientId: string,
  scheduledAt: Date,
  duration: number
) => {
  // Check consultant exists and is CONSULTANT role
  const consultant = await prisma.user.findUnique({
    where: { id: consultantId },
    include: { profile: true }
  });

  if (!consultant || consultant.role !== 'CONSULTANT') {
    throw new Error('Invalid consultant');
  }

  // Check client exists
  const client = await prisma.user.findUnique({ where: { id: clientId } });
  if (!client) {
    throw new Error('Client not found');
  }

  // Check for conflicts
  const conflicts = await prisma.appointment.findFirst({
    where: {
      consultantId,
      scheduledAt: {
        gte: new Date(scheduledAt.getTime() - duration * 60000),
        lte: new Date(scheduledAt.getTime() + duration * 60000)
      },
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'] }
    }
  });

  if (conflicts) {
    throw new Error('Time slot not available');
  }

  const appointment = await prisma.appointment.create({
    data: {
      consultantId,
      clientId,
      scheduledAt,
      duration,
      status: 'PENDING_PAYMENT'
    },
    include: {
      consultant: { include: { profile: true } },
      client: { include: { profile: true } }
    }
  });

  // Queue confirmation email
  await sendAppointmentConfirmation(client.email, {
    appointmentId: appointment.id,
    consultantName: appointment.consultant.profile?.name,
    scheduledAt: appointment.scheduledAt,
    duration: appointment.duration
  });

  return appointment;
};

export const getAppointments = async (userId: string, role: string) => {
  const where = role === 'CONSULTANT' 
    ? { consultantId: userId }
    : { clientId: userId };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      consultant: { include: { profile: true } },
      client: { include: { profile: true } },
      transaction: true
    },
    orderBy: { scheduledAt: 'desc' }
  });

  return appointments;
};

export const getAppointmentById = async (id: string, userId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      consultant: { include: { profile: true } },
      client: { include: { profile: true } },
      transaction: true
    }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Check authorization
  if (appointment.consultantId !== userId && appointment.clientId !== userId) {
    throw new Error('Unauthorized');
  }

  return appointment;
};

export const cancelAppointment = async (id: string, userId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.clientId !== userId && appointment.consultantId !== userId) {
    throw new Error('Unauthorized');
  }

  if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
    throw new Error('Cannot cancel this appointment');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      consultant: { include: { profile: true } },
      client: { include: { profile: true } }
    }
  });

  // Queue cancellation email
  await sendAppointmentCancellation(updated.client.email, {
    appointmentId: updated.id,
    consultantName: updated.consultant.profile?.name,
    scheduledAt: updated.scheduledAt
  });

  return updated;
};

export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus,
  actualDuration?: number
) => {
  const data: any = { status };
  if (actualDuration !== undefined) {
    data.actualDuration = actualDuration;
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data,
    include: {
      consultant: { include: { profile: true } },
      client: { include: { profile: true } }
    }
  });

  return appointment;
};
