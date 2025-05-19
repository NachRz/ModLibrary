import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/home/Home';
import Dashboard from './components/dashboard/Dashboard';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import ResetPassword from './components/auth/ResetPassword';
import Register from './components/auth/Register';
import CrearMod from './components/mods/CrearMod';
import ModDetails from './components/mods/ModDetails';
import { NotificationProvider } from './context/NotificationContext';
import './assets/styles/context/notifications/Notification.css';

// Rutas que no deben mostrar el navbar ni el footer
const noLayoutRoutes = ['/login', '/register', '/reset-password'];

function App() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-custom-bg text-custom-text">
        {shouldShowLayout && <Navbar />}
        <main className="flex-grow">
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<Home />} />

            {/* Rutas de autenticación */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rutas del dashboard */}
            <Route path="/dashboard" element={<Dashboard defaultTab={0} />} />
            <Route path="/dashboard/mis-mods" element={<Dashboard defaultTab={1} />} />
            <Route path="/dashboard/juegos-favoritos" element={<Dashboard defaultTab={2} />} />
            <Route path="/dashboard/guardados" element={<Dashboard defaultTab={3} />} />

            {/* Rutas de mods */}
            <Route path="/mods">
              <Route index element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Explorar Mods</h1></div>} />
              <Route path="crear" element={<CrearMod />} />
              <Route path=":id" element={<ModDetails />} />
              <Route path="categoria/:categoria" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods por Categoría</h1></div>} />
              <Route path="juego/:juegoId" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods por Juego</h1></div>} />
              <Route path="creador/:creadorId" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods por Creador</h1></div>} />
            </Route>

            {/* Rutas de exploración */}
            <Route path="/explorar" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Explorar Mods</h1></div>} />
            <Route path="/tendencias" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Tendencias</h1></div>} />
            <Route path="/categorias" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Categorías</h1></div>} />

            {/* Rutas de usuario */}
            <Route path="/perfil" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mi Perfil</h1></div>} />
            <Route path="/mis-mods" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mis Mods</h1></div>} />
            <Route path="/guardados" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods Guardados</h1></div>} />

            {/* Ruta 404 */}
            <Route path="*" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Página no encontrada</h1></div>} />
          </Routes>
        </main>
        {shouldShowLayout && <Footer />}
      </div>
    </NotificationProvider>
  );
}

export default App; 