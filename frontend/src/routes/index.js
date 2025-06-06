import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Archivo principal de rutas

import Home from '../components/home/Home';
import Contacto from '../components/contacto/Contacto';
import SearchResults from '../components/common/SearchResults';
import NotFound from '../components/common/NotFound';
import authRoutes from './auth/authRoutes';
import dashboardRoutes from './dashboard/dashboardRoutes';
import adminRoutes from './admin/adminRoutes';
import modRoutes from './mods/modRoutes';
import userRoutes from './user/userRoutes';
import juegoRoutes from './juegos/juegoRoutes';


const AppRoutes = () => {
    return (
        <Routes>

            {/* Rutas de autenticación */}
            {authRoutes}

            {/* Rutas del dashboard */}
            {dashboardRoutes}

            {/* Rutas del panel de administración */}
            {adminRoutes}

            {/* Rutas de mods */}
            {modRoutes}

            {/* Rutas de juegos */}
            {juegoRoutes}

            {/* Rutas de usuario */}
            {userRoutes}

            {/* Ruta de búsqueda */}
            <Route path="/search" element={<SearchResults />} />

            {/* Ruta de contacto */}
            <Route path="/contacto" element={<Contacto />} />

            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />

            {/* Ruta principal */}
            <Route path="/" element={<Home />} />
        </Routes>
    );
};

export default AppRoutes;