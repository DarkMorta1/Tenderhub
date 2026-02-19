// Mock Stripe-like payment service for escrow simulation
import { Payment } from '../models/Payment.js';

export const createMockPaymentIntent = async ({ orderId, amount }) => {
  const payment = await Payment.create({
    order: orderId,
    amount,
    status: 'AUTHORIZED',
    providerPaymentId: `mock_pi_${Date.now()}`
  });
  return payment;
};

export const captureMockPayment = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new Error('Payment not found');
  }
  payment.status = 'CAPTURED';
  await payment.save();
  return payment;
};

