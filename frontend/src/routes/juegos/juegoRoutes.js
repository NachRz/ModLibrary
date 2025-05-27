// Rutas de Juegos
import React from 'react';
import { Route } from 'react-router-dom';
import ExplorarJuegos from '../../components/explorarJuegos/ExplorarJuegos';
import GameDetails from '../../components/juegos/gameDetails';

const juegoRoutes = [
  <Route path="/juegos" element={<ExplorarJuegos />} key="juegos-lista" />,
  <Route path="/juegos/:id" element={<GameDetails />} key="juegos-detalles" />,
];

export default juegoRoutes; 