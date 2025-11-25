import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = ['user', 'analyst', 'admin'] }) {
  const { user, roles } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to login with return path
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles required, allow access to any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // If user's role is not in the allowed roles list
  if (!allowedRoles.includes(user.role)) {
    // Admins get redirected to dashboard
    if (user.role === roles.ADMIN) {
      return <Navigate to="/dashboard" replace />;
    }
    // Analysts get redirected to their analysis dashboard
    if (user.role === roles.ANALYST) {
      return <Navigate to="/analysis" replace />;
    }
    // Regular users get redirected to their profile
    return <Navigate to="/profile" replace />;
  }

  return children;
}