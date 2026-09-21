import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * RoleRoute — only allows roles listed in `allowedRoles` (case-insensitive).
 * If the authenticated user's role is NOT in the list, redirect to `fallback`.
 *
 * Usage:
 *   <RoleRoute allowedRoles={['admin', 'superadmin']} fallback="/admin" />
 */
export default function RoleRoute({
  allowedRoles = ['admin', 'superadmin'],
  fallback = '/admin',
}) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) return null;

  const role = (user?.role ?? '').toString().toLowerCase().trim();

  // DEBUG: remove this line once role check is confirmed working
  console.warn('[RoleRoute] user role =', JSON.stringify(user?.role), '| normalized =', role);

  const allowed = allowedRoles.map(r => r.toLowerCase().trim());

  if (!allowed.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
