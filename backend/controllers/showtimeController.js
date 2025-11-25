import * as showtimeModel from "../models/showtime.js";

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
    res.status(500).json({ message: "Error fetching showtimes", error: error.message });
  }
};

// GET /showtimes/:id - Get showtime by ID
export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await showtimeModel.getShowtimeById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    res.json(showtime);
  } catch (error) {
    console.error("Error fetching showtime:", error);
    res.status(500).json({ message: "Error fetching showtime", error: error.message });
  }
};

// POST /showtimes - Create a new showtime (ADMIN ONLY)
export const createShowtime = async (req, res) => {
  try {
    const { movie_id, auditorium_id, show_date, show_time, price, available_seats } = req.body;
    
    if (!movie_id || !auditorium_id || !show_date || !show_time || price === undefined || available_seats === undefined) {
      return res.status(400).json({ 
        message: "movie_id, auditorium_id, show_date, show_time, price, and available_seats are required" 
      });
    }

    if (price < 0) {
      return res.status(400).json({ message: "Price must be non-negative" });
    }

    if (available_seats < 0) {
      return res.status(400).json({ message: "Available seats must be non-negative" });
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
    res.status(500).json({ message: "Error creating showtime", error: error.message });
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
      return res.status(404).json({ message: "Showtime not found" });
    }
    
    res.json(updatedShowtime);
  } catch (error) {
    console.error("Error updating showtime:", error);
    res.status(500).json({ message: "Error updating showtime", error: error.message });
  }
};

// DELETE /showtimes/:id - Delete showtime (ADMIN ONLY)
export const deleteShowtime = async (req, res) => {
  try {
    const deletedShowtime = await showtimeModel.deleteShowtime(req.params.id);
    
    if (!deletedShowtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    
    res.json({ message: "Showtime deleted successfully", showtime: deletedShowtime });
  } catch (error) {
    console.error("Error deleting showtime:", error);
    res.status(500).json({ message: "Error deleting showtime", error: error.message });
  }
};

