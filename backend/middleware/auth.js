import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, 401, ErrorCodes.AUTH_MISSING_TOKEN, "Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
    // attach minimal payload (use user_id)
    req.user = { user_id: payload.user_id, email: payload.email, role: payload.role };
    // fetch full user without password
    try {
      const user = await getUserById(payload.user_id);
      if (user) req.user = user;
    } catch (e) {
      // ignore fetch error
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, ErrorCodes.AUTH_EXPIRED_TOKEN, "Token has expired");
    }
    return sendError(res, 401, ErrorCodes.AUTH_INVALID_TOKEN, "Invalid or expired token");
  }
};

// Optional auth: attaches req.user if token is valid, otherwise continues without error
export const optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
    req.user = { user_id: payload.user_id, email: payload.email, role: payload.role };
    try {
      const user = await getUserById(payload.user_id);
      if (user) req.user = user;
    } catch (e) {
      // ignore fetch error
    }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, ErrorCodes.AUTH_EXPIRED_TOKEN, "Token has expired");
    }
    return sendError(res, 401, ErrorCodes.AUTH_INVALID_TOKEN, "Invalid or expired token");
  }
};

// Role-based authorization middleware
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, ErrorCodes.AUTH_REQUIRED, "Authentication required");
    }
    
    // role is boolean: FALSE = user, TRUE = admin
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    if (requiredRole === 'admin' && !isAdmin) {
      return sendError(res, 403, ErrorCodes.AUTH_ADMIN_REQUIRED, "Admin access required");
    }
    
    next();
  };
};

// Middleware to ensure user can only access their own resources
export const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, ErrorCodes.AUTH_REQUIRED, "Authentication required");
  }
  
  const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
  const requestedUserId = parseInt(req.params.userId || req.query.userId || req.body.user_id);
  
  // Admin can access any resource, user can only access their own
  if (!isAdmin && requestedUserId && requestedUserId !== req.user.user_id) {
    return sendError(res, 403, ErrorCodes.AUTH_OWNERSHIP_REQUIRED, "You can only access your own resources");
  }
  
  next();
};