// Rutas de usuario
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../../middlewares/authMiddleware';

const userRoutes = [
  <Route 
    path="/perfil" 
    element={
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>
      </ProtectedRoute>
    } 
  />,
  <Route 
    path="/mis-mods" 
    element={
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Mis Mods</h1>
        </div>
      </ProtectedRoute>
    } 
  />,
  <Route 
    path="/guardados" 
    element={
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Mods Guardados</h1>
        </div>
      </ProtectedRoute>
    } 
  />
];

export default userRoutes;