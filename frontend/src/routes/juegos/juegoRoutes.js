// Rutas de Juegos
import React from 'react';
import { Route } from 'react-router-dom';
import ExplorarJuegos from '../../components/explorarJuegos/ExplorarJuegos';

// Placeholder para el componente de detalles de un juego
const DetallesJuego = () => <div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Detalles del Juego</h1></div>;

const juegoRoutes = [
  <Route path="/juegos" element={<ExplorarJuegos />} key="juegos-lista" />,
  <Route path="/juegos/:id" element={<DetallesJuego />} key="juegos-detalles" />,
];

export default juegoRoutes; 