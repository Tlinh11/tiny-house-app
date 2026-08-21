import { userService } from '../services/userService.js';

export const userController = {
  async getUsers(req, res) {
    try {
      const data = await userService.getAllUsers();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveUser(req, res) {
    try {
      await userService.saveUser(req.body);
      const updated = await userService.getAllUsers();
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      const updated = await userService.getAllUsers();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getRoles(req, res) {
    try {
      const data = await userService.getAllRoles();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async saveRole(req, res) {
    try {
      await userService.saveRole(req.body);
      const updated = await userService.getAllRoles();
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  async deleteRole(req, res) {
    try {
      await userService.deleteRole(req.params.id);
      const updated = await userService.getAllRoles();
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Auth Endpoints
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async register(req, res) {
    try {
      const result = await userService.register(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async googleLogin(req, res) {
    try {
      const result = await userService.googleAuth(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};
