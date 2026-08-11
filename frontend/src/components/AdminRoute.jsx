import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminRoute = ({ children }) => {
  const { currentUser, signed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!signed) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/sales/new" replace />;
  }

  return children;
};
