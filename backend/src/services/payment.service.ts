import prisma from '../config/database';
import snap from '../config/midtrans';
import crypto from 'crypto';

export const createPayment = async (appointmentId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      consultant: { include: { profile: true } },
      client: { include: { profile: true } }
    }
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.status !== 'PENDING_PAYMENT') {
    throw new Error('Appointment already paid or cancelled');
  }

  // Calculate amount (hourly rate * duration)
  const hourlyRate = appointment.consultant.profile?.hourlyRate || 500000;
  const amount = Math.ceil((hourlyRate / 60) * appointment.duration);

  // Create or get existing transaction
  let transaction = await prisma.transaction.findUnique({
    where: { appointmentId }
  });

  if (!transaction) {
    transaction = await prisma.transaction.create({
      data: {
        appointmentId,
        amount,
        status: 'PENDING'
      }
    });
  }

  // Create Midtrans transaction
  const parameter = {
    transaction_details: {
      order_id: transaction.id,
      gross_amount: amount
    },
    customer_details: {
      first_name: appointment.client.profile?.name || 'Client',
      email: appointment.client.email
    },
    item_details: [{
      id: appointment.id,
      price: amount,
      quantity: 1,
      name: `Consultation with ${appointment.consultant.profile?.name || 'Consultant'}`
    }],
    callbacks: {
      finish: `${process.env.FRONTEND_URL}/payment/success?order_id=${transaction.id}`,
      error: `${process.env.FRONTEND_URL}/payment/error?order_id=${transaction.id}`,
      pending: `${process.env.FRONTEND_URL}/payment/pending?order_id=${transaction.id}`
    }
  };

  const snapTransaction = await snap.createTransaction(parameter);

  // Update transaction with gateway ref
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      gatewayRef: snapTransaction.token,
      gatewayData: snapTransaction as any
    }
  });

  return {
    transactionId: transaction.id,
    token: snapTransaction.token,
    redirectUrl: snapTransaction.redirect_url
  };
};

export const verifySignature = (
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');

  return hash === signatureKey;
};

export const handlePaymentNotification = async (notification: any) => {
  const { order_id, transaction_status, fraud_status, signature_key, status_code, gross_amount } = notification;

  // Verify signature
  const isValid = verifySignature(order_id, status_code, gross_amount, signature_key);
  if (!isValid) {
    throw new Error('Invalid signature');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: order_id },
    include: { appointment: true }
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Log notification
  await prisma.paymentLog.create({
    data: {
      transactionId: transaction.id,
      eventType: transaction_status,
      payload: notification
    }
  });

  // Update transaction status
  let newStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'REFUNDED' = 'PENDING';
  let appointmentStatus: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' = 'PENDING_PAYMENT';

  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    if (fraud_status === 'accept' || !fraud_status) {
      newStatus = 'SUCCESS';
      appointmentStatus = 'CONFIRMED';
    }
  } else if (transaction_status === 'pending') {
    newStatus = 'PENDING';
  } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
    newStatus = 'FAILED';
    appointmentStatus = 'CANCELLED';
  } else if (transaction_status === 'expire') {
    newStatus = 'EXPIRED';
    appointmentStatus = 'CANCELLED';
  } else if (transaction_status === 'refund') {
    newStatus = 'REFUNDED';
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      status: newStatus,
      paidAt: newStatus === 'SUCCESS' ? new Date() : null,
      paymentMethod: notification.payment_type
    }
  });

  await prisma.appointment.update({
    where: { id: transaction.appointmentId },
    data: { status: appointmentStatus }
  });

  return { status: newStatus, appointmentStatus };
};
