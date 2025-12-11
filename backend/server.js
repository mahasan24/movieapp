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

// ------------ IMPORTANT FOR AZURE ------------
app.set("trust proxy", 1); // ensures correct protocol handling on Azure
// ---------------------------------------------

// Allowed frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL,              // e.g. "https://movieapp-frontend.azurewebsites.net"
  "http://localhost:5173",               // local dev
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked CORS origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ---------------- Routes ----------------
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
    console.log("🔌 Testing DB connection...");
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log("=================================");
      console.log("🎬 Movie Booking API Server");
      console.log("=================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Public URL (Azure): ${process.env.API_BASE_URL}`);
      console.log(`💻 Local URL: http://localhost:${PORT}`);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
}

start();
