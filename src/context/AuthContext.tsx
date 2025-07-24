// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import axios from 'axios';
import { User, AuthResponse } from '../types/type';

// Define what the AuthContext will provide
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  loading?: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user when component mounts
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get<{ user: User }>('/auth/me');
          setUser(res.data.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isLoading,
        isAuthenticated: !!user,
        loading: isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
