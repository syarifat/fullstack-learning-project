import prisma from '../config/database';

export const createSlot = async (
  profileId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string
) => {
  // Validate day of week (0-6)
  if (dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error('Invalid day of week');
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error('Invalid time format. Use HH:MM');
  }

  // Check for overlapping slots
  const overlaps = await prisma.slot.findFirst({
    where: {
      profileId,
      dayOfWeek,
      isActive: true,
      OR: [
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } }
          ]
        },
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: endTime } }
          ]
        }
      ]
    }
  });

  if (overlaps) {
    throw new Error('Slot overlaps with existing slot');
  }

  const slot = await prisma.slot.create({
    data: {
      profileId,
      dayOfWeek,
      startTime,
      endTime
    }
  });

  return slot;
};

export const getSlotsByConsultant = async (consultantId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId: consultantId }
  });

  if (!profile) {
    throw new Error('Profile not found');
  }

  const slots = await prisma.slot.findMany({
    where: { 
      profileId: profile.id,
      isActive: true
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return slots;
};

export const deleteSlot = async (id: string, userId: string) => {
  const slot = await prisma.slot.findUnique({
    where: { id },
    include: { profile: true }
  });

  if (!slot) {
    throw new Error('Slot not found');
  }

  if (slot.profile.userId !== userId) {
    throw new Error('Unauthorized');
  }

  await prisma.slot.update({
    where: { id },
    data: { isActive: false }
  });

  return { message: 'Slot deleted' };
};

export const getAvailableSlots = async (consultantId: string, date: Date) => {
  const dayOfWeek = date.getDay();

  const slots = await prisma.slot.findMany({
    where: {
      profile: { userId: consultantId },
      dayOfWeek,
      isActive: true
    },
    orderBy: { startTime: 'asc' }
  });

  // Get existing appointments for that day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: {
      consultantId,
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'] }
    }
  });

  return { slots, appointments };
};
