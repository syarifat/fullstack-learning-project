import amqp from 'amqplib';

let channel: amqp.Channel | null = null;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://teleconsult:teleconsult_dev@localhost:5672'
    );
    
    channel = await connection.createChannel();
    
    // Declare queues
    await channel.assertQueue('email.notifications', { durable: true });
    await channel.assertQueue('payment.webhooks', { durable: true });
    
    console.log('✅ RabbitMQ connected');
    
    return channel;
  } catch (error) {
    console.error('❌ RabbitMQ connection error:', error);
    throw error;
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

export const publishToQueue = async (queue: string, data: any) => {
  const ch = getChannel();
  const message = JSON.stringify(data);
  return ch.sendToQueue(queue, Buffer.from(message), { persistent: true });
};
