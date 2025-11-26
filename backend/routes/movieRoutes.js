import express from "express";
import { 
  getAllMovies, 
  createMovie, 
  getMovieById, 
  searchMovies, 
  getMoviesByGenre,
  updateMovie,
  deleteMovie,
  getFeaturedMovies,
  getTrendingMovies,
  getNowShowingMovies,
  searchExternalMovies,
  importMovieFromTmdb,
  importPopularMovies
} from "../models/movie.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

const router = express.Router();

// External movie search from TMDB (Admin only)
router.get("/external/search", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { q, language } = req.query;
    
    if (!q) {
      return sendError(res, 400, ErrorCodes.SEARCH_QUERY_REQUIRED, "Search query parameter 'q' is required");
    }
    
    const results = await searchExternalMovies(q, language || 'en');
    res.json(results);
  } catch (error) {
    console.error('Error searching external movies:', error);
    
    if (error.message === 'TMDB_API_KEY not configured') {
      return res.status(503).json({
        code: "TMDB_NOT_CONFIGURED",
        message: "TMDB integration is not configured. Please set TMDB_API_KEY in environment variables."
      });
    }
    
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error searching external movies");
  }
});

// Import movie from TMDB (Admin only)
router.post("/import", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { tmdb_id, language } = req.body;
    
    if (!tmdb_id) {
      return sendError(res, 400, ErrorCodes.MOVIE_VALIDATION_ERROR, "tmdb_id is required");
    }
    
    const movie = await importMovieFromTmdb(tmdb_id, language || 'en');
    res.status(201).json(movie);
  } catch (error) {
    console.error('Error importing movie:', error);
    
    if (error.message === 'Movie already exists in database') {
      return res.status(409).json({
        code: "MOVIE_ALREADY_EXISTS",
        message: "This movie has already been imported"
      });
    }
    
    if (error.message === 'Movie not found on TMDB') {
      return sendError(res, 404, ErrorCodes.MOVIE_NOT_FOUND, "Movie not found on TMDB");
    }
    
    if (error.message === 'TMDB_API_KEY not configured') {
      return res.status(503).json({
        code: "TMDB_NOT_CONFIGURED",
        message: "TMDB integration is not configured"
      });
    }
    
    sendError(res, 500, ErrorCodes.MOVIE_CREATE_ERROR, "Error importing movie from TMDB");
  }
});

// Batch import popular movies (Admin only)
router.post("/import/popular", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { count, language } = req.body;
    
    const movies = await importPopularMovies(count || 10, language || 'en');
    
    res.status(201).json({
      message: `Successfully imported ${movies.length} movies`,
      movies: movies
    });
  } catch (error) {
    console.error('Error batch importing movies:', error);
    sendError(res, 500, ErrorCodes.MOVIE_CREATE_ERROR, "Error batch importing movies from TMDB");
  }
});

// GET featured movies
router.get("/featured", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const language = req.query.language || null;
    const movies = await getFeaturedMovies(limit, language);
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
    const language = req.query.language || null;
    const movies = await getTrendingMovies(limit, language);
    res.json(movies);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error fetching trending movies");
  }
});

// GET now-showing movies
router.get("/now-showing", async (req, res) => {
  try {
    const language = req.query.language || null;
    const movies = await getNowShowingMovies(language);
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

// POST a new movie (admin only)
router.post("/", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const saved = await createMovie(req.body);
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_CREATE_ERROR, "Error saving movie");
  }
});

// PUT /movies/:id - Update movie (admin only)
router.put("/:id", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const updated = await updateMovie(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 404, ErrorCodes.MOVIE_NOT_FOUND, "Movie not found");
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error updating movie");
  }
});

// DELETE /movies/:id - Delete movie (admin only)
router.delete("/:id", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const deleted = await deleteMovie(req.params.id);
    if (!deleted) {
      return sendError(res, 404, ErrorCodes.MOVIE_NOT_FOUND, "Movie not found");
    }
    res.json({ 
      message: "Movie deleted successfully", 
      movie: deleted 
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, ErrorCodes.MOVIE_FETCH_ERROR, "Error deleting movie");
  }
});

export default router;
