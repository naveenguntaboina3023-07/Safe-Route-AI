import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen text="Authenticating…" />;
  if (!user)   return <Navigate to="/login" replace />;

  // Admins should use admin routes
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return <Outlet />;
}
