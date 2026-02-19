import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // Check if vendor needs KYC verification
  if (user.role === 'VENDOR' && user.kycStatus !== 'APPROVED') {
    return <Navigate to="/kyc-form" replace />;
  }

  return children;
};


