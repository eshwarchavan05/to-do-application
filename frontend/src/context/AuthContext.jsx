import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { initSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tm_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tm_token');
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => { setUser(data.user); initSocket(token); })
        .catch(() => { localStorage.removeItem('tm_token'); localStorage.removeItem('tm_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('tm_token', data.token);
    localStorage.setItem('tm_user', JSON.stringify(data.user));
    setUser(data.user);
    initSocket(data.token);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('tm_token', data.token);
    localStorage.setItem('tm_user', JSON.stringify(data.user));
    setUser(data.user);
    initSocket(data.token);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    disconnectSocket();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('tm_user', JSON.stringify(updated));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
