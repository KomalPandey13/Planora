import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-violet)'
        }}
      >
        <p style={{ fontWeight: 600 }}>Loading account session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save target path for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

