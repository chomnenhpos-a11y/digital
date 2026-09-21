import { useContext } from 'react';
import { AdminAuthContext } from '../context/AdminAuthContext';

export const useAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AdminAuthProvider');
  }
  return context;
};
