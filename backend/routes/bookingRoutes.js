import express from "express";
import {
  getBookings,
  getUserBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  getMyBookings,
  createPaymentIntent,
  confirmPayment,
  getPaymentConfig
} from "../controllers/bookingController.js";
import { authenticate, optionalAuthenticate } from "../middleware/auth.js";

const router = express.Router();

// Stripe payment routes (B3.0)
router.get("/payment-config", optionalAuthenticate, getPaymentConfig); // Get Stripe publishable key
router.post("/create-payment-intent", optionalAuthenticate, createPaymentIntent); // Step 1: Create payment intent
router.post("/confirm-payment", optionalAuthenticate, confirmPayment); // Step 2: Confirm after payment

// Regular booking routes
router.get("/me", authenticate, getMyBookings); // Get current user's bookings
router.get("/", authenticate, getBookings); // Admin sees all, users see their own
router.get("/user/:userId", authenticate, getUserBookings); // User-specific bookings
router.get("/:id", authenticate, getBookingById); // Single booking (ownership checked in controller)
router.post("/", optionalAuthenticate, createBooking); // Create booking (legacy mock payment, now allows guests)
router.delete("/:id", authenticate, cancelBooking); // Cancel booking (with Stripe refund support)

export default router;

