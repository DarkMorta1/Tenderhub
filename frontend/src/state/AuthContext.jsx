import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/apiClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('th_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me', token);
        setUser(res.user);
      } catch {
        setToken(null);
        localStorage.removeItem('th_token');
      }
    };
    fetchMe();
  }, [token]);

  const login = (data) => {
    localStorage.setItem('th_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('th_token');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, loading, setLoading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

