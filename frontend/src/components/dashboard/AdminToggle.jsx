import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminToggle = ({ isEnabled = false, onToggle }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // No mostrar nada si el usuario no es admin
  if (!isAdmin) {
    return null;
  }

  // Detectar automáticamente si estamos en rutas de admin
  const isInAdminMode = location.pathname.startsWith('/admin');
  const actualIsEnabled = isEnabled || isInAdminMode;

  const handleToggle = () => {
    const newState = !actualIsEnabled;
    
    if (newState) {
      // Activar admin: ir a las rutas de admin
      navigate('/admin/usuarios');
    } else {
      // Desactivar admin: volver al dashboard normal
      navigate('/dashboard/mis-mods');
    }
    
    onToggle && onToggle(newState);
    console.log('Modo admin:', newState ? 'activado' : 'desactivado');
  };

  return (
    <div className="relative flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-300">
        Modo Admin
      </span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
          actualIsEnabled 
            ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
            : 'bg-gray-600'
        }`}
        type="button"
        role="switch"
        aria-checked={actualIsEnabled}
        aria-label="Toggle modo admin"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            actualIsEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      {/* Mensaje de estado con posición absoluta para no afectar el layout */}
      {actualIsEnabled && (
        <div className="absolute -bottom-6 right-0 text-xs text-purple-400 whitespace-nowrap">
          ✓ Activo
        </div>
      )}
    </div>
  );
};

export default AdminToggle; 