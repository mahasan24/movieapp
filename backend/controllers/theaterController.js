import * as theaterModel from "../models/theater.js";

// GET /theaters - Get all theaters
export const getAllTheaters = async (req, res) => {
  try {
    const theaters = await theaterModel.getAllTheaters();
    res.json(theaters);
  } catch (error) {
    console.error("Error fetching theaters:", error);
    res.status(500).json({ message: "Error fetching theaters", error: error.message });
  }
};

// GET /theaters/:id - Get theater by ID
export const getTheaterById = async (req, res) => {
  try {
    const theater = await theaterModel.getTheaterById(req.params.id);
    if (!theater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    res.json(theater);
  } catch (error) {
    console.error("Error fetching theater:", error);
    res.status(500).json({ message: "Error fetching theater", error: error.message });
  }
};

// POST /theaters - Create a new theater (ADMIN ONLY)
export const createTheater = async (req, res) => {
  try {
    const { name, address, city, phone, total_auditoriums } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Theater name is required" });
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
    res.status(500).json({ message: "Error creating theater", error: error.message });
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
      return res.status(404).json({ message: "Theater not found" });
    }
    
    res.json(updatedTheater);
  } catch (error) {
    console.error("Error updating theater:", error);
    res.status(500).json({ message: "Error updating theater", error: error.message });
  }
};

// DELETE /theaters/:id - Delete theater (ADMIN ONLY)
export const deleteTheater = async (req, res) => {
  try {
    const deletedTheater = await theaterModel.deleteTheater(req.params.id);
    
    if (!deletedTheater) {
      return res.status(404).json({ message: "Theater not found" });
    }
    
    res.json({ message: "Theater deleted successfully", theater: deletedTheater });
  } catch (error) {
    console.error("Error deleting theater:", error);
    res.status(500).json({ message: "Error deleting theater", error: error.message });
  }
};

