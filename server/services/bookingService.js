import { BookingModel } from '../models/BookingModel.js';
import { BuildingModel } from '../models/BuildingModel.js';
import { emailService } from './emailService.js';

export const bookingService = {
  async getAllBookings() {
    return await BookingModel.findAll();
  },

  async createBooking(data) {
    if (!data.phone) {
      throw new Error('Số điện thoại không được để trống.');
    }

    const created = await BookingModel.create(data);

    // Fetch building details to include in email notification
    try {
      const buildings = await BuildingModel.findAll().catch(() => []);
      const building = buildings.find(b => 
        b.code === (data.buildingCode || data.building_code) || 
        b.id === (data.buildingId || data.building_id)
      );

      // Await email sending so serverless containers (Vercel) do not freeze before sending finishes
      await emailService.sendBookingNotificationToAdmin({
        booking: {
          id: created.id || data.id,
          customerName: data.customerName || data.name || 'Khách hàng',
          phone: data.phone,
          email: data.email || 'Chưa cung cấp',
          buildingCode: data.buildingCode || data.building_code,
          roomNumber: data.roomNumber || data.room_number,
          appointmentDate: data.appointmentDate || data.appointment_date,
          appointmentTime: data.appointmentTime || data.appointment_time
        },
        building
      }).catch(err => console.warn('[bookingService] Email dispatch failed:', err.message));
    } catch (e) {
      console.warn('[bookingService] Error preparing email notification:', e.message);
    }

    return created;
  },

  async updateBookingStatus(id, status) {
    return await BookingModel.updateStatus(id, status);
  },

  async deleteBooking(id) {
    return await BookingModel.delete(id);
  }
};
