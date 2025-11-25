import express from "express";
import { 
  getAllMovies, 
  createMovie, 
  getMovieById, 
  searchMovies, 
  getMoviesByGenre,
  getFeaturedMovies,
  getTrendingMovies,
  getNowShowingMovies
} from "../models/movie.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// B1.1: GET featured movies
router.get("/featured", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await getFeaturedMovies(limit);
    res.json(movies);
  } catch (error) {
    console.error("Error fetching featured movies:", error);
    res.status(500).json({ message: "Error fetching featured movies" });
  }
});

// B1.1: GET trending movies
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await getTrendingMovies(limit);
    res.json(movies);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    res.status(500).json({ message: "Error fetching trending movies" });
  }
});

// B1.1: GET now showing movies
router.get("/now-showing", async (req, res) => {
  try {
    const movies = await getNowShowingMovies();
    res.json(movies);
  } catch (error) {
    console.error("Error fetching now showing movies:", error);
    res.status(500).json({ message: "Error fetching now showing movies" });
  }
});

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
// GET search movies
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const movies = await searchMovies(query);
    res.json(movies);  // Fixed typo: was res.jeson()
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching movies" });
  }
});

// GET movies by genre
router.get("/genre/:genre", async (req, res) => {  // Fixed: added / before genre
  try {
    const movies = await getMoviesByGenre(req.params.genre);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching movies by genre" });
  }
});

// GET movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching movie by ID" });
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
