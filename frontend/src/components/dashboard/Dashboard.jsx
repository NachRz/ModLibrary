import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../common/Tabs';
import MisMods from './panels/MisMods';
import JuegosFavoritos from './panels/JuegosFavoritos';
import ModsGuardados from './panels/ModsGuardados';
import PageContainer from '../layout/PageContainer';
import AdminToggle from './AdminToggle';
import UsuariosAdmin from './adminPanels/UsuariosAdmin';
import ModsAdmin from './adminPanels/ModsAdmin';
import ComentariosAdmin from './adminPanels/ComentariosAdmin';

const Dashboard = ({ defaultTab = 0 }) => {
  // Obtener la ubicación actual y navegación
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [adminModeActive, setAdminModeActive] = useState(false);
  
  // Mapeo de rutas a índices de pestañas (sin General)
  const pathToTabIndex = {
    '/dashboard/mis-mods': 0,
    '/dashboard/juegos-favoritos': 1,
    '/dashboard/guardados': 2
  };

  // Mapeo de índices de pestañas a rutas (sin General)
  const tabIndexToPath = {
    0: '/dashboard/mis-mods',
    1: '/dashboard/juegos-favoritos',
    2: '/dashboard/guardados'
  };

  // Configuración de pestañas para modo normal (sin General)
  const normalTabConfig = [
    {
      label: 'Mis Mods',
      content: <MisMods />
    },
    {
      label: 'Juegos Favoritos',
      content: <JuegosFavoritos />
    },
    {
      label: 'Mods Guardados',
      content: <ModsGuardados />
    }
  ];

  // Configuración de pestañas para modo admin
  const adminTabConfig = [
    {
      label: 'Usuarios',
      content: <UsuariosAdmin />
    },
    {
      label: 'Mods',
      content: <ModsAdmin />
    },
    {
      label: 'Comentarios',
      content: <ComentariosAdmin />
    }
  ];

  // Seleccionar configuración de pestañas según el modo
  const tabConfig = adminModeActive ? adminTabConfig : normalTabConfig;
  
  // Actualizar la pestaña activa basada en la ruta actual (solo en modo normal)
  useEffect(() => {
    if (!adminModeActive) {
      const tabIndex = pathToTabIndex[location.pathname] !== undefined 
        ? pathToTabIndex[location.pathname] 
        : defaultTab;
      
      // Validar que el índice esté dentro del rango
      if (tabIndex >= 0 && tabIndex < normalTabConfig.length) {
        setCurrentTab(tabIndex);
      } else {
        setCurrentTab(0);
      }
    }
  }, [location.pathname, defaultTab, adminModeActive]);

  // Función para manejar cambios de pestaña
  const handleTabChange = (index) => {
    // Validar que el índice esté dentro del rango de la configuración actual
    if (index < 0 || index >= tabConfig.length) {
      console.warn('Índice de pestaña fuera de rango:', index);
      return;
    }
    
    setCurrentTab(index);
    
    // Si está en modo admin, no cambiar rutas
    if (adminModeActive) {
      return;
    }
    
    // Navegar a la ruta correspondiente para modo normal
    if (tabIndexToPath[index]) {
      navigate(tabIndexToPath[index]);
    }
  };

  // Función para manejar el toggle de admin
  const handleAdminToggle = (isActive) => {
    setAdminModeActive(isActive);
    // Resetear a la primera pestaña cuando se cambie de modo
    setCurrentTab(0);
  };

  // Asegurar que currentTab esté dentro del rango válido para la configuración actual
  const safeCurrentTab = currentTab >= 0 && currentTab < tabConfig.length ? currentTab : 0;

  return (
    <PageContainer>
      <div className="bg-custom-card rounded-lg shadow-lg p-6 mb-8">
        {/* Header con toggle de admin */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {adminModeActive ? 'Panel de Administración' : 'Mi panel'}
            </h1>
            {adminModeActive ? (
              <p className="text-sm text-gray-400 mt-1">
                Gestión avanzada del sistema
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                Tu espacio personal de gestión
              </p>
            )}
          </div>
          <AdminToggle 
            isEnabled={adminModeActive} 
            onToggle={handleAdminToggle} 
          />
        </div>
        
        <Tabs 
          tabs={tabConfig} 
          defaultTab={safeCurrentTab} 
          onTabChange={handleTabChange}
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard; 