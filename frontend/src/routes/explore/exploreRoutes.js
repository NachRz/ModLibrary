// Rutas de exploración
import React from 'react';
import { Route } from 'react-router-dom';


import ExplorarMods from '../../components/explorarMods/ExplorarMods';

const exploreRoutes = [
  <Route path="/explorar" element={<ExplorarMods />} />,
  <Route path="/explorar/recientes" element={<ExplorarMods />} />,
  <Route path="/explorar/populares" element={<ExplorarMods />} />,
  <Route path="/tendencias" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Tendencias</h1></div>} />,
  <Route path="/categorias" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Categorías</h1></div>} />,
];

export default exploreRoutes;