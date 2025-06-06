import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

const useBreadcrumb = () => {
  const location = useLocation();
  const params = useParams();

  const getBreadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Si estamos en la página principal, no mostrar breadcrumb
    if (pathSegments.length === 0) {
      return [];
    }

    const items = [];

    // Casos específicos según los requisitos
    
    // Home > Mods (cuando estás en explorarMods)
    if (pathSegments[0] === 'mods' && pathSegments.length === 1) {
      items.push({ label: 'Mods', path: '/mods' });
    }
    
    // Home > Juegos (cuando estás en explorarJuegos)  
    else if (pathSegments[0] === 'juegos' && pathSegments.length === 1) {
      items.push({ label: 'Juegos', path: '/juegos' });
    }
    
    // Home > [Nombre Juego] (cuando estás en JuegosDetails)
    else if (pathSegments[0] === 'juegos' && pathSegments.length === 2) {
      // Intentar obtener el nombre del juego desde el DOM
      const gameNameElement = document.querySelector('[data-game-name]');
      const gameName = gameNameElement?.getAttribute('data-game-name') || 'Juego';
      
      items.push({ label: gameName, path: `/juegos/${pathSegments[1]}` });
    }
    
    // Home > Mis Mods > Crear Mod (cuando estás en crear mod) - DEBE IR ANTES QUE ModDetails
    else if (pathSegments[0] === 'mods' && pathSegments[1] === 'crear') {
      items.push({ label: 'Mis Mods', path: '/dashboard/mis-mods' });
      items.push({ label: 'Crear Mod', path: '/mods/crear' });
    }
    
    // Home > [Nombre Juego] > [Nombre Mod] (cuando estás en ModDetails)
    else if (pathSegments[0] === 'mods' && pathSegments.length === 2) {
      // Intentar obtener el nombre del juego y mod desde el DOM
      const gameNameElement = document.querySelector('[data-game-name]');
      const modNameElement = document.querySelector('[data-mod-name]');
      const gameName = gameNameElement?.getAttribute('data-game-name') || 'Juego';
      const modName = modNameElement?.getAttribute('data-mod-name') || 'Mod';
      
      // Obtener el ID del juego del mod para hacer navegable el enlace del juego
      const gameId = document.querySelector('[data-game-id]')?.getAttribute('data-game-id');
      const gameUrl = gameId ? `/juegos/${gameId}` : '/juegos';
      
      items.push({ label: gameName, path: gameUrl });
      items.push({ label: modName, path: `/mods/${pathSegments[1]}` });
    }
    
    // Home > Mis Mods (MisMods)
    else if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'mis-mods') {
      items.push({ label: 'Mis Mods', path: '/dashboard/mis-mods' });
    }
    
    // Home > Juegos Favoritos (JuegosFav)
    else if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'juegos-favoritos') {
      items.push({ label: 'Juegos Favoritos', path: '/dashboard/juegos-favoritos' });
    }
    
    // Home > Mods Guardados (ModGuardados)
    else if (pathSegments[0] === 'dashboard' && pathSegments[1] === 'guardados') {
      items.push({ label: 'Mods Guardados', path: '/dashboard/guardados' });
    }
    
    // Home > Mis Mods (cuando estás en /dashboard base)
    else if (pathSegments[0] === 'dashboard' && pathSegments.length === 1) {
      items.push({ label: 'Mis Mods', path: '/dashboard/mis-mods' });
    }
    
    // Home > Resultados Búsqueda (searchPage)
    else if (pathSegments[0] === 'search') {
      items.push({ label: 'Resultados Búsqueda', path: '/search' });
    }
    
    // Home > Usuarios (cuando estás en /admin base)
    else if (pathSegments[0] === 'admin' && pathSegments.length === 1) {
      items.push({ label: 'Usuarios', path: '/admin/usuarios' });
    }
    
    // Home > Usuarios (UsuariosAdmin)
    else if (pathSegments[0] === 'admin' && pathSegments[1] === 'usuarios') {
      items.push({ label: 'Usuarios', path: '/admin/usuarios' });
    }
    
    // Home > Mods (ModsAdmin)
    else if (pathSegments[0] === 'admin' && pathSegments[1] === 'mods') {
      items.push({ label: 'Mods', path: '/admin/mods' });
    }
    
    // Home > Comentarios (ComentariosAdmin)
    else if (pathSegments[0] === 'admin' && pathSegments[1] === 'comentarios') {
      items.push({ label: 'Comentarios', path: '/admin/comentarios' });
    }
    
    // Casos genéricos para otras rutas
    else {
      const breadcrumbMap = {
        'explorar': 'Explorar',
        'mods': 'Mods',
        'juegos': 'Juegos',
        'dashboard': 'Panel',
        'admin': 'Panel Admin',
        'mis-mods': 'Mis Mods',
        'juegos-favoritos': 'Juegos Favoritos',
        'guardados': 'Mods Guardados',
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
        'comentarios': 'Comentarios',
        'search': 'Resultados Búsqueda',
        'contacto': 'Contacto'
      };

      let currentPath = '';
      
      pathSegments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        // Si el segmento es un ID (contiene solo números), intentamos obtener un nombre más descriptivo
        if (/^\d+$/.test(segment)) {
          // Para IDs, usar "Detalles" como placeholder
          items.push({
            label: 'Detalles',
            path: currentPath
          });
        } else {
          items.push({
            label: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
            path: currentPath
          });
        }
      });
    }

    return items;
  }, [location.pathname]);

  return getBreadcrumbItems;
};

export default useBreadcrumb; 