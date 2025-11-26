import * as showtimeModel from "../models/showtime.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

// GET /showtimes - Get showtimes with filters
// Query params: movie_id, theater_id, date, auditorium_id
export const getShowtimes = async (req, res) => {
  try {
    const { movie_id, theater_id, date, auditorium_id } = req.query;
    
    const showtimes = await showtimeModel.getShowtimes({
      movie_id: movie_id || null,
      theater_id: theater_id || null,
      date: date || null,
      auditorium_id: auditorium_id || null
    });
    
    res.json(showtimes);
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    sendError(res, 500, ErrorCodes.SHOWTIME_FETCH_ERROR, "Error fetching showtimes");
  }
};

// GET /showtimes/:id - Get showtime by ID
export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await showtimeModel.getShowtimeById(req.params.id);
    if (!showtime) {
      return sendError(res, 404, ErrorCodes.SHOWTIME_NOT_FOUND, "Showtime not found");
    }
    res.json(showtime);
  } catch (error) {
    console.error("Error fetching showtime:", error);
    sendError(res, 500, ErrorCodes.SHOWTIME_FETCH_ERROR, "Error fetching showtime");
  }
};

// POST /showtimes - Create a new showtime (ADMIN ONLY)
export const createShowtime = async (req, res) => {
  try {
    const { movie_id, auditorium_id, show_date, show_time, price, available_seats } = req.body;
    
    if (!movie_id || !auditorium_id || !show_date || !show_time || price === undefined || available_seats === undefined) {
      return sendError(res, 400, ErrorCodes.SHOWTIME_VALIDATION_ERROR,
        "movie_id, auditorium_id, show_date, show_time, price, and available_seats are required");
    }

    if (price < 0) {
      return sendError(res, 400, ErrorCodes.SHOWTIME_VALIDATION_ERROR, "Price must be non-negative");
    }

    if (available_seats < 0) {
      return sendError(res, 400, ErrorCodes.SHOWTIME_VALIDATION_ERROR, "Available seats must be non-negative");
    }

    const newShowtime = await showtimeModel.createShowtime({
      movie_id,
      auditorium_id,
      show_date,
      show_time,
      price,
      available_seats
    });
    
    res.status(201).json(newShowtime);
  } catch (error) {
    console.error("Error creating showtime:", error);
    sendError(res, 500, ErrorCodes.SHOWTIME_CREATE_ERROR, "Error creating showtime");
  }
};

// PUT /showtimes/:id - Update showtime (ADMIN ONLY)
export const updateShowtime = async (req, res) => {
  try {
    const { movie_id, auditorium_id, show_date, show_time, price, available_seats } = req.body;
    
    const updatedShowtime = await showtimeModel.updateShowtime(req.params.id, {
      movie_id,
      auditorium_id,
      show_date,
      show_time,
      price,
      available_seats
    });
    
    if (!updatedShowtime) {
      return sendError(res, 404, ErrorCodes.SHOWTIME_NOT_FOUND, "Showtime not found");
    }
    
    res.json(updatedShowtime);
  } catch (error) {
    console.error("Error updating showtime:", error);
    sendError(res, 500, ErrorCodes.SHOWTIME_UPDATE_ERROR, "Error updating showtime");
  }
};

// DELETE /showtimes/:id - Delete showtime (ADMIN ONLY)
export const deleteShowtime = async (req, res) => {
  try {
    const deletedShowtime = await showtimeModel.deleteShowtime(req.params.id);
    
    if (!deletedShowtime) {
      return sendError(res, 404, ErrorCodes.SHOWTIME_NOT_FOUND, "Showtime not found");
    }
    
    res.json({ message: "Showtime deleted successfully", showtime: deletedShowtime });
  } catch (error) {
    console.error("Error deleting showtime:", error);
    sendError(res, 500, ErrorCodes.SHOWTIME_DELETE_ERROR, "Error deleting showtime");
  }
};

