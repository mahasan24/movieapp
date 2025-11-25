import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
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
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Role-based authorization middleware
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // role is boolean: FALSE = user, TRUE = admin
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    if (requiredRole === 'admin' && !isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  };
};

// Middleware to ensure user can only access their own resources
export const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
  const requestedUserId = parseInt(req.params.userId || req.query.userId || req.body.user_id);
  
  // Admin can access any resource, user can only access their own
  if (!isAdmin && requestedUserId && requestedUserId !== req.user.user_id) {
    return res.status(403).json({ message: "You can only access your own resources" });
  }
  
  next();
};