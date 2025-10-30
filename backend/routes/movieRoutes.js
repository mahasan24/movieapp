import express from "express";
import mongoose from "mongoose";
import Movie from "../models/movie.js"; // ✅ lowercase file name match!

const router = express.Router();

// GET all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching movies" });
  }
});

// POST a new movie
router.post("/", async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const saved = await movie.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error saving movie" });
  }
});

export default router; 
