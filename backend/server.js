import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import theaterRoutes from "./routes/theaterRoutes.js";
import auditoriumRoutes from "./routes/auditoriumRoutes.js";
import showtimeRoutes from "./routes/showtimeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import activityLogRoutes from "./routes/activityLogRoutes.js";
import pool from "./db/index.js";

dotenv.config();

const app = express();

// Honor X-Forwarded-For when behind a proxy (needed for accurate rate limits)
app.set("trust proxy", 1);

// ===== Security Middleware =====
// Allow external assets (e.g., Stripe, Unsplash) while keeping sensible defaults
app.use(helmet({
  crossOriginResourcePolicy: false,      // allow images/scripts from other origins
  crossOriginEmbedderPolicy: false,      // avoid blocking external assets
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:", "https://images.unsplash.com"],
      "script-src": ["'self'", "https://js.stripe.com"],
      "frame-src": ["'self'", "https://js.stripe.com"],
    },
  },
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // per IP in window
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
  skip: (req) => req.method === "OPTIONS", // don't count CORS preflight
});
app.use(limiter);

// ===== CORS Configuration =====
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://gray-wave-0fdd21e03.3.azurestaticapps.net",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("Blocked CORS request from:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ===== Health Check =====
app.get("/health", async (_req, res) => {
  let dbStatus = "down";
  try {
    await pool.query("SELECT 1");
    dbStatus = "up";
  } catch (err) {
    console.error("Healthcheck DB ping failed:", err.message);
  }

  const payload = {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbStatus,
  };

  return dbStatus === "up"
    ? res.json(payload)
    : res.status(503).json(payload);
});

// ===== Routes =====
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/theaters", theaterRoutes);
app.use("/auditoriums", auditoriumRoutes);
app.use("/showtimes", showtimeRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/activity-logs", activityLogRoutes);

// ===== Start Server =====
const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Test DB connection
    try {
      await pool.query("SELECT 1");
      console.log("✅ Database connected successfully");
    } catch (dbErr) {
      console.error("❌ Database connection failed:", dbErr.message);
    }

    app.listen(PORT, () => {
      console.log("=================================");
      console.log("🎬 Movie Booking API Server");
      console.log("=================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log("=================================");
    });

  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
