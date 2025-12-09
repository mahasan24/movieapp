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
app.use(cors());
app.use(express.json());

// routes
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/theaters", theaterRoutes);
app.use("/auditoriums", auditoriumRoutes);
app.use("/showtimes", showtimeRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/activity-logs", activityLogRoutes);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // DB connection test
    await pool.query('SELECT 1');
    app.listen(PORT, () => {
      console.log('=================================');
      console.log('🎬 Movie Booking API Server');
      console.log('=================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log('=================================');
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();