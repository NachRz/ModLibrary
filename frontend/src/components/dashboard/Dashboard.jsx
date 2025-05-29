import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../common/Tabs';
import General from './panels/General';
import MisMods from './panels/MisMods';
import JuegosFavoritos from './panels/JuegosFavoritos';
import ModsGuardados from './panels/ModsGuardados';
import PageContainer from '../layout/PageContainer';
import AdminToggle from '../common/AdminToggle';
import UsuariosAdmin from './adminPanels/UsuariosAdmin';
import ModsAdmin from './adminPanels/ModsAdmin';

const Dashboard = ({ defaultTab = 0 }) => {
  // Obtener la ubicación actual y navegación
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [adminModeActive, setAdminModeActive] = useState(false);
  
  // Mapeo de rutas a índices de pestañas
  const pathToTabIndex = {
    '/dashboard': 0,
    '/dashboard/mis-mods': 1,
    '/dashboard/juegos-favoritos': 2,
    '/dashboard/guardados': 3
  };

  // Mapeo de índices de pestañas a rutas
  const tabIndexToPath = {
    0: '/dashboard',
    1: '/dashboard/mis-mods',
    2: '/dashboard/juegos-favoritos',
    3: '/dashboard/guardados'
  };
  
  // Actualizar la pestaña activa basada en la ruta actual
  useEffect(() => {
    const tabIndex = pathToTabIndex[location.pathname] !== undefined 
      ? pathToTabIndex[location.pathname] 
      : defaultTab;
    
    setCurrentTab(tabIndex);
  }, [location.pathname, defaultTab]);

  // Función para manejar cambios de pestaña
  const handleTabChange = (index) => {
    // Si está en modo admin, no cambiar rutas
    if (adminModeActive) {
      setCurrentTab(index);
      return;
    }
    
    // Navegar a la ruta correspondiente para modo normal
    navigate(tabIndexToPath[index]);
  };

  // Función para manejar el toggle de admin
  const handleAdminToggle = (isActive) => {
    setAdminModeActive(isActive);
    // Resetear a la primera pestaña cuando se cambie de modo
    setCurrentTab(0);
  };

  // Configuración de pestañas para modo normal
  const normalTabConfig = [
    {
      label: 'General',
      content: <General />
    },
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
    }
  ];

  // Seleccionar configuración de pestañas según el modo
  const tabConfig = adminModeActive ? adminTabConfig : normalTabConfig;

  return (
    <PageContainer>
      <div className="bg-custom-card rounded-lg shadow-lg p-6">
        {/* Header con toggle de admin */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {adminModeActive ? 'Panel de Administración' : 'Dashboard'}
            </h1>
            {adminModeActive && (
              <p className="text-sm text-gray-400 mt-1">
                Gestión avanzada del sistema
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
          defaultTab={currentTab} 
          onTabChange={handleTabChange}
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard; 