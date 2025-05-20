import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const useBreadcrumb = () => {
  const location = useLocation();

  const breadcrumbMap = {
    'explorar': 'Explorar',
    'mods': 'Mods',
    'dashboard': 'Panel',
    'mis-mods': 'Mis Mods',
    'juegos-favoritos': 'Juegos Favoritos',
    'guardados': 'Guardados',
    'crear': 'Crear Mod',
    'categoria': 'Categoría',
    'juego': 'Juego',
    'creador': 'Creador',
    'recientes': 'Recientes',
    'populares': 'Populares',
    'tendencias': 'Tendencias',
    'categorias': 'Categorías',
    'perfil': 'Perfil',
  };

  const getBreadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    return pathSegments.map((segment, index) => {
      currentPath += `/${segment}`;
      
      // Si el segmento es un ID (contiene solo números), intentamos obtener un nombre más descriptivo
      if (/^\d+$/.test(segment)) {
        // Aquí podrías implementar lógica para obtener nombres descriptivos de IDs
        // Por ejemplo, nombre del mod, categoría, etc.
        return {
          label: 'Detalles', // Placeholder, idealmente reemplazar con nombre real
          path: currentPath
        };
      }

      return {
        label: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      };
    });
  }, [location.pathname]);

  return getBreadcrumbItems;
};

export default useBreadcrumb; 