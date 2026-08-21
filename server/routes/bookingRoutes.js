import { Router } from 'express';
import { bookingController } from '../controllers/bookingController.js';

const router = Router();

router.get('/', bookingController.getBookings);
router.post('/', bookingController.createBooking);
router.patch('/:id/status', bookingController.updateBookingStatus);
router.delete('/:id', bookingController.deleteBooking);

export default router;
