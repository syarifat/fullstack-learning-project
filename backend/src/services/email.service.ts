import { getChannel, publishToQueue } from '../config/rabbitmq';

interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export const sendEmail = async (job: EmailJob) => {
  // Mock email sending for now
  console.log(`📧 Email sent to ${job.to}: ${job.subject}`);
  
  // ponytail: Skip actual SMTP for now. Add nodemailer when you have real email provider.
  // For development, this logs to console. In production, integrate with Mailtrap/SendGrid/SES.
  
  return true;
};

export const queueEmail = async (job: EmailJob) => {
  try {
    await publishToQueue('email.notifications', job);
    console.log(`📨 Email queued for ${job.to}`);
  } catch (error) {
    console.error('Failed to queue email:', error);
    throw error;
  }
};

export const sendAppointmentConfirmation = async (
  email: string,
  appointmentData: any
) => {
  await queueEmail({
    to: email,
    subject: 'Appointment Confirmation',
    template: 'appointment-confirmation',
    data: appointmentData
  });
};

export const sendAppointmentReminder = async (
  email: string,
  appointmentData: any
) => {
  await queueEmail({
    to: email,
    subject: 'Appointment Reminder - 1 Hour',
    template: 'appointment-reminder',
    data: appointmentData
  });
};

export const sendAppointmentCancellation = async (
  email: string,
  appointmentData: any
) => {
  await queueEmail({
    to: email,
    subject: 'Appointment Cancelled',
    template: 'appointment-cancellation',
    data: appointmentData
  });
};
