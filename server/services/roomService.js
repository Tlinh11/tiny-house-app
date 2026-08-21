import { RoomModel } from '../models/RoomModel.js';
import { BuildingModel } from '../models/BuildingModel.js';

export const roomService = {
  async getAllRooms() {
    return await RoomModel.findAll();
  },

  async getRoomsByBuilding(buildingIdOrCode) {
    const all = await RoomModel.findAll();
    if (!buildingIdOrCode) return all;
    return all.filter(r => 
      r.buildingId === buildingIdOrCode || 
      r.buildingCode === buildingIdOrCode ||
      r.buildingName?.includes(buildingIdOrCode)
    );
  },

  async saveRoom(roomData) {
    if (!roomData.type && !roomData.name) {
      throw new Error('Tên loại phòng không được để trống.');
    }
    const saved = await RoomModel.upsert(roomData);

    // Update parent building vacant rooms count in database
    if (roomData.buildingId || roomData.buildingCode) {
      try {
        const allRooms = await RoomModel.findAll();
        const bldRooms = allRooms.filter(r => 
          r.buildingId === roomData.buildingId || 
          r.buildingCode === roomData.buildingCode
        );
        const totalVacant = bldRooms.reduce((sum, r) => sum + (r.specificRooms?.length || 0), 0);
        
        const bldId = roomData.buildingId || roomData.buildingCode;
        await BuildingModel.upsert({
          id: bldId,
          code: roomData.buildingCode,
          vacantRoomsCount: totalVacant
        });
      } catch (err) {
        console.warn('[roomService.saveRoom] Building recount update skipped:', err.message);
      }
    }

    return saved;
  },

  async deleteRoom(id) {
    const room = await RoomModel.findById(id).catch(() => null);
    const result = await RoomModel.delete(id);

    if (room && (room.building_id || room.building_code)) {
      try {
        const allRooms = await RoomModel.findAll();
        const bldRooms = allRooms.filter(r => 
          r.buildingId === room.building_id || 
          r.buildingCode === room.building_code
        );
        const totalVacant = bldRooms.reduce((sum, r) => sum + (r.specificRooms?.length || 0), 0);
        const bldId = room.building_id || room.building_code;
        await BuildingModel.upsert({
          id: bldId,
          code: room.building_code,
          vacantRoomsCount: totalVacant
        });
      } catch (err) {
        console.warn('[roomService.deleteRoom] Building recount update skipped:', err.message);
      }
    }

    return result;
  }
};
