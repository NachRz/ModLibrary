// Rutas de usuario
import React from 'react';
import { Route } from 'react-router-dom';

const userRoutes = [
  <Route path="/perfil" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mi Perfil</h1></div>} />,
  <Route path="/mis-mods" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mis Mods</h1></div>} />,
  <Route path="/guardados" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods Guardados</h1></div>} />
];

export default userRoutes;