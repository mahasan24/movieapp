import express from "express";
import {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime
} from "../controllers/showtimeController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getShowtimes);
router.get("/:id", getShowtimeById);

// Admin-only routes
router.post("/", authenticate, requireRole('admin'), createShowtime);
router.put("/:id", authenticate, requireRole('admin'), updateShowtime);
router.delete("/:id", authenticate, requireRole('admin'), deleteShowtime);

export default router;

