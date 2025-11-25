import * as auditoriumModel from "../models/auditorium.js";
import { ErrorCodes, sendError } from "../utils/errors.js";

// GET /auditoriums - Get all auditoriums (optionally filter by theater_id)
export const getAllAuditoriums = async (req, res) => {
  try {
    const { theater_id } = req.query;
    const auditoriums = await auditoriumModel.getAllAuditoriums(theater_id || null);
    res.json(auditoriums);
  } catch (error) {
    console.error("Error fetching auditoriums:", error);
    sendError(res, 500, ErrorCodes.AUDITORIUM_FETCH_ERROR, "Error fetching auditoriums");
  }
};

// GET /auditoriums/:id - Get auditorium by ID
export const getAuditoriumById = async (req, res) => {
  try {
    const auditorium = await auditoriumModel.getAuditoriumById(req.params.id);
    if (!auditorium) {
      return res.status(404).json({ message: "Auditorium not found" });
    }
    res.json(auditorium);
  } catch (error) {
    console.error("Error fetching auditorium:", error);
    sendError(res, 500, ErrorCodes.AUDITORIUM_FETCH_ERROR, "Error fetching auditorium");
  }
};

// POST /auditoriums - Create a new auditorium (ADMIN ONLY)
export const createAuditorium = async (req, res) => {
  try {
    const { theater_id, name, seating_capacity } = req.body;
    
    if (!theater_id || !name || !seating_capacity) {
      return sendError(res, 400, ErrorCodes.AUDITORIUM_VALIDATION_ERROR, 
        "theater_id, name, and seating_capacity are required");
    }

    if (seating_capacity <= 0) {
      return sendError(res, 400, ErrorCodes.AUDITORIUM_VALIDATION_ERROR, "seating_capacity must be greater than 0");
    }

    const newAuditorium = await auditoriumModel.createAuditorium({
      theater_id,
      name,
      seating_capacity
    });
    
    res.status(201).json(newAuditorium);
  } catch (error) {
    console.error("Error creating auditorium:", error);
    sendError(res, 500, ErrorCodes.AUDITORIUM_CREATE_ERROR, "Error creating auditorium");
  }
};

// PUT /auditoriums/:id - Update auditorium (ADMIN ONLY)
export const updateAuditorium = async (req, res) => {
  try {
    const { theater_id, name, seating_capacity } = req.body;
    
    const updatedAuditorium = await auditoriumModel.updateAuditorium(req.params.id, {
      theater_id,
      name,
      seating_capacity
    });
    
    if (!updatedAuditorium) {
      return sendError(res, 404, ErrorCodes.AUDITORIUM_NOT_FOUND, "Auditorium not found");
    }
    
    res.json(updatedAuditorium);
  } catch (error) {
    console.error("Error updating auditorium:", error);
    sendError(res, 500, ErrorCodes.AUDITORIUM_UPDATE_ERROR, "Error updating auditorium");
  }
};

// DELETE /auditoriums/:id - Delete auditorium (ADMIN ONLY)
export const deleteAuditorium = async (req, res) => {
  try {
    const deletedAuditorium = await auditoriumModel.deleteAuditorium(req.params.id);
    
    if (!deletedAuditorium) {
      return sendError(res, 404, ErrorCodes.AUDITORIUM_NOT_FOUND, "Auditorium not found");
    }
    
    res.json({ message: "Auditorium deleted successfully", auditorium: deletedAuditorium });
  } catch (error) {
    console.error("Error deleting auditorium:", error);
    sendError(res, 500, ErrorCodes.AUDITORIUM_DELETE_ERROR, "Error deleting auditorium");
  }
};

