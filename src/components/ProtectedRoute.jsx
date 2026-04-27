import React from 'react';
import { Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('portalToken');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    Swal.fire({
      title: 'Access Denied',
      text: 'Please login to access this page.',
      icon: 'warning',
      confirmButtonColor: '#1e3c72'
    });
    return <Navigate to="/portal/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    Swal.fire({
      title: 'Unauthorized Access',
      text: `You don't have permission to access this page.`,
      icon: 'error',
      confirmButtonColor: '#1e3c72'
    });
    return <Navigate to="/portal/login" replace />;
  }

  return children;
};

export default ProtectedRoute;