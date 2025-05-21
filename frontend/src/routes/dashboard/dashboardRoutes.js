// Rutas del panel de control
import React from 'react';
import { Route } from 'react-router-dom';
import Dashboard from '../../components/dashboard/Dashboard';

const dashboardRoutes = (
  [
    <Route key="dashboard-main" path="/dashboard" element={<Dashboard defaultTab={0} />} />,
    <Route key="dashboard-mis-mods" path="/dashboard/mis-mods" element={<Dashboard defaultTab={1} />} />,
    <Route key="dashboard-juegos-favoritos" path="/dashboard/juegos-favoritos" element={<Dashboard defaultTab={2} />} />,
    <Route key="dashboard-guardados" path="/dashboard/guardados" element={<Dashboard defaultTab={3} />} />,
  ]
);

export default dashboardRoutes;