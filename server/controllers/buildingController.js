import { buildingService } from '../services/buildingService.js';

export const buildingController = {
  async getBuildings(req, res) {
    try {
      const data = await buildingService.getAllBuildings();
      res.json(data);
    } catch (err) {
      console.error('[buildingController.getBuildings] error:', err.message);
      res.status(500).json({ error: err.message });
    }
  },

  async getBuilding(req, res) {
    try {
      const data = await buildingService.getBuildingById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Building not found' });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveBuilding(req, res) {
    try {
      await buildingService.saveBuilding(req.body);
      const updated = await buildingService.getAllBuildings();
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deleteBuilding(req, res) {
    try {
      await buildingService.removeBuilding(req.params.id);
      const updated = await buildingService.getAllBuildings();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
