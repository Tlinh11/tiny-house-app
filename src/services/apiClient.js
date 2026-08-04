// API Client for connecting Tiny Houses Frontend to Express & Supabase Backend API
const API_BASE_URL = '/api';

export const ApiClient = {
  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[ApiClient] GET ${endpoint} failed, fallback to local:`, err.message);
      return null;
    }
  },

  async post(endpoint, body) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[ApiClient] POST ${endpoint} failed:`, err.message);
      return null;
    }
  },

  async put(endpoint, body) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[ApiClient] PUT ${endpoint} failed:`, err.message);
      return null;
    }
  },

  async delete(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[ApiClient] DELETE ${endpoint} failed:`, err.message);
      return null;
    }
  }
};
