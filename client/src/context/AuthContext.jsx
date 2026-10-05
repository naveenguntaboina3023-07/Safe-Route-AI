import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('saferoute_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user profile when token exists
  const fetchProfile = useCallback(async (tkn) => {
    try {
      const res = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      setUser(res.data.data.user);
    } catch {
      // Token invalid / expired
      localStorage.removeItem('saferoute_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = useCallback((userData, tkn) => {
    localStorage.setItem('saferoute_token', tkn);
    setToken(tkn);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('saferoute_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
