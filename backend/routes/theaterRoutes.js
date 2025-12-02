import express from "express";
import { 
  getAllTheaters, 
  getTheaterById, 
  getTheatersByCity,
  createTheater,
  updateTheater,
  deleteTheater
} from "../models/theater.js";
import { authenticate, requireRole } from "../middleware/auth.js";

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
router.post("/", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const theater = await createTheater(req.body);
    res.status(201).json(theater);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating theater" });
  }
});

// PUT update theater (admin only)
router.put("/:id", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const theater = await updateTheater(req.params.id, req.body);
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json(theater);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating theater" });
  }
});

// DELETE theater (admin only)
router.delete("/:id", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const theater = await deleteTheater(req.params.id);
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json({ message: "Theater deleted successfully", theater });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting theater" });
  }
});

export default router;
