import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { VisitorProvider } from './context/VisitorContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Import all components directly
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import PreRegister from './pages/PreRegister';
import Visitors from './pages/Visitors';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import CheckIn from './pages/CheckIn';
import Departments from './pages/Departments';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <VisitorProvider>
          {/* Simple loading spinner for initial load */}
          <React.Suspense fallback={<LoadingSpinner fullPage />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="pre-register" element={<PreRegister />} />
                <Route path="visitors" element={<Visitors />} />
                <Route path="check-in" element={
                  <ProtectedRoute allowedRoles={['admin', 'staff']}>
                    <CheckIn />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                } />
                <Route path="analytics" element={
                  <ProtectedRoute allowedRoles={['admin', 'director']}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="departments" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Departments />
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </React.Suspense>
        </VisitorProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;