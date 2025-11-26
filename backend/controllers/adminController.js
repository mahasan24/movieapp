import * as adminModel from "../models/admin.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

/**
 * GET /admin/summary - Get admin dashboard summary
 * Admin-only endpoint
 */
export const getAdminSummary = async (req, res) => {
  try {
    const summary = await adminModel.getAdminSummary();
    res.json(summary);
  } catch (error) {
    console.error("Error fetching admin summary:", error);
    sendError(res, 500, ErrorCodes.INTERNAL_SERVER_ERROR, "Error fetching admin summary");
  }
};

