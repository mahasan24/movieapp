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
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Stripe payment routes (B3.0) - Allow guest bookings with optionalAuth
router.get("/payment-config", getPaymentConfig); // Get Stripe publishable key (public)
router.post("/create-payment-intent", optionalAuth, createPaymentIntent); // Step 1: Create payment intent (guest allowed)
router.post("/confirm-payment", optionalAuth, confirmPayment); // Step 2: Confirm after payment (guest allowed)

// Regular booking routes
router.get("/me", authenticate, getMyBookings); // Get current user's bookings (requires login)
router.get("/", authenticate, getBookings); // Admin sees all, users see their own
router.get("/user/:userId", authenticate, getUserBookings); // User-specific bookings
router.get("/:id", authenticate, getBookingById); // Single booking (ownership checked in controller)
router.post("/", optionalAuth, createBooking); // Create booking - guest allowed
router.delete("/:id", authenticate, cancelBooking); // Cancel booking (requires login for ownership check)

export default router;
