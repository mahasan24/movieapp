import express from "express";
import { getAdminSummary } from "../controllers/adminController.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.get("/summary", authenticate, requireRole('admin'), getAdminSummary);

export default router;

