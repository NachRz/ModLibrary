import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Tabs from '../common/Tabs';
import PageContainer from '../layout/PageContainer';
import AdminToggle from './AdminToggle';
import UsuariosAdmin from './adminPanels/UsuariosAdmin';
import ModsAdmin from './adminPanels/ModsAdmin';
import ComentariosAdmin from './adminPanels/ComentariosAdmin';

const AdminDashboard = ({ defaultTab = 0 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(defaultTab);

  // Mapeo de rutas a índices de pestañas de admin
  const pathToTabIndex = {
    '/admin': 0,
    '/admin/usuarios': 0,
    '/admin/mods': 1,
    '/admin/comentarios': 2
  };

  // Mapeo de índices de pestañas a rutas de admin
  const tabIndexToPath = {
    0: '/admin/usuarios',
    1: '/admin/mods',
    2: '/admin/comentarios'
  };

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

  // Actualizar la pestaña activa basada en la ruta actual
  useEffect(() => {
    const tabIndex = pathToTabIndex[location.pathname] !== undefined
      ? pathToTabIndex[location.pathname]
      : defaultTab;

    // Validar que el índice esté dentro del rango
    if (tabIndex >= 0 && tabIndex < adminTabConfig.length) {
      setCurrentTab(tabIndex);
    } else {
      setCurrentTab(0);
    }
  }, [location.pathname, defaultTab]);

  // Función para manejar cambios de pestaña
  const handleTabChange = (index) => {
    // Validar que el índice esté dentro del rango
    if (index < 0 || index >= adminTabConfig.length) {
      console.warn('Índice de pestaña fuera de rango:', index);
      return;
    }

    setCurrentTab(index);

    // Navegar a la ruta correspondiente
    if (tabIndexToPath[index]) {
      navigate(tabIndexToPath[index]);
    }
  };

  // Asegurar que currentTab esté dentro del rango válido
  const safeCurrentTab = currentTab >= 0 && currentTab < adminTabConfig.length ? currentTab : 0;

  // Función para manejar el toggle de admin
  const handleAdminToggle = (isActive) => {
    // La navegación se maneja en AdminToggle
    // Resetear a la primera pestaña cuando se cambie de modo
    setCurrentTab(0);
  };

  return (
    <PageContainer>
      <div className="bg-custom-card rounded-lg shadow-lg p-6 mb-8">
        {/* Header del panel de administración */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Gestión avanzada del sistema
            </p>
          </div>

          {/* Toggle de admin para poder volver */}
          <AdminToggle
            isEnabled={true}
            onToggle={handleAdminToggle}
          />
        </div>

        <Tabs
          tabs={adminTabConfig}
          defaultTab={safeCurrentTab}
          onTabChange={handleTabChange}
        />
      </div>
    </PageContainer>
  );
};

export default AdminDashboard; 