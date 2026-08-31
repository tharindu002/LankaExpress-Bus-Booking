import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const getBackendUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    'https://lankaexpress-bus-booking-backend.onrender.com';
  let cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api')) {
    cleanUrl = cleanUrl.slice(0, -4);
  }
  return cleanUrl;
};

const BACKEND_URL = getBackendUrl();
axios.defaults.baseURL = BACKEND_URL;

// Synchronously set initial authorization header if token exists in localStorage
const savedTokenOnInit = localStorage.getItem('lanka_admin_token');
if (savedTokenOnInit) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedTokenOnInit}`;
}

// Axios Request Interceptor to guarantee Authorization header on every request
axios.interceptors.request.use(
  (config) => {
    const activeToken = localStorage.getItem('lanka_admin_token');
    if (activeToken) {
      config.headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios Response Interceptor to gracefully handle 401 Unauthorized
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if 401 is NOT coming from login request
    const isLoginEndpoint = error.config?.url?.includes('/api/auth/login');
    if (error.response && error.response.status === 401 && !isLoginEndpoint) {
      console.warn('⚠️ 401 Unauthorized received - clearing session and redirecting to login');
      localStorage.removeItem('lanka_admin_token');
      localStorage.removeItem('lanka_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('lanka_admin_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('lanka_admin_token') || null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state token updates with Axios defaults and localStorage
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('lanka_admin_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('lanka_admin_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('lanka_admin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lanka_admin_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = res.data;

      if (userData.role !== 'admin' && userData.role !== 'superadmin' && userData.role !== 'conductor') {
        throw new Error('Access denied: Unauthorized role');
      }

      setUser(userData);
      setToken(userData.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      localStorage.setItem('lanka_admin_token', userData.token);
      localStorage.setItem('lanka_admin_user', JSON.stringify(userData));

      setLoading(false);
      return { success: true, role: userData.role };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('lanka_admin_user');
    localStorage.removeItem('lanka_admin_token');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/api/admin/profile', profileData);
      const updated = { ...user, ...res.data.data };
      setUser(updated);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Profile update failed' };
    }
  };

  const changePassword = async (passwords) => {
    try {
      const res = await axios.put('/api/admin/change-password', passwords);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Password update failed' };
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

  const hasPermission = (permissionKey) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    if (user.role === 'admin') {
      const perms = user.adminPermissions;
      if (!perms || perms.length === 0) return true; // Default all if empty
      return perms.includes(permissionKey);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        updateProfile,
        changePassword,
        isSuperAdmin,
        hasPermission,
        isAuthenticated: !!token && (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'conductor'),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

