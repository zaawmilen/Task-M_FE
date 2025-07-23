// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from  '../utils/api';
import axios from 'axios';

// Define the shape of a user
interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
   role: 'admin' | 'user';
}

// Define what the AuthContext will provide
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean; // <-- add this
  loading?: boolean; 
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs when the component mounts
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // ✅ Set the token for all future axios requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch the user data
          const res = await api.get(`https://task-m-be.onrender.com/api/auth/me`);
          
          // Assuming res.data is the user object itself
          setUser(res.data.user); // res.data is now the user object directly
        } catch (error) {
          console.error('Failed to load user:', error);
          // Clean up if token is invalid
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Logout function to clear auth state
  const logout = () => {
    localStorage.removeItem('token');
    // ✅ Remove the Authorization header when logging out
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
     value={{ user, 
     setUser, 
     logout, 
     isLoading ,
     isAuthenticated: !!user, // true if user is not null
     loading: isLoading, // Pass the loading state}}>
     }}
    >
     {children}
    </AuthContext.Provider>
  );
};

// Hook for easy access to the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
