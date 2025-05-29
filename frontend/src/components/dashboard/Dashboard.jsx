import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../common/Tabs';
import General from './panels/General';
import MisMods from './panels/MisMods';
import JuegosFavoritos from './panels/JuegosFavoritos';
import ModsGuardados from './panels/ModsGuardados';
import PageContainer from '../layout/PageContainer';
import AdminToggle from '../common/AdminToggle';

const Dashboard = ({ defaultTab = 0 }) => {
  // Obtener la ubicación actual y navegación
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(defaultTab);
  
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
    // Navegar a la ruta correspondiente
    navigate(tabIndexToPath[index]);
  };

  // Configuración de pestañas con sus componentes correspondientes
  const tabConfig = [
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

  return (
    <PageContainer>
      <div className="bg-custom-card rounded-lg shadow-lg p-6">
        {/* Header con toggle de admin */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <AdminToggle />
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