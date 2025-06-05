// Rutas del panel de control
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../../components/dashboard/Dashboard';
import ProtectedRoute from '../../middlewares/authMiddleware';

const dashboardRoutes = (
  [
    <Route 
      key="dashboard-main" 
      path="/dashboard" 
      element={
        <ProtectedRoute>
          <Dashboard defaultTab={0} />
        </ProtectedRoute>
      } 
    />,
    <Route 
      key="dashboard-mis-mods" 
      path="/dashboard/mis-mods" 
      element={
        <ProtectedRoute>
          <Dashboard defaultTab={1} />
        </ProtectedRoute>
      } 
    />,
    <Route 
      key="dashboard-juegos-favoritos" 
      path="/dashboard/juegos-favoritos" 
      element={
        <ProtectedRoute>
          <Dashboard defaultTab={2} />
        </ProtectedRoute>
      } 
    />,
    <Route 
      key="dashboard-guardados" 
      path="/dashboard/guardados" 
      element={
        <ProtectedRoute>
          <Dashboard defaultTab={3} />
        </ProtectedRoute>
      } 
    />,
  ]
);

export default dashboardRoutes;