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
  searchExternalMovies,     // A1.3 - NEW
  importMovieFromTmdb,      // A1.3 - NEW
  importPopularMovies       // A1.3 - NEW (bonus)
} from "../models/movie.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = express.Router();

// A1.3 - External movie search from TMDB (Admin only - for import UI)
router.get("/external/search", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { q, language } = req.query;
    
    if (!q) {
      return res.status(400).json({
        code: "SEARCH_QUERY_REQUIRED",
        message: "Search query parameter 'q' is required"
      });
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
    
    res.status(500).json({
      code: "EXTERNAL_SEARCH_ERROR",
      message: "Error searching external movies"
    });
  }
});

// A1.3 - Import movie from TMDB (Admin only)
router.post("/import", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { tmdb_id, language } = req.body;
    
    if (!tmdb_id) {
      return res.status(400).json({
        code: "TMDB_ID_REQUIRED",
        message: "tmdb_id is required"
      });
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
      return res.status(404).json({
        code: "TMDB_MOVIE_NOT_FOUND",
        message: "Movie not found on TMDB"
      });
    }
    
    if (error.message === 'TMDB_API_KEY not configured') {
      return res.status(503).json({
        code: "TMDB_NOT_CONFIGURED",
        message: "TMDB integration is not configured"
      });
    }
    
    res.status(500).json({
      code: "IMPORT_ERROR",
      message: "Error importing movie from TMDB"
    });
  }
});

// A1.3 - BONUS: Batch import popular movies (Admin only, for quick seeding)
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
    res.status(500).json({
      code: "BATCH_IMPORT_ERROR",
      message: "Error batch importing movies from TMDB"
    });
  }
});

// B1.1 - Home content endpoints
router.get("/featured", async (req, res) => {
  try {
    const { language } = req.query;
    const movies = await getFeaturedMovies(language);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "FETCH_FEATURED_ERROR",
      message: "Error fetching featured movies"
    });
  }
});

router.get("/trending", async (req, res) => {
  try {
    const { language } = req.query;
    const movies = await getTrendingMovies(language);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "FETCH_TRENDING_ERROR",
      message: "Error fetching trending movies"
    });
  }
});

router.get("/now-showing", async (req, res) => {
  try {
    const { language } = req.query;
    const movies = await getNowShowingMovies(language);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "FETCH_NOW_SHOWING_ERROR",
      message: "Error fetching now showing movies"
    });
  }
});

// GET search movies (internal database search)
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) {
      return res.status(400).json({
        code: "SEARCH_QUERY_REQUIRED",
        message: "Search query is required"
      });
    }
    const movies = await searchMovies(query);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "SEARCH_ERROR",
      message: "Error searching movies"
    });
  }
});

// GET movies by genre
router.get("/genre/:genre", async (req, res) => {
  try {
    const movies = await getMoviesByGenre(req.params.genre);
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "FETCH_GENRE_ERROR",
      message: "Error fetching movies by genre"
    });
  }
});

// GET all movies
router.get("/", async (req, res) => {
  try {
    const movies = await getAllMovies();
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "FETCH_MOVIES_ERROR",
      message: "Error fetching movies"
    });
  }
});

// GET movie by ID
router.get("/:id", async (req, res) => {
  try {
    const movie = await getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        code: "MOVIE_NOT_FOUND",
        message: "Movie not found"
      });
    }
    res.json(movie);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "FETCH_MOVIE_ERROR",
      message: "Error fetching movie by ID"
    });
  }
});

// POST a new movie (admin only)
router.post("/", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const saved = await createMovie(req.body);
    res.status(201).json(saved);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "CREATE_MOVIE_ERROR",
      message: "Error saving movie"
    });
  }
});

// PUT /movies/:id - Update movie (admin only)
router.put("/:id", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const updated = await updateMovie(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        code: "MOVIE_NOT_FOUND",
        message: "Movie not found"
      });
    }
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "UPDATE_MOVIE_ERROR",
      message: "Error updating movie"
    });
  }
});

// DELETE /movies/:id - Delete movie (admin only)
router.delete("/:id", authenticate, requireRole('admin'), async (req, res) => {
  try {
    const deleted = await deleteMovie(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        code: "MOVIE_NOT_FOUND",
        message: "Movie not found"
      });
    }
    res.json({ 
      message: "Movie deleted successfully", 
      movie: deleted 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: "DELETE_MOVIE_ERROR",
      message: "Error deleting movie"
    });
  }
});

export default router;