import { bookingService } from '../services/bookingService.js';

export const bookingController = {
  async getBookings(req, res) {
    try {
      const data = await bookingService.getAllBookings();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async createBooking(req, res) {
    try {
      const created = await bookingService.createBooking(req.body);
      res.json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async updateBookingStatus(req, res) {
    try {
      const { status } = req.body;
      const updated = await bookingService.updateBookingStatus(req.params.id, status);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteBooking(req, res) {
    try {
      await bookingService.deleteBooking(req.params.id);
      const data = await bookingService.getAllBookings();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
