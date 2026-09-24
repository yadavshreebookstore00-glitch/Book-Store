import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) return <Loader />;

  // Agar user nahi hai
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Admin check - dono condition support karo
  const isAdminUser = user.isAdmin === true || user.role === 'admin';

  if (!isAdminUser) {
    return <Navigate to="/" replace />;
  }

  // Sab sahi hai - render karo
  return <Outlet />;
};

export default AdminRoute;