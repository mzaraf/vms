import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

export interface Department {
  visitor_count: number;
  id: string;
  name: string;
  description?: string;
}

export type VisitorStatus = 'checked-in' | 'pre-registered' | 'checked-out';

export interface Visitor {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: string;
  department: string;
  host: string;
  status: VisitorStatus;
  visit_date?: string;
  check_in_time?: string;
  check_out_time?: string;
  created_at: string;
  avatar?: string;
}

interface VisitorContextType {
  visitors: Visitor[];
  departments: Department[];
  loading: boolean;
  error: string | null;
  addVisitor: (visitor: Omit<Visitor, 'id' | 'status' | 'created_at' | 'avatar'>) => Promise<void>;
  checkInVisitor: (id: string) => Promise<void>;
  checkOutVisitor: (id: string) => Promise<void>;
  refreshVisitors: () => Promise<void>;
  refreshDepartments: () => Promise<void>;
  getFilteredVisitors: () => Visitor[];
  getVisitorStats: (period: 'week' | 'month' | 'year') => Promise<{ date: string; count: number }[]>;
  getDepartmentStats: () => Promise<{ department: string; count: number }[]>;
}

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export const VisitorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/visitors/');
      setVisitors(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch visitors');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments/');
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch departments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        try {
          setLoading(true);
          await Promise.all([refreshVisitors(), refreshDepartments()]);
        } catch (err) {
          setError('Failed to load initial data');
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [user, refreshVisitors, refreshDepartments]);

  const addVisitor = async (visitorData: Omit<Visitor, 'id' | 'status' | 'created_at' | 'avatar'>) => {
    try {
      setLoading(true);
      const response = await api.post('/visitors/', {
        ...visitorData,
        visit_date: visitorData.visit_date || new Date().toISOString().split('T')[0],
      });
      setVisitors(prev => [...prev, response.data]);
      toast.success('Visitor added successfully');
    } catch (err) {
      setError('Failed to add visitor');
      toast.error('Failed to add visitor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkInVisitor = async (id: string) => {
    try {
      setLoading(true);
      await api.post(`/visitors/${id}/check_in/`);
      await refreshVisitors();
      toast.success('Visitor checked in');
    } catch (err) {
      setError('Failed to check in visitor');
      toast.error('Failed to check in visitor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkOutVisitor = async (id: string) => {
    try {
      setLoading(true);
      await api.post(`/visitors/${id}/check_out/`);
      await refreshVisitors();
      toast.success('Visitor checked out');
    } catch (err) {
      setError('Failed to check out visitor');
      toast.error('Failed to check out visitor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVisitors = useCallback(() => {
    if (!user) return [];
    if (user.role === 'director' && user.department_id) {
      return visitors.filter(visitor => visitor.department === user.department_id);
    }
    return visitors;
  }, [user, visitors]);

  const getVisitorStats = async (period: 'week' | 'month' | 'year') => {
    try {
      const response = await api.get(`/visitors/stats/?period=${period}`);
      return Array.isArray(response.data)
        ? response.data.map(item => ({
            date: item.date || '',
            count: typeof item.count === 'number' ? item.count : 0,
          }))
        : [];
    } catch (error) {
      console.error('Failed to fetch visitor stats:', error);
      return [];
    }
  };

  const getDepartmentStats = async () => {
    try {
      const response = await api.get('/visitors/department_stats/');
      return Array.isArray(response.data)
        ? response.data.map(item => ({
            department: item.department || 'Unknown',
            count: typeof item.count === 'number' ? item.count : 0,
          }))
        : [];
    } catch (error) {
      console.error('Failed to fetch department stats:', error);
      return [];
    }
  };

  return (
    <VisitorContext.Provider
      value={{
        visitors,
        departments,
        loading,
        error,
        addVisitor,
        checkInVisitor,
        checkOutVisitor,
        refreshVisitors,
        refreshDepartments,
        getFilteredVisitors,
        getVisitorStats,
        getDepartmentStats,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitors = () => {
  const context = useContext(VisitorContext);
  if (context === undefined) {
    throw new Error('useVisitors must be used within a VisitorProvider');
  }
  return context;
};