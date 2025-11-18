import express from "express";
import { 
  getAllTheaters, 
  getTheaterById, 
  getTheatersByCity,
  createTheater 
} from "../models/theater.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET all theaters
router.get("/", async (req, res) => {
  try {
    const theaters = await getAllTheaters();
    res.json(theaters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching theaters" });
  }
});

// GET theaters by city
router.get("/city/:city", async (req, res) => {
  try {
    const theaters = await getTheatersByCity(req.params.city);
    res.json(theaters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching theaters by city" });
  }
});

// GET theater by ID
router.get("/:id", async (req, res) => {
  try {
    const theater = await getTheaterById(req.params.id);
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json(theater);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching theater" });
  }
});

// POST create theater (admin only)
router.post("/", authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.role) {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const theater = await createTheater(req.body);
    res.status(201).json(theater);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating theater" });
  }
});

export default router;