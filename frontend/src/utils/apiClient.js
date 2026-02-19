import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  async get(path, token, config = {}) {
    const res = await axios.get(`${API_BASE_URL}${path}`, {
      ...config,
      headers: {
        ...(config.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.data;
  },

  async post(path, body, token, config = {}) {
    const res = await axios.post(`${API_BASE_URL}${path}`, body, {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.data;
  }
};

