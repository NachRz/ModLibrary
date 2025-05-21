import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Archivo principal de rutas

import Home from '../components/home/Home';
import authRoutes from './auth/authRoutes';
import dashboardRoutes from './dashboard/dashboardRoutes';
import modRoutes from './mods/modRoutes';
import exploreRoutes from './explore/exploreRoutes';
import userRoutes from './user/userRoutes';


const AppRoutes = () => {
    return (
        <Routes>
            
            {/* Rutas de autenticación */}
            {authRoutes}

            {/* Rutas del dashboard */}
            {dashboardRoutes}

            {/* Rutas de mods */}
            {modRoutes}

            {/* Rutas de exploración */}
            {exploreRoutes}

            {/* Rutas de usuario */}
            {userRoutes}

            {/* Ruta 404 */}
            <Route path="*" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Página no encontrada</h1></div>} />

            {/* Ruta principal */}
            <Route path="/" element={<Home />} />
        </Routes>
    );
};

export default AppRoutes;