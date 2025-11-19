import express from "express";
import {
  getBookings,
  getUserBookings,
  getBookingById,
  createBooking,
  cancelBooking
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// All booking routes require authentication
router.get("/", authenticate, getBookings); // Admin sees all, users see their own
router.get("/user/:userId", authenticate, getUserBookings); // User-specific bookings
router.get("/:id", authenticate, getBookingById); // Single booking (ownership checked in controller)
router.post("/", authenticate, createBooking); // Create booking (user-specific)
router.delete("/:id", authenticate, cancelBooking); // Cancel booking (ownership checked in controller)

export default router;

