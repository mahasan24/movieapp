// Activity Logs Routes
// Week 3 - Teammate A (A3.3)
// Admin-only endpoints to view activity logs

import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getActivityLogs, getActivitySummary } from "../services/activityLogger.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

const router = express.Router();

// All activity log routes require admin authentication
router.use(authenticate, requireRole('admin'));

/**
 * GET /activity-logs
 * Get activity logs with pagination and filtering
 * Query params: userId, action, entityType, limit, offset, startDate, endDate
 */
router.get("/", async (req, res) => {
  try {
    const {
      userId,
      action,
      entityType,
      limit = 50,
      offset = 0,
      startDate,
      endDate
    } = req.query;
    
    const logs = await getActivityLogs({
      userId: userId ? parseInt(userId) : null,
      action,
      entityType,
      limit: parseInt(limit),
      offset: parseInt(offset),
      startDate,
      endDate
    });
    
    res.json(logs);
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    sendError(res, 500, ErrorCodes.INTERNAL_SERVER_ERROR, "Error fetching activity logs");
  }
});

/**
 * GET /activity-logs/summary
 * Get activity summary statistics
 * Query params: days (default 30)
 */
router.get("/summary", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const summary = await getActivitySummary(days);
    res.json(summary);
  } catch (error) {
    console.error("Error fetching activity summary:", error);
    sendError(res, 500, ErrorCodes.INTERNAL_SERVER_ERROR, "Error fetching activity summary");
  }
});

/**
 * GET /activity-logs/user/:userId
 * Get activity logs for a specific user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { limit = 50, offset = 0 } = req.query;
    
    const logs = await getActivityLogs({
      userId,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(logs);
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    sendError(res, 500, ErrorCodes.INTERNAL_SERVER_ERROR, "Error fetching user activity logs");
  }
});

export default router;