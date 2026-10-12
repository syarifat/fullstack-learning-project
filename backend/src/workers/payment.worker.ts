import { connectRabbitMQ, getChannel } from '../config/rabbitmq';
import { handlePaymentNotification } from '../services/payment.service';

export const startPaymentWorker = async () => {
  try {
    await connectRabbitMQ();
    const channel = getChannel();

    console.log('💳 Payment worker started, waiting for webhooks...');

    channel.consume('payment.webhooks', async (msg) => {
      if (msg) {
        try {
          const notification = JSON.parse(msg.content.toString());
          console.log('Processing payment notification:', notification.order_id);
          
          await handlePaymentNotification(notification);
          
          console.log('✅ Payment notification processed:', notification.order_id);
          channel.ack(msg);
        } catch (error) {
          console.error('Payment worker error:', error);
          // Reject and requeue
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error('Failed to start payment worker:', error);
    process.exit(1);
  }
};

// Start worker if this file is run directly
if (require.main === module) {
  startPaymentWorker();
}
