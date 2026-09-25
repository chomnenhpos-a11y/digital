import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({
  allowedRoles = ['admin', 'superadmin'],
  fallback = '/admin',
}) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) return null;

  const role = (user?.role ?? '').toString().toLowerCase().trim();

  const allowed = allowedRoles.map(r => r.toLowerCase().trim());

  if (!allowed.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
