// Rutas del panel de administración
import React from 'react';
import { Route } from 'react-router-dom';
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import ProtectedRoute from '../../middlewares/authMiddleware';

const adminRoutes = [
  <Route
    key="admin-base"
    path="/admin"
    element={
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard defaultTab={0} />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-usuarios"
    path="/admin/usuarios"
    element={
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard defaultTab={0} />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-mods"
    path="/admin/mods"
    element={
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard defaultTab={1} />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-comentarios"
    path="/admin/comentarios"
    element={
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard defaultTab={2} />
      </ProtectedRoute>
    }
  />,
];

export default adminRoutes; 