import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'
import ErrorBoundary from '../components/ErrorBoundary'
import NotFoundPage from '../components/NotFoundPage'
import Home from "../client/features/home/pages/Home"
import ProductDetail from "../client/features/products/pages/ProductDetail"

import Receipt from "../client/features/receipt/pages/Receipt"
import GlobalPage from "../global/feature/overview/GlobalPage"
import GlobalLogin from "../global/feature/auth/GlobalLogin"
import GlobalRegister from "../global/feature/auth/GlobalRegister"
import GlobalForgotPassword from "../global/feature/auth/GlobalForgotPassword"
import GlobalResetPassword from "../global/feature/auth/GlobalResetPassword"

// Admin Layout & Pages
import AdminLayout from '../admin/components/layout/AdminLayout'
import AdminCategories from '../admin/features/Categories/pages/AdminCategories'
import AdminSaleForm from '../admin/features/SalesForm/pages/AdminSaleForm'
import AdminOrders from '../admin/features/Order/pages/AdminOrders'
import AdminProducts from '../admin/features/Products/pages/AdminProducts'
import AdminSlides from '../admin/features/Slides/pages/AdminSlides'
import AdminDashboard from '../admin/features/Dashboard/pages/AdminDashboard'
import AdminUsers from '../admin/features/Users/pages/AdminUsers'
import AdminSettings from '../admin/features/Setting/pages/AdminSettings'
import AdminReceiptPage from '../admin/features/Order/pages/AdminReceiptPage'
import AdminStickerPage from '../admin/features/Order/pages/AdminStickerPage'
import AdminQRCode from '../admin/features/QRCode/pages/AdminQRCode'
import AdminDeliveryProviders from '../admin/features/Delivery_Providers/pages/AdminDeliveryProviders'

// Wrap a page in ErrorBoundary — resets on each unique key (page name)
function Safe({ name, children }) {
  return <ErrorBoundary key={name}>{children}</ErrorBoundary>
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Global Entry Point */}
      <Route path="/" element={<GlobalPage />} />
      <Route path="/login" element={<GlobalLogin />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<GlobalRegister />} />
      <Route path="/forgot-password" element={<GlobalForgotPassword />} />
      <Route path="/reset-password" element={<GlobalResetPassword />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />

      {/* Existing Digital E-Commerce (Moved to /:shop_code) */}
      <Route path="/:shop_code" element={<Home />} />
      <Route path="/:shop_code/products/:id" element={<ProductDetail />} />
      
      <Route path="/print-receipt/:orderId" element={<Receipt />} />
      <Route path="/admin/print-receipt/:No" element={<AdminReceiptPage />} />
      <Route path="/admin/print-sticker/:id" element={<AdminStickerPage />} />
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Pages accessible by ALL roles (including 'user') */}
          <Route index element={<Safe name="dashboard"><AdminDashboard /></Safe>} />
          <Route path="orders" element={<Safe name="orders"><AdminOrders /></Safe>} />
          <Route path="sale-form" element={<Safe name="sale-form"><AdminSaleForm /></Safe>} />
          <Route path="qr-code" element={<Safe name="qr-code"><AdminQRCode /></Safe>} />

          {/* admin / superadmin only pages */}
          <Route element={<RoleRoute allowedRoles={['admin', 'superadmin']} fallback="/admin" />}>
            <Route path="products" element={<Safe name="products"><AdminProducts /></Safe>} />
            <Route path="users" element={<Safe name="users"><AdminUsers /></Safe>} />
            <Route path="categories" element={<Safe name="categories"><AdminCategories /></Safe>} />
            <Route path="promotions" element={<Safe name="promotions"><AdminSlides /></Safe>} />
            <Route path="delivery-providers" element={<Safe name="delivery-providers"><AdminDeliveryProviders /></Safe>} />
            <Route path="settings" element={<Safe name="settings"><AdminSettings /></Safe>} />
          </Route>
        </Route>
        {/* Admin 404 — full screen (no sidebar), still auth-protected */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Global 404 — full screen */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}