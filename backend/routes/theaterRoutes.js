import express from "express";
import {
  getAllTheaters,
  getTheaterById,
  createTheater,
  updateTheater,
  deleteTheater
} from "../controllers/theaterController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllTheaters);
router.get("/:id", getTheaterById);

// Admin-only routes
router.post("/", authenticate, requireRole('admin'), createTheater);
router.put("/:id", authenticate, requireRole('admin'), updateTheater);
router.delete("/:id", authenticate, requireRole('admin'), deleteTheater);

export default router;

