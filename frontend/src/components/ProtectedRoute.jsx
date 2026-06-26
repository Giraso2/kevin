import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('portalToken');
  const role = localStorage.getItem('userRole');

  // No token - redirect to appropriate login
  if (!token) {
    // If trying to access parent dashboard, redirect to parent-login
    if (allowedRoles && allowedRoles.includes('parent')) {
      return <Navigate to="/portal/parent/parent-login" replace />;
    }
    // Otherwise redirect to standard login
    return <Navigate to="/portal/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user is parent trying to access admin routes
    if (role === 'parent') {
      return <Navigate to="/portal/parent/parent-dashboard" replace />;
    }
    return <Navigate to="/portal/parent/parent-login" replace />;
  }

  return children;
};

export default ProtectedRoute;