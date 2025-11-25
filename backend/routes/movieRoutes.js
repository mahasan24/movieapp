import express from "express";
import { getAllMovies, createMovie, getMovieById, searchMovies, getMoviesByGenre, getFeaturedMovies, getTrendingMovies, getNowShowingMovies } from "../models/movie.js";
import { authenticate } from "../middleware/auth.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

const router = express.Router();

// GET featured movies
router.get("/featured", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await getFeaturedMovies(limit);
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching featured movies");
  }
});

// GET trending movies
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const movies = await getTrendingMovies(limit);
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching trending movies");
  }
});

// GET now-showing movies
router.get("/now-showing", async (req, res) => {
  try {
    const movies = await getNowShowingMovies();
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching now-showing movies");
  }
});

// GET all movies
router.get("/", async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching movies");
  }
});

// GET search movies
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return sendError(res, 400, ErrorCodes.SEARCH_QUERY_REQUIRED, "Search query is required");
    }
    const movies = await searchMovies(query);
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error searching movies");
  }
});

// GET movies by genre
router.get("/genre/:genre", async (req, res) => {
  try {
    const movies = await getMoviesByGenre(req.params.genre);
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching movies by genre");
  }
});

// GET movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) {
      return sendError(res, 404, ErrorCodes.MOVIE_NOT_FOUND, "Movie not found");
    }
    res.json(movie);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching movie by ID");
  }
});

// POST a new movie (protected)
router.post("/", authenticate, async (req, res) => {
  try {
    const saved = await createMovie(req.body);
    res.json(saved);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_CREATE_ERROR, "Error saving movie");
  }
});

export default router;
