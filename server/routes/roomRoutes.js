import { Router } from 'express';
import { roomController } from '../controllers/roomController.js';

const router = Router();

router.get('/', roomController.getRooms);
router.get('/building/:buildingId', roomController.getRoomsByBuilding);
router.post('/', roomController.saveRoom);
router.delete('/:id', roomController.deleteRoom);

export default router;
