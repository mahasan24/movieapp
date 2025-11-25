import * as theaterModel from "../models/theater.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

// GET /theaters - Get all theaters
export const getAllTheaters = async (req, res) => {
  try {
    const theaters = await theaterModel.getAllTheaters();
    res.json(theaters);
  } catch (error) {
    console.error("Error fetching theaters:", error);
    sendError(res, 500, ErrorCodes.THEATER_FETCH_ERROR, "Error fetching theaters");
  }
};

// GET /theaters/:id - Get theater by ID
export const getTheaterById = async (req, res) => {
  try {
    const theater = await theaterModel.getTheaterById(req.params.id);
    if (!theater) {
      return sendError(res, 404, ErrorCodes.THEATER_NOT_FOUND, "Theater not found");
    }
    res.json(theater);
  } catch (error) {
    console.error("Error fetching theater:", error);
    sendError(res, 500, ErrorCodes.THEATER_FETCH_ERROR, "Error fetching theater");
  }
};

// POST /theaters - Create a new theater (ADMIN ONLY)
export const createTheater = async (req, res) => {
  try {
    const { name, address, city, phone, total_auditoriums } = req.body;
    
    if (!name) {
      return sendError(res, 400, ErrorCodes.THEATER_VALIDATION_ERROR, "Theater name is required");
    }

    const newTheater = await theaterModel.createTheater({
      name,
      address,
      city,
      phone,
      total_auditoriums
    });
    
    res.status(201).json(newTheater);
  } catch (error) {
    console.error("Error creating theater:", error);
    sendError(res, 500, ErrorCodes.THEATER_CREATE_ERROR, "Error creating theater");
  }
};

// PUT /theaters/:id - Update theater (ADMIN ONLY)
export const updateTheater = async (req, res) => {
  try {
    const { name, address, city, phone, total_auditoriums } = req.body;
    
    const updatedTheater = await theaterModel.updateTheater(req.params.id, {
      name,
      address,
      city,
      phone,
      total_auditoriums
    });
    
    if (!updatedTheater) {
      return sendError(res, 404, ErrorCodes.THEATER_NOT_FOUND, "Theater not found");
    }
    
    res.json(updatedTheater);
  } catch (error) {
    console.error("Error updating theater:", error);
    sendError(res, 500, ErrorCodes.THEATER_UPDATE_ERROR, "Error updating theater");
  }
};

// DELETE /theaters/:id - Delete theater (ADMIN ONLY)
export const deleteTheater = async (req, res) => {
  try {
    const deletedTheater = await theaterModel.deleteTheater(req.params.id);
    
    if (!deletedTheater) {
      return sendError(res, 404, ErrorCodes.THEATER_NOT_FOUND, "Theater not found");
    }
    
    res.json({ message: "Theater deleted successfully", theater: deletedTheater });
  } catch (error) {
    console.error("Error deleting theater:", error);
    sendError(res, 500, ErrorCodes.THEATER_DELETE_ERROR, "Error deleting theater");
  }
};

