import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import prisma from '../config/database';
import redis from '../config/redis';

const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

export const generateVideoToken = async (appointmentId: string, userId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      consultant: true,
      client: true
    }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Check authorization
  if (appointment.clientId !== userId && appointment.consultantId !== userId) {
    throw new Error('Unauthorized');
  }

  // Check appointment status
  if (appointment.status !== 'CONFIRMED') {
    throw new Error('Appointment not confirmed');
  }

  // Check if appointment time is within 5 minutes
  const now = new Date();
  const scheduledTime = new Date(appointment.scheduledAt);
  const timeDiff = scheduledTime.getTime() - now.getTime();
  const minutesDiff = Math.floor(timeDiff / 1000 / 60);

  if (minutesDiff > 5) {
    throw new Error(`Appointment starts in ${minutesDiff} minutes. Join 5 minutes before.`);
  }

  if (minutesDiff < -appointment.duration) {
    throw new Error('Appointment time has passed');
  }

  // Generate room ID
  const roomId = appointment.roomId || `room-${appointmentId}`;

  // Update appointment with room ID if not set
  if (!appointment.roomId) {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { roomId }
    });
  }

  // Generate Agora token (valid for 2 hours)
  const expirationTimeInSeconds = 7200;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    roomId,
    0, // UID 0 means Agora will assign automatically
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  // Store room info in Redis (TTL: 2 hours)
  const roomKey = `room:${appointmentId}`;
  const roomData = {
    roomId,
    appointmentId,
    consultantId: appointment.consultantId,
    clientId: appointment.clientId,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expirationTimeInSeconds * 1000).toISOString()
  };

  await redis.setex(roomKey, expirationTimeInSeconds, JSON.stringify(roomData));

  // Track user presence
  await redis.setex(`presence:${userId}`, 300, JSON.stringify({
    status: 'in_call',
    appointmentId,
    lastSeen: new Date().toISOString()
  }));

  return {
    token,
    roomId,
    appId: AGORA_APP_ID,
    expiresAt: privilegeExpiredTs
  };
};

export const endVideoCall = async (appointmentId: string, userId: string, actualDuration: number) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.clientId !== userId && appointment.consultantId !== userId) {
    throw new Error('Unauthorized');
  }

  // Update appointment
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'COMPLETED',
      actualDuration
    }
  });

  // Clear Redis data
  await redis.del(`room:${appointmentId}`);
  await redis.del(`presence:${userId}`);

  return { message: 'Call ended successfully' };
};

export const getRoomStatus = async (appointmentId: string, userId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.clientId !== userId && appointment.consultantId !== userId) {
    throw new Error('Unauthorized');
  }

  const roomKey = `room:${appointmentId}`;
  const roomData = await redis.get(roomKey);

  if (!roomData) {
    return { active: false, message: 'Room not active' };
  }

  return { active: true, room: JSON.parse(roomData) };
};
