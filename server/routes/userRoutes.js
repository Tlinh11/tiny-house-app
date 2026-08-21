import { Router } from 'express';
import { userController } from '../controllers/userController.js';

const router = Router();

// Users
router.get('/users', userController.getUsers);
router.post('/users', userController.saveUser);
router.delete('/users/:id', userController.deleteUser);

// Roles
router.get('/roles', userController.getRoles);
router.post('/roles', userController.saveRole);
router.delete('/roles/:id', userController.deleteRole);

// Authentication Endpoints
router.post('/auth/login', userController.login);
router.post('/auth/register', userController.register);
router.post('/auth/google', userController.googleLogin);

export default router;
