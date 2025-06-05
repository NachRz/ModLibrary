import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const useBreadcrumb = () => {
  const location = useLocation();
  const params = useParams();

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
    'usuarios': 'Usuarios',
  };

  const getBreadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    return pathSegments.map((segment, index) => {
      currentPath += `/${segment}`;
      
      // Manejar rutas específicas de perfiles públicos: /usuarios/{id}/perfil
      if (pathSegments[0] === 'usuarios' && pathSegments[2] === 'perfil') {
        if (index === 0) {
          return {
            label: 'Home',
            path: '/'
          };
        }
        
        if (index === 1) {
          // Este es el ID del usuario
          // Intentar obtener el nombre del usuario desde el DOM o contexto
          const userNameElement = document.querySelector('[data-username]');
          const userName = userNameElement?.getAttribute('data-username');
          
          return {
            label: userName || `Usuario ${segment}`,
            path: `/usuarios/${segment}/perfil`
          };
        }
        
        if (index === 2) {
          // Este es "perfil", lo saltamos ya que está implícito en el nombre del usuario
          return null;
        }
      }
      
      // Si el segmento es un ID (contiene solo números), intentamos obtener un nombre más descriptivo
      if (/^\d+$/.test(segment)) {
        // implementar lógica para obtener nombres descriptivos de IDs
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
    }).filter(Boolean); // Filtrar elementos null
  }, [location.pathname]);

  return getBreadcrumbItems;
};

export default useBreadcrumb; 