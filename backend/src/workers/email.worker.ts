import { connectRabbitMQ, getChannel } from '../config/rabbitmq';
import { sendEmail } from '../services/email.service';

export const startEmailWorker = async () => {
  try {
    await connectRabbitMQ();
    const channel = getChannel();

    console.log('📬 Email worker started, waiting for messages...');

    channel.consume('email.notifications', async (msg) => {
      if (msg) {
        try {
          const job = JSON.parse(msg.content.toString());
          await sendEmail(job);
          channel.ack(msg);
        } catch (error) {
          console.error('Email worker error:', error);
          // Reject and requeue
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error('Failed to start email worker:', error);
    process.exit(1);
  }
};

// Start worker if this file is run directly
if (require.main === module) {
  startEmailWorker();
}
