import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
