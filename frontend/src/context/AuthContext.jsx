import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshWallet = async () => {
    try {
      const res = await api.getWallet();
      if (res && res.balance !== undefined) {
        setWalletBalance(res.balance);
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, walletBalance: res.balance };
          localStorage.setItem('bus_user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (e) {
      console.warn('Unable to fetch live wallet balance');
    }
  };

  useEffect(() => {
    // Check if user is stored in localStorage to persist login session
    const storedUser = localStorage.getItem('bus_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        refreshWallet();
      } catch (e) {
        localStorage.removeItem('bus_user');
      }
    }
    setLoading(false);
  }, []);

  // Login strictly against backend / MongoDB
  const login = async (email, password) => {
    try {
      const loggedUser = await api.login(email, password);
      setUser(loggedUser);
      localStorage.setItem('bus_user', JSON.stringify(loggedUser));
      await refreshWallet();
      return loggedUser;
    } catch (err) {
      throw err;
    }
  };

  // Register strictly saving user to MongoDB
  const register = async (userData) => {
    try {
      const newUser = await api.register(userData);
      setUser(newUser);
      localStorage.setItem('bus_user', JSON.stringify(newUser));
      await refreshWallet();
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setWalletBalance(0);
    localStorage.removeItem('bus_user');
  };

  const updateProfile = async (updatedData) => {
    if (!user) return;
    try {
      const updatedUser = await api.updateProfileApi(user.id || user.userId, updatedData);
      const mergedUser = { ...user, ...updatedUser };
      setUser(mergedUser);
      localStorage.setItem('bus_user', JSON.stringify(mergedUser));
      return mergedUser;
    } catch (err) {
      const mergedUser = { ...user, ...updatedData };
      setUser(mergedUser);
      localStorage.setItem('bus_user', JSON.stringify(mergedUser));
      return mergedUser;
    }
  };

  return (
    <AuthContext.Provider value={{ user, walletBalance, refreshWallet, login, register, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
