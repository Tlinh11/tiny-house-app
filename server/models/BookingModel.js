import { supabase } from '../config/supabaseClient.js';

export const BookingModel = {
  async findAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[BookingModel.findAll] fallback if table missing:', error.message);
      return [];
    }

    return (data || []).map(b => ({
      id: b.id,
      customerName: b.customer_name || b.customerName,
      phone: b.phone,
      email: b.email,
      buildingCode: b.building_code || b.buildingCode,
      roomNumber: b.room_number || b.roomNumber,
      appointmentDate: b.appointment_date || b.appointmentDate,
      appointmentTime: b.appointment_time || b.appointmentTime,
      status: b.status || 'Chờ xác nhận',
      createdAt: b.created_at || b.createdAt
    }));
  },

  async create(booking) {
    const payload = {
      id: booking.id || `BK-${Date.now().toString().slice(-4)}`,
      customer_name: booking.customerName || booking.name,
      phone: booking.phone,
      email: booking.email || 'Chưa cung cấp',
      building_code: booking.buildingCode,
      room_number: booking.roomNumber,
      appointment_date: booking.appointmentDate || new Date().toISOString().split('T')[0],
      appointment_time: booking.appointmentTime || '10:00 AM',
      status: booking.status || 'Chờ xác nhận'
    };

    const { data, error } = await supabase
      .from('bookings')
      .upsert(payload)
      .select();

    if (error) {
      console.warn('[BookingModel.create] fallback to memory payload:', error.message);
      return payload;
    }
    return data?.[0] || payload;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw new Error(`BookingModel.updateStatus error: ${error.message}`);
    return data;
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`BookingModel.delete error: ${error.message}`);
    return data;
  }
};
