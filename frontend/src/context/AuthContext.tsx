import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ROUTES } from '../constants/routes';
import { toast } from 'sonner';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'staff' | 'director';
  department_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const logout = () => {
    clearAuthData();
    toast.success('You have been logged out.');
    navigate(ROUTES.LOGIN);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login/', {
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      setUser({
        ...response.data.user,
        department_id:
          response.data.user.department_id ?? response.data.user.department?.id,
      });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed: Invalid credentials');
      return false;
    }
  };

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await api.get('/auth/me/');
        setUser({
          ...response.data,
          department_id: response.data.department_id ?? response.data.department?.id,
        });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};