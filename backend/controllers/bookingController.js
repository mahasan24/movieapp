import * as bookingModel from "../models/booking.js";

// GET /bookings - Get all bookings (ADMIN) or user's bookings (USER)
// Admin can see all bookings, users can only see their own
export const getBookings = async (req, res) => {
  try {
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Admin can get all bookings, users only their own
    const user_id = isAdmin ? null : req.user.user_id;
    
    const bookings = await bookingModel.getBookings(user_id);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
};

// GET /bookings/user/:userId - Get bookings for a specific user (ADMIN or OWN USER)
export const getUserBookings = async (req, res) => {
  try {
    const requestedUserId = parseInt(req.params.userId);
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Users can only access their own bookings, admins can access anyone's
    if (!isAdmin && requestedUserId !== req.user.user_id) {
      return res.status(403).json({ message: "You can only access your own bookings" });
    }
    
    const bookings = await bookingModel.getUserBookings(requestedUserId);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Error fetching user bookings", error: error.message });
  }
};

// GET /bookings/:id - Get booking by ID (ADMIN or OWNER)
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingModel.getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Users can only view their own bookings, admins can view any
    if (!isAdmin && booking.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only view your own bookings" });
    }
    
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
};

// POST /bookings - Create a new booking (AUTHENTICATED USER)
export const createBooking = async (req, res) => {
  try {
    const { 
      showtime_id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      number_of_seats, 
      total_price,
      payment_method 
    } = req.body;
    
    if (!showtime_id || !customer_name || !customer_email || !number_of_seats || !total_price) {
      return res.status(400).json({ 
        message: "showtime_id, customer_name, customer_email, number_of_seats, and total_price are required" 
      });
    }

    if (number_of_seats <= 0) {
      return res.status(400).json({ message: "number_of_seats must be greater than 0" });
    }

    if (total_price < 0) {
      return res.status(400).json({ message: "total_price must be non-negative" });
    }

    const newBooking = await bookingModel.createBooking({
      user_id: req.user.user_id,
      showtime_id,
      customer_name,
      customer_email,
      customer_phone,
      number_of_seats,
      total_price,
      payment_method: payment_method || 'mock'
    });
    
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    
    if (error.message === 'Showtime not found' || error.message === 'Not enough seats available') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

// DELETE /bookings/:id - Cancel a booking (ADMIN or OWNER)
export const cancelBooking = async (req, res) => {
  try {
    // First get the booking to check ownership
    const booking = await bookingModel.getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    const isAdmin = req.user.role === true || req.user.role === 'true' || req.user.role === 1;
    
    // Users can only cancel their own bookings, admins can cancel any
    if (!isAdmin && booking.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }
    
    const cancelledBooking = await bookingModel.cancelBooking(req.params.id);
    
    res.json({ 
      message: "Booking cancelled successfully", 
      booking: cancelledBooking 
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    
    if (error.message === 'Booking not found' || error.message === 'Booking already cancelled') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

