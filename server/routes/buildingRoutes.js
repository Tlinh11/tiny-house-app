import { Router } from 'express';
import { buildingController } from '../controllers/buildingController.js';

const router = Router();

router.get('/', buildingController.getBuildings);
router.get('/:id', buildingController.getBuilding);
router.post('/', buildingController.saveBuilding);
router.delete('/:id', buildingController.deleteBuilding);

export default router;
