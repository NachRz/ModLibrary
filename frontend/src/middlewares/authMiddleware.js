import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login con la ruta actual como parámetro
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere admin y el usuario no es admin, mostrar error de acceso
  if (requireAdmin && (!user.rol || user.rol !== 'admin')) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-xl font-bold mb-2">Acceso Denegado</h2>
          <p className="mb-4">No tienes permisos para acceder a esta página.</p>
          <p className="text-sm">Se requieren privilegios de administrador.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 