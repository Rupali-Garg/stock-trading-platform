import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService.getProfile()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { accessToken, user: userData } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (_) {}
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    return res.data;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register,
               isAuthenticated: !!user,
               isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};