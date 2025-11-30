// B3.0 - Stripe Payment Service
// Handles all Stripe payment processing for bookings
// SANDBOX/TEST MODE ONLY - for educational purposes

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with secret key from environment
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Verify Stripe is configured
if (!stripe) {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured. Stripe payments will not work.');
  console.warn('   For sandbox testing, get your key from: https://dashboard.stripe.com/test/apikeys');
}

/**
 * Create a Payment Intent for a booking
 * This initializes the payment process on Stripe's end
 * 
 * @param {Object} params - Payment parameters
 * @param {number} params.amount - Amount in euros (will be converted to cents)
 * @param {string} params.customer_email - Customer's email
 * @param {string} params.customer_name - Customer's name
 * @param {Object} params.metadata - Additional data to store with payment
 * @returns {Promise<Object>} Payment intent with client_secret
 */
export const createPaymentIntent = async ({ 
  amount, 
  customer_email, 
  customer_name,
  metadata = {} 
}) => {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  try {
    // Convert euros to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur', // Finnish currency
      receipt_email: customer_email,
      description: `Movie Booking for ${customer_name}`,
      metadata: {
        customer_name,
        customer_email,
        ...metadata
      },
      // Automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(`✅ Created Stripe Payment Intent: ${paymentIntent.id}`);

    return {
      payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: amount,
      currency: 'eur',
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('❌ Stripe Payment Intent Error:', error);
    throw new Error(`Stripe error: ${error.message}`);
  }
};

/**
 * Confirm a payment intent
 * This checks if the payment was successful
 * 
 * @param {string} payment_intent_id - Stripe payment intent ID
 * @returns {Promise<Object>} Payment status
 */
export const confirmPayment = async (payment_intent_id) => {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    console.log(`🔍 Payment Intent Status: ${paymentIntent.status}`);

    return {
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status, // succeeded, processing, requires_payment_method, etc.
      amount_received: paymentIntent.amount_received / 100, // Convert back to euros
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('❌ Stripe Confirm Payment Error:', error);
    throw new Error(`Stripe error: ${error.message}`);
  }
};

/**
 * Cancel/Refund a payment
 * Used when cancelling a booking
 * 
 * @param {string} payment_intent_id - Stripe payment intent ID
 * @returns {Promise<Object>} Refund status
 */
export const refundPayment = async (payment_intent_id) => {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  try {
    // First check if payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      // Can't refund a payment that hasn't succeeded
      console.log(`⏭️  Payment ${payment_intent_id} not yet succeeded, cancelling instead`);
      
      // Cancel the payment intent if it's not succeeded
      const cancelledIntent = await stripe.paymentIntents.cancel(payment_intent_id);
      
      return {
        payment_intent_id: cancelledIntent.id,
        status: 'cancelled',
        amount: cancelledIntent.amount / 100
      };
    }

    // Create refund for succeeded payment
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent_id,
    });

    console.log(`✅ Refund created: ${refund.id}`);

    return {
      refund_id: refund.id,
      payment_intent_id: payment_intent_id,
      status: refund.status, // succeeded, pending, failed
      amount: refund.amount / 100,
      currency: refund.currency
    };
  } catch (error) {
    console.error('❌ Stripe Refund Error:', error);
    throw new Error(`Stripe error: ${error.message}`);
  }
};

/**
 * Get payment details
 * 
 * @param {string} payment_intent_id - Stripe payment intent ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (payment_intent_id) => {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    return {
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000),
      payment_method: paymentIntent.payment_method,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('❌ Stripe Get Payment Error:', error);
    throw new Error(`Stripe error: ${error.message}`);
  }
};

/**
 * Verify webhook signature (for production use)
 * This ensures webhook calls actually come from Stripe
 * 
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event
 */
export const verifyWebhookSignature = (payload, signature) => {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not configured. Webhook verification disabled.');
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('❌ Webhook Signature Verification Failed:', error);
    throw new Error('Invalid webhook signature');
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  getPaymentDetails,
  verifyWebhookSignature
};

