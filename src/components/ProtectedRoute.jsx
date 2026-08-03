import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './ui/Spinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  // Full-page centered loading state using Spinner component
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" color="primary" label="Verifying authorization..." />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Verifying credentials...
        </p>
      </div>
    );
  }

  // Not logged in -> redirect to /login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to unauthorized user's default dashboard if logged in but wrong role
      if (userRole === 'student') return <Navigate to="/student-dashboard" replace />;
      if (userRole === 'employer') return <Navigate to="/employer-dashboard" replace />;
      if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
