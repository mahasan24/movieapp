import express from "express";
import {
  getAllAuditoriums,
  getAuditoriumById,
  createAuditorium,
  updateAuditorium,
  deleteAuditorium
} from "../controllers/auditoriumController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllAuditoriums);
router.get("/:id", getAuditoriumById);

// Admin-only routes
router.post("/", authenticate, requireRole('admin'), createAuditorium);
router.put("/:id", authenticate, requireRole('admin'), updateAuditorium);
router.delete("/:id", authenticate, requireRole('admin'), deleteAuditorium);

export default router;

