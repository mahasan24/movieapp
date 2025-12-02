import * as bookingModel from "../models/booking.js";
import { ErrorCodes, sendError } from "../utils/errors.js";
import * as stripeService from "../services/stripeService.js";

// GET /bookings/me - Get current user's own bookings (new simplified endpoint)
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.getUserBookings(req.user.user_id);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    sendError(res, 500, ErrorCodes.BOOKING_FETCH_ERROR, "Error fetching your bookings");
  }
};

// GET /bookings - Get all bookings (ADMIN) or user's bookings (USER)
// Admin can see all bookings, users can only see their own
export const getBookings = async (req, res) => {
  try {
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Admin can get all bookings, users only their own
    const user_id = isAdmin ? null : req.user.user_id;
    
    const bookings = await bookingModel.getBookings(user_id);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    sendError(res, 500, ErrorCodes.BOOKING_FETCH_ERROR, "Error fetching bookings");
  }
};

// GET /bookings/user/:userId - Get bookings for a specific user (ADMIN or OWN USER)
export const getUserBookings = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId);
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Users can only access their own bookings, admins can access anyone's
    if (!isAdmin && requestedUserId !== req.user.user_id) {
      return sendError(res, 403, ErrorCodes.BOOKING_OWNERSHIP_ERROR, "You can only access your own bookings");
    }
    
    const bookings = await bookingModel.getUserBookings(requestedUserId);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    sendError(res, 500, ErrorCodes.BOOKING_FETCH_ERROR, "Error fetching user bookings");
  }
};

// GET /bookings/:id - Get booking by ID (ADMIN or OWNER)
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingModel.getBookingById(req.params.id);
    
    if (!booking) {
      return sendError(res, 404, ErrorCodes.BOOKING_NOT_FOUND, "Booking not found");
    }
    
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Users can only view their own bookings, admins can view any
    if (!isAdmin && booking.user_id !== req.user.user_id) {
      return sendError(res, 403, ErrorCodes.BOOKING_OWNERSHIP_ERROR, "You can only view your own bookings");
    }
    
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    sendError(res, 500, ErrorCodes.BOOKING_FETCH_ERROR, "Error fetching booking");
  }
};

// POST /bookings - Create a new booking (AUTHENTICATED USER)
export const createBooking = async (req, res) => {
  try {
    const { 
      showtime_id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      number_of_seats, 
      total_price,
      payment_method 
    } = req.body;
    
    if (!showtime_id || !customer_name || !customer_email || !number_of_seats || !total_price) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, 
        "showtime_id, customer_name, customer_email, number_of_seats, and total_price are required");
    }

    if (number_of_seats <= 0) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, "number_of_seats must be greater than 0");
    }

    if (total_price < 0) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, "total_price must be non-negative");
    }

    const newBooking = await bookingModel.createBooking({
      user_id: req.user.user_id,
      showtime_id,
      customer_name,
      customer_email,
      customer_phone,
      number_of_seats,
      total_price,
      payment_method: payment_method || 'mock'
    });
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    
    if (error.message === 'Showtime not found') {
      return sendError(res, 400, ErrorCodes.SHOWTIME_NOT_FOUND, "Showtime not found");
    }
    
    if (error.message === 'Not enough seats available') {
      return sendError(res, 400, ErrorCodes.BOOKING_NOT_ENOUGH_SEATS, "Not enough seats available");
    }
    
    sendError(res, 500, ErrorCodes.BOOKING_CREATE_ERROR, "Error creating booking");
  }
};

// DELETE /bookings/:id - Cancel a booking (ADMIN or OWNER)
export const cancelBooking = async (req, res) => {
  try {
    // First get the booking to check ownership
    const booking = await bookingModel.getBookingById(req.params.id);
    
    if (!booking) {
      return sendError(res, 404, ErrorCodes.BOOKING_NOT_FOUND, "Booking not found");
    }
    
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Users can only cancel their own bookings, admins can cancel any
    if (!isAdmin && booking.user_id !== req.user.user_id) {
      return sendError(res, 403, ErrorCodes.BOOKING_OWNERSHIP_ERROR, "You can only cancel your own bookings");
    }
    
    // Use Stripe-aware cancellation
    const cancelledBooking = await bookingModel.cancelBookingWithStripe(req.params.id);
    
    res.json({ 
      message: "Booking cancelled successfully. Refund will be processed if applicable.", 
      booking: cancelledBooking 
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    
    if (error.message === 'Booking not found') {
      return sendError(res, 404, ErrorCodes.BOOKING_NOT_FOUND, "Booking not found");
    }
    
    if (error.message === 'Booking already cancelled') {
      return sendError(res, 400, ErrorCodes.BOOKING_ALREADY_CANCELLED, "Booking already cancelled");
    }
    
    sendError(res, 500, ErrorCodes.BOOKING_DELETE_ERROR, "Error cancelling booking");
  }
};

// ============================================
// B3.0 - STRIPE PAYMENT ENDPOINTS
// ============================================

// POST /bookings/create-payment-intent - Step 1: Initialize Stripe payment
export const createPaymentIntent = async (req, res) => {
  try {
    const { 
      showtime_id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      number_of_seats, 
      total_price 
    } = req.body;
    
    // Validation
    if (!showtime_id || !customer_name || !customer_email || !number_of_seats || !total_price) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, 
        "showtime_id, customer_name, customer_email, number_of_seats, and total_price are required");
    }

    if (number_of_seats <= 0) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, "number_of_seats must be greater than 0");
    }

    if (total_price < 0) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, "total_price must be non-negative");
    }

    const paymentIntent = await bookingModel.createPaymentIntentForBooking({
      showtime_id,
      customer_name,
      customer_email,
      customer_phone,
      number_of_seats,
      total_price
    });
    
    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.payment_intent_id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      showtime_id: paymentIntent.showtime_id,
      number_of_seats: paymentIntent.number_of_seats,
      seats_reserved: true,
      message: "Payment intent created. Seats temporarily reserved. Complete payment within 10 minutes."
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    
    if (error.message === 'Showtime not found') {
      return sendError(res, 400, ErrorCodes.SHOWTIME_NOT_FOUND, "Showtime not found");
    }
    
    if (error.message === 'Not enough seats available') {
      return sendError(res, 400, ErrorCodes.BOOKING_NOT_ENOUGH_SEATS, "Not enough seats available");
    }
    
    if (error.message.startsWith('Price mismatch')) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, error.message);
    }
    
    if (error.message === 'STRIPE_NOT_CONFIGURED') {
      return res.status(503).json({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe payment integration is not configured. Please set STRIPE_SECRET_KEY in environment variables."
      });
    }
    
    sendError(res, 500, ErrorCodes.BOOKING_CREATE_ERROR, "Error creating payment intent");
  }
};

// POST /bookings/confirm-payment - Step 2: Confirm booking after successful payment
export const confirmPayment = async (req, res) => {
  try {
    const { 
      payment_intent_id,
      showtime_id,
      customer_name,
      customer_email,
      customer_phone,
      number_of_seats,
      total_price
    } = req.body;
    // Debug: Log user info
    console.log('Confirm payment - User from token:', req.user);
    console.log('Confirm payment - user_id:', req.user?.user_id);
    // Validation
    if (!payment_intent_id || !showtime_id || !customer_name || !customer_email || !number_of_seats || !total_price) {
      return sendError(res, 400, ErrorCodes.BOOKING_VALIDATION_ERROR, 
        "payment_intent_id, showtime_id, customer_name, customer_email, number_of_seats, and total_price are required");
    }

    const booking = await bookingModel.confirmBookingWithStripe({
      payment_intent_id,
      user_id: req.user.user_id,
      showtime_id,
      customer_name,
      customer_email,
      customer_phone,
      number_of_seats,
      total_price
    });
    
    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully! Payment received.",
      booking
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    
    if (error.message.startsWith('Payment not successful')) {
      return sendError(res, 400, "PAYMENT_FAILED", error.message);
    }
    
    if (error.message === 'STRIPE_NOT_CONFIGURED') {
      return res.status(503).json({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe payment integration is not configured."
      });
    }
    
    sendError(res, 500, ErrorCodes.BOOKING_CREATE_ERROR, "Error confirming booking after payment");
  }
};

// GET /bookings/payment-config - Get Stripe publishable key for frontend
export const getPaymentConfig = async (req, res) => {
  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    
    if (!publishableKey) {
      return res.status(503).json({
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured on the server."
      });
    }
    
    res.json({
      publishable_key: publishableKey,
      currency: 'eur',
      country: 'FI'
    });
  } catch (error) {
    console.error("Error fetching payment config:", error);
    sendError(res, 500, ErrorCodes.BOOKING_FETCH_ERROR, "Error fetching payment configuration");
  }
};

