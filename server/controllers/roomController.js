import { roomService } from '../services/roomService.js';

export const roomController = {
  async getRooms(req, res) {
    try {
      const data = await roomService.getAllRooms();
      res.json(data);
    } catch (err) {
      console.error('[roomController.getRooms] error:', err.message);
      res.status(500).json({ error: err.message });
    }
  },

  async getRoomsByBuilding(req, res) {
    try {
      const data = await roomService.getRoomsByBuilding(req.params.buildingId);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveRoom(req, res) {
    try {
      await roomService.saveRoom(req.body);
      const updated = await roomService.getAllRooms();
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deleteRoom(req, res) {
    try {
      await roomService.deleteRoom(req.params.id);
      const updated = await roomService.getAllRooms();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
