import express from "express";
import { getAllMovies, createMovie } from "../models/movie.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// GET all movies
router.get("/", async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching movies" });
  }
});

// POST a new movie (protected)
router.post("/", authenticate, async (req, res) => {
  try {
    const saved = await createMovie(req.body);
    res.json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving movie" });
  }
});

export default router;
