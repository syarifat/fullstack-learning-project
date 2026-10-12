import prisma from '../config/database';

export const getConsultantAnalytics = async (consultantId: string) => {
  // Total appointments
  const totalAppointments = await prisma.appointment.count({
    where: { consultantId }
  });

  // Completed appointments
  const completedAppointments = await prisma.appointment.count({
    where: { 
      consultantId,
      status: 'COMPLETED'
    }
  });

  // Total revenue
  const revenue = await prisma.transaction.aggregate({
    where: {
      appointment: { consultantId },
      status: 'SUCCESS'
    },
    _sum: { amount: true }
  });

  // Average call duration
  const avgDuration = await prisma.appointment.aggregate({
    where: {
      consultantId,
      status: 'COMPLETED',
      actualDuration: { not: null }
    },
    _avg: { actualDuration: true }
  });

  // Popular time slots
  const appointments = await prisma.appointment.findMany({
    where: { consultantId },
    select: { scheduledAt: true }
  });

  const timeSlots: Record<number, number> = {};
  appointments.forEach(apt => {
    const hour = new Date(apt.scheduledAt).getHours();
    timeSlots[hour] = (timeSlots[hour] || 0) + 1;
  });

  const popularSlots = Object.entries(timeSlots)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([hour, count]) => ({ hour: Number(hour), count }));

  // Monthly revenue (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('month', a.scheduled_at) as month,
      COUNT(DISTINCT a.id) as appointment_count,
      COALESCE(SUM(t.amount), 0) as total_revenue
    FROM appointments a
    LEFT JOIN transactions t ON t.appointment_id = a.id AND t.status = 'SUCCESS'
    WHERE a.consultant_id = ${consultantId}
      AND a.scheduled_at >= ${sixMonthsAgo}
    GROUP BY DATE_TRUNC('month', a.scheduled_at)
    ORDER BY month DESC
  `;

  return {
    totalAppointments,
    completedAppointments,
    completionRate: totalAppointments > 0 
      ? Math.round((completedAppointments / totalAppointments) * 100) 
      : 0,
    totalRevenue: revenue._sum.amount || 0,
    avgDuration: Math.round(avgDuration._avg.actualDuration || 0),
    popularSlots,
    monthlyRevenue
  };
};

export const getClientAnalytics = async (clientId: string) => {
  const totalAppointments = await prisma.appointment.count({
    where: { clientId }
  });

  const completedAppointments = await prisma.appointment.count({
    where: { 
      clientId,
      status: 'COMPLETED'
    }
  });

  const totalSpent = await prisma.transaction.aggregate({
    where: {
      appointment: { clientId },
      status: 'SUCCESS'
    },
    _sum: { amount: true }
  });

  return {
    totalAppointments,
    completedAppointments,
    totalSpent: totalSpent._sum.amount || 0
  };
};
