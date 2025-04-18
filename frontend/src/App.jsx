import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './components/home/Home';
import Dashboard from './components/dashboard/Dashboard';
import Footer from './components/layout/Footer';
import Login from './components/auth/Login';
import ResetPassword from './components/auth/ResetPassword';

// Rutas que no deben mostrar el navbar ni el footer
const noLayoutRoutes = ['/login', '/register', '/reset-password'];

function App() {
  const location = useLocation();
  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-custom-bg text-custom-text">
      {shouldShowLayout && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard defaultTab={0} />} />
          <Route path="/dashboard/mis-mods" element={<Dashboard defaultTab={1} />} />
          <Route path="/dashboard/mis-juegos" element={<Dashboard defaultTab={2} />} />
          <Route path="/dashboard/juegos-favoritos" element={<Dashboard defaultTab={3} />} />
          <Route path="/dashboard/guardados" element={<Dashboard defaultTab={4} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/explorar" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Explorar Mods</h1></div>} />
          <Route path="/tendencias" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Tendencias</h1></div>} />
          <Route path="/categorias" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Categorías</h1></div>} />
          <Route path="/register" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Registrarse</h1></div>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/perfil" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mi Perfil</h1></div>} />
          <Route path="/mis-mods" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mis Mods</h1></div>} />
          <Route path="/guardados" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Mods Guardados</h1></div>} />
          <Route path="*" element={<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-3xl font-bold">Página no encontrada</h1></div>} />
        </Routes>
      </main>
      {shouldShowLayout && <Footer />}
    </div>
  );
}

export default App; 