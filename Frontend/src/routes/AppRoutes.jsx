import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layouts/MainLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import AdminLayout from '../components/layouts/AdminLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Loader
import Loader from '../components/common/Loader';

// Lazy Pages
const Home = lazy(() => import('../pages/Home'));
const Shop = lazy(() => import('../pages/Shop'));
const Categories = lazy(() => import('../pages/Categories'));
const BookDetails = lazy(() => import('../pages/BookDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const Orders = lazy(() => import('../pages/Orders'));
const NotFound = lazy(() => import('../pages/NotFound'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));

// Admin Pages
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const Billing = lazy(() => import('../pages/admin/Billing')); // ✅ NAYA
const Sales = lazy(() => import('../pages/admin/Sales')); // ✅ NAYA
const ManageBooks = lazy(() => import('../pages/admin/ManageBooks'));
const ManageBanners = lazy(() => import('../pages/admin/ManageBanners'));
const ManageOrders = lazy(() => import('../pages/admin/ManageOrders'));
const ManageUsers = lazy(() => import('../pages/admin/ManageUsers'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* ===== ADMIN ROUTES ===== */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="billing" element={<Billing />} /> {/* ✅ NAYA */}
            <Route path="sales" element={<Sales />} /> {/* ✅ NAYA */}
            <Route path="books" element={<ManageBooks />} />
            <Route path="banners" element={<ManageBanners />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Route>

        {/* ===== AUTH ROUTES ===== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ===== PROTECTED ROUTES ===== */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
          </Route>
        </Route>

        {/* ===== PUBLIC ROUTES ===== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* ===== 404 ===== */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;