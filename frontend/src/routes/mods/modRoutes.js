// Rutas de mods
import React from 'react';
import { Route } from 'react-router-dom';


import CrearMod from '../../components/mods/CrearMod';
import ModDetails from '../../components/mods/ModDetails';

const modRoutes = [
  <Route path="/mods" key="mods-base">
    <Route index element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Explorar Mods</h1></div>} key="mods-index" />
    <Route path="crear" element={<CrearMod />} key="mods-crear" />
    <Route path=":id" element={<ModDetails />} key="mods-details" />
    <Route path="categoria/:categoria" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods por Categoría</h1></div>} key="mods-categoria" />
    <Route path="juego/:juegoId" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods por Juego</h1></div>} key="mods-juego" />
    <Route path="creador/:creadorId" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods por Creador</h1></div>} key="mods-creador" />
  </Route>,
];

export default modRoutes;