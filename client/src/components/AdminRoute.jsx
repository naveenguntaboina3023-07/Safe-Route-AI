import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen text="Authenticating…" />;
  if (!user)   return <Navigate to="/admin/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
