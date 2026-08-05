// API Client for connecting Tiny Houses Frontend to Express & Supabase Backend API
const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('tinyhouse_jwt');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const ApiClient = {
  getToken() {
    return localStorage.getItem('tinyhouse_jwt');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('tinyhouse_jwt', token);
    } else {
      localStorage.removeItem('tinyhouse_jwt');
    }
  },

  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeaders()
      });
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
      const res = await fetch(`${API_BASE_URL}${endpoint}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`API Error ${res.status}`);
      const data = await res.json();
      return data.data !== undefined ? data.data : data;
    } catch (err) {
      console.warn(`[ApiClient] DELETE ${endpoint} failed:`, err.message);
      return null;
    }
  }
};
