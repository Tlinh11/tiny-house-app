import { BuildingModel } from '../models/BuildingModel.js';
import { RoomModel } from '../models/RoomModel.js';

export const buildingService = {
  async getAllBuildings() {
    const [buildings, rooms] = await Promise.all([
      BuildingModel.findAll(),
      RoomModel.findAll().catch(() => [])
    ]);

    // Recalculate vacantRoomsCount from real rooms in database
    return buildings.map(b => {
      const bldRooms = rooms.filter(r => r.buildingId === b.id || r.buildingCode === b.code);
      const totalVacant = bldRooms.reduce((sum, r) => sum + (r.specificRooms?.length || 0), 0);
      return {
        ...b,
        vacantRoomsCount: bldRooms.length > 0 ? totalVacant : (b.vacantRoomsCount || 0)
      };
    });
  },

  async getBuildingById(id) {
    return await BuildingModel.findById(id);
  },

  async saveBuilding(buildingData) {
    if (!buildingData.name && !buildingData.code) {
      throw new Error('Tên tòa nhà hoặc Mã tòa nhà không được để trống.');
    }
    return await BuildingModel.upsert(buildingData);
  },

  async removeBuilding(id) {
    return await BuildingModel.delete(id);
  }
};
