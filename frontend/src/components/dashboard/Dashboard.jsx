import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Tabs from '../common/Tabs';
import General from './panels/General';
import MisMods from './panels/MisMods';
import JuegosFavoritos from './panels/JuegosFavoritos';
import ModsGuardados from './panels/ModsGuardados';

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
    <div className="bg-custom-bg/40 min-h-[calc(100vh-64px)]">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Encabezado del Dashboard */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Mi Panel</h1>
              <p className="mt-2 text-custom-detail font-medium">Gestiona tus mods, juegos y preferencias</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="bg-custom-primary hover:bg-custom-primary-hover text-white flex items-center rounded-lg px-4 py-2 transition-all duration-300 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Nuevo Mod</span>
              </button>
              <button className="bg-custom-card hover:bg-custom-card/80 text-white flex items-center rounded-lg px-4 py-2 border border-custom-detail/10 transition-all duration-300 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Configuración</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel principal con pestañas */}
        <div id="dashboard-tabs" className="bg-custom-card rounded-xl shadow-xl overflow-hidden border border-custom-detail/10">
          <Tabs 
            tabs={tabConfig} 
            defaultTab={currentTab} 
            onTabChange={handleTabChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 