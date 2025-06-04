import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModCard from '../common/Cards/ModCard';
import ModList from '../common/list/ModList';
import modService from '../../services/api/modService';
import useUserModsStatus from '../../hooks/useUserModsStatus';
import { useNotification } from '../../context/NotificationContext';
import PageContainer from '../layout/PageContainer';
import ModDeleteConfirmationModal from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import '../../assets/styles/components/explorarMods/ExplorarMods.css';

const ExplorarMods = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Hook unificado para optimizar verificaciones de usuario
  const { 
    isAuthenticated, 
    getOwnershipMap, 
    getSavedMap, 
    loading: userLoading 
  } = useUserModsStatus();

  // Constante para filtros por defecto (evitar duplicación)
  const FILTROS_DEFAULT = {
    juego: '',
    categoria: '',
    etiquetas: [],
    busqueda: '',
    ordenarPor: 'recientes',
    orden: 'desc',
    edades_seleccionadas: [],
    popularidad: '',
    version: '',
    fechaDesde: '',
    fechaHasta: '',
    periodoTiempo: 'todo',
    descargasMin: '',
    descargasMax: '',
    valoracionesMin: '',
    valoracionesMax: '',
    tamanoMin: '',
    tamanoMax: '',
    busquedaDescripcion: '',
    busquedaAutor: '',
    etiquetasExcluidas: []
  };

  // Lista de claves válidas para URL (evitar duplicación)
  const CLAVES_FILTROS_VALIDAS = [
    'juego', 'categoria', 'etiquetas', 'busqueda', 'ordenarPor', 'orden',
    'edades_seleccionadas', 'popularidad', 'version', 'fechaDesde', 'fechaHasta',
    'periodoTiempo', 'descargasMin', 'descargasMax', 'valoracionesMin', 'valoracionesMax',
    'tamanoMin', 'tamanoMax', 'busquedaDescripcion', 'busquedaAutor', 'etiquetasExcluidas'
  ];

  // Estados
  const [mods, setMods] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [vistaActual, setVistaActual] = useState('compacta'); // 'compacta' o 'lista'
  const [filtros, setFiltros] = useState(FILTROS_DEFAULT);
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    resultadosPorPagina: 20, // Mantener 20 como estaba originalmente
    totalPaginas: 1
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);

  // Añadir estados para manejo de secciones colapsables
  const [secciones, setSecciones] = useState({
    juego: true,
    etiquetas: true,
    parametrosBusqueda: true,
    opcionesContenido: true,
    tamanoArchivo: true,
    descargas: true,
    valoraciones: true
  });

  // Estados para búsqueda de etiquetas
  const [busquedaEtiquetasIncluir, setBusquedaEtiquetasIncluir] = useState('');
  const [busquedaEtiquetasExcluir, setBusquedaEtiquetasExcluir] = useState('');
  
  // Estado para búsqueda de juegos
  const [busquedaJuegos, setBusquedaJuegos] = useState('');
  const [showJuegosDropdown, setShowJuegosDropdown] = useState(false);
  
  // Estados para controlar dropdowns de etiquetas
  const [showEtiquetasIncluirDropdown, setShowEtiquetasIncluirDropdown] = useState(false);
  const [showEtiquetasExcluirDropdown, setShowEtiquetasExcluirDropdown] = useState(false);

  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modToDelete, setModToDelete] = useState(null);

  // Función helper para resetear estados de búsqueda
  const resetearEstadosBusqueda = useCallback(() => {
    setBusquedaJuegos('');
    setBusquedaEtiquetasIncluir('');
    setBusquedaEtiquetasExcluir('');
    setShowJuegosDropdown(false);
    setShowEtiquetasIncluirDropdown(false);
    setShowEtiquetasExcluirDropdown(false);
  }, []);

  // Función helper para sincronizar búsqueda de juegos con filtros
  const sincronizarBusquedaJuegos = useCallback((filtrosData) => {
    if (filtrosData.juego) {
      setBusquedaJuegos(filtrosData.juego);
    } else {
      setBusquedaJuegos('');
    }
  }, []);

  // Función para obtener filtros desde la URL
  const obtenerFiltrosDesdeURL = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filtrosURL = {};
    
    // Obtener cada filtro de la URL
    CLAVES_FILTROS_VALIDAS.forEach(key => {
      const valor = urlParams.get(key);
      if (valor !== null) {
        if (key === 'etiquetas' || key === 'edades_seleccionadas' || key === 'etiquetasExcluidas') {
          filtrosURL[key] = valor ? valor.split(',') : [];
        } else {
          filtrosURL[key] = valor;
        }
      }
    });
    
    return filtrosURL;
  }, []);

  // Función para guardar filtros en la URL
  const guardarFiltrosEnURL = useCallback((nuevosFiltros) => {
    const params = new URLSearchParams();
    
    Object.keys(nuevosFiltros).forEach(key => {
      const valor = nuevosFiltros[key];
      if (valor && valor !== '' && (Array.isArray(valor) ? valor.length > 0 : true)) {
        if (Array.isArray(valor)) {
          params.set(key, valor.join(','));
        } else {
          params.set(key, valor);
        }
      }
    });
    
    const nuevaURL = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    
    // Usar replaceState para no agregar nueva entrada al historial en cambios normales
    window.history.replaceState({ filtros: nuevosFiltros }, '', nuevaURL);
  }, []);

  // Restaurar filtros al cargar el componente
  useEffect(() => {
    const filtrosURL = obtenerFiltrosDesdeURL();
    if (Object.keys(filtrosURL).length > 0) {
      setFiltros(prev => ({ ...prev, ...filtrosURL }));
      
      // Sincronizar búsqueda de juegos
      sincronizarBusquedaJuegos(filtrosURL);
    }
  }, [obtenerFiltrosDesdeURL, sincronizarBusquedaJuegos]);

  // Manejar navegación del navegador (botones atrás/adelante)
  useEffect(() => {
    const manejarPopState = (event) => {
      if (event.state && event.state.filtros) {
        // Restaurar filtros desde el estado del historial
        setFiltros(event.state.filtros);
        
        // Sincronizar búsqueda de juegos
        sincronizarBusquedaJuegos(event.state.filtros);
      } else {
        // Si no hay estado, obtener filtros desde la URL
        const filtrosURL = obtenerFiltrosDesdeURL();
        if (Object.keys(filtrosURL).length > 0) {
          setFiltros(prev => ({ ...prev, ...filtrosURL }));
          sincronizarBusquedaJuegos(filtrosURL);
        } else {
          // Limpiar filtros si no hay parámetros en la URL
          setFiltros(FILTROS_DEFAULT);
          setBusquedaJuegos('');
        }
      }
    };

    window.addEventListener('popstate', manejarPopState);
    
    return () => {
      window.removeEventListener('popstate', manejarPopState);
    };
  }, [obtenerFiltrosDesdeURL, sincronizarBusquedaJuegos]);

  // Guardar filtros en URL cuando cambien
  useEffect(() => {
    guardarFiltrosEnURL(filtros);
  }, [filtros, guardarFiltrosEnURL]);

  // Cargar mods desde la base de datos
  const cargarMods = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await modService.getAllMods();
      if (response.status === 'success') {
        // Simplificar el formateo de datos - usar solo lo esencial
        setMods(response.data.map(mod => ({
          id: mod.id,
          titulo: mod.titulo,
          imagen_banner: mod.imagen_banner,
          juego: mod.juego || { titulo: 'Juego desconocido' },
          categoria: mod.etiquetas?.[0]?.nombre || 'General',
          etiquetas: mod.etiquetas || [],
          autor: mod.creador?.nome || 'Anónimo',
          creador_id: mod.creador_id,
          descargas: mod.total_descargas || 0,
          valoracion: mod.val_media || 0,
          numValoraciones: mod.num_valoraciones || 0,
          descripcion: mod.descripcion || '',
          fecha: mod.fecha_creacion || mod.created_at,
          estado: mod.estado || 'publicado',
          edad_recomendada: Number(mod.edad_recomendada || 0),
          popularidad: mod.popularidad || 'baja',
          version: mod.version || '1.0'
        })));
      } else {
        throw new Error(response.message || 'Error al cargar los mods');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los mods');
      showNotification('Error al cargar los mods', 'error');
    } finally {
      setCargando(false);
    }
  }, [showNotification]);

  useEffect(() => {
    cargarMods();
  }, [cargarMods]);

  // Sincronizar búsqueda de juegos con filtro actual
  useEffect(() => {
    // Solo sincronizar si realmente hay una diferencia
    if (filtros.juego !== busquedaJuegos) {
      setBusquedaJuegos(filtros.juego || '');
    }
  }, [filtros.juego]); // Removido busquedaJuegos de las dependencias para evitar bucle

  // Función para remover filtro de juego específicamente
  const removeJuegoFilter = useCallback(() => {
    setFiltros(prev => ({ ...prev, juego: '' }));
    setBusquedaJuegos('');
    setShowJuegosDropdown(false);
  }, []);

  // Función para seleccionar un juego específico
  const selectJuego = useCallback((juego) => {
    setFiltros(prev => ({ ...prev, juego }));
    setBusquedaJuegos(juego);
    setShowJuegosDropdown(false);
  }, []);

  // Función para limpiar selección de juego (todos los juegos)
  const clearJuegoSelection = useCallback(() => {
    setFiltros(prev => ({ ...prev, juego: '' }));
    setBusquedaJuegos('');
    setShowJuegosDropdown(false);
  }, []);

  // Cerrar dropdowns cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        resetearEstadosBusqueda();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [resetearEstadosBusqueda]);

  // Filtrar y ordenar los mods usando useMemo para evitar recálculos innecesarios
  const modsFiltrados = useMemo(() => {
    return mods
      .filter(mod => {
        // Filtro por búsqueda general
        if (filtros.busqueda) {
          const searchTerm = filtros.busqueda.toLowerCase();
          return mod.titulo.toLowerCase().includes(searchTerm) ||
                 mod.descripcion.toLowerCase().includes(searchTerm) ||
                 mod.autor.toLowerCase().includes(searchTerm);
        }
        return true;
      })
      .filter(mod => !filtros.busquedaDescripcion || mod.descripcion.toLowerCase().includes(filtros.busquedaDescripcion.toLowerCase()))
      .filter(mod => !filtros.busquedaAutor || mod.autor.toLowerCase().includes(filtros.busquedaAutor.toLowerCase()))
      .filter(mod => !filtros.juego || mod.juego.titulo === filtros.juego)
      .filter(mod => {
        // Filtrar por etiquetas incluidas (cualquiera de las seleccionadas)
        if (filtros.etiquetas.length === 0) return true;
        return mod.etiquetas.some(tag => filtros.etiquetas.includes(tag.nombre));
      })
      .filter(mod => {
        // Si no hay edades seleccionadas, mostrar todos los mods
        if (filtros.edades_seleccionadas.length === 0) return true;

        const edadMod = Number(mod.edad_recomendada);

        // Si está seleccionado "Sin clasificar" (0) y el mod no tiene clasificación
        if (filtros.edades_seleccionadas.includes('0') && edadMod === 0) {
          return true;
        }

        // Si el mod no tiene clasificación y no está seleccionado "Sin clasificar"
        if (edadMod === 0) {
          return false;
        }

        // Mostrar solo los mods que coincidan exactamente con alguna de las edades seleccionadas
        return filtros.edades_seleccionadas.includes(String(edadMod));
      })
      .filter(mod => !filtros.popularidad || mod.popularidad === filtros.popularidad)
      .filter(mod => !filtros.version || mod.version === filtros.version)
      .filter(mod => {
        if (filtros.fechaDesde) {
          const fechaDesde = new Date(filtros.fechaDesde);
          const fechaMod = new Date(mod.fecha);
          
          // Si es filtro de últimas 24 horas, comparar con precisión de horas
          if (filtros.periodoTiempo === '24h') {
            const ahora = new Date();
            const hace24Horas = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
            if (fechaMod < hace24Horas) return false;
          } else {
            // Para otros períodos, comparar solo fechas
            if (fechaMod < fechaDesde) return false;
          }
        }
        if (filtros.fechaHasta) {
          const fechaHasta = new Date(filtros.fechaHasta);
          // Establecer la hora final del día para fechaHasta
          fechaHasta.setHours(23, 59, 59, 999);
          const fechaMod = new Date(mod.fecha);
          if (fechaMod > fechaHasta) return false;
        }
        return true;
      })
      .filter(mod => {
        // Filtrar por etiquetas excluidas
        if (filtros.etiquetasExcluidas.length === 0) return true;
        return !mod.etiquetas.some(tag => filtros.etiquetasExcluidas.includes(tag.nombre));
      })
      .filter(mod => {
        // Filtrar por número de descargas
        if (filtros.descargasMin && mod.descargas < parseInt(filtros.descargasMin)) return false;
        if (filtros.descargasMax && mod.descargas > parseInt(filtros.descargasMax)) return false;
        return true;
      })
      .filter(mod => {
        // Filtrar por número de valoraciones
        if (filtros.valoracionesMin && mod.numValoraciones < parseInt(filtros.valoracionesMin)) return false;
        if (filtros.valoracionesMax && mod.numValoraciones > parseInt(filtros.valoracionesMax)) return false;
        return true;
      })
      .filter(mod => {
        // Filtrar por tamaño de archivo (simulado en MB)
        const tamanoMod = mod.tamano || Math.floor(Math.random() * 500) + 1; // Simulamos tamaño si no existe
        if (filtros.tamanoMin) {
          const tamanoMinMB = parseInt(filtros.tamanoMin);
          if (tamanoMod < tamanoMinMB) return false;
        }
        if (filtros.tamanoMax) {
          const tamanoMaxMB = parseInt(filtros.tamanoMax);
          if (tamanoMod > tamanoMaxMB) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order = filtros.orden === 'desc' ? -1 : 1;
        switch (filtros.ordenarPor) {
          case 'recientes':
            return order * (new Date(b.fecha) - new Date(a.fecha));
          case 'descargas':
            return order * (b.descargas - a.descargas);
          case 'valoracion':
            return order * (b.valoracion - a.valoracion);
          case 'alfabetico':
            return order * a.titulo.localeCompare(b.titulo);
          case 'popularidad':
            return order * (b.popularidad === 'alta' ? 3 : b.popularidad === 'media' ? 2 : 1) -
              (a.popularidad === 'alta' ? 3 : a.popularidad === 'media' ? 2 : 1);
          default:
            return 0;
        }
      });
  }, [mods, filtros]);

  // Calcular paginación usando useMemo
  const { modsEnPagina, totalPaginas } = useMemo(() => {
    const indiceInicial = (paginacion.paginaActual - 1) * paginacion.resultadosPorPagina;
    const indiceFinal = indiceInicial + paginacion.resultadosPorPagina;
    return {
      modsEnPagina: modsFiltrados.slice(indiceInicial, indiceFinal),
      totalPaginas: Math.ceil(modsFiltrados.length / paginacion.resultadosPorPagina)
    };
  }, [modsFiltrados, paginacion.paginaActual, paginacion.resultadosPorPagina]);

  // Efecto para animar el contador de resultados (optimizado)
  useEffect(() => {
    const timer = setTimeout(() => {
    setIsUpdatingResults(true);
      const updateTimer = setTimeout(() => setIsUpdatingResults(false), 200);
      return () => clearTimeout(updateTimer);
    }, 100);
    return () => clearTimeout(timer);
  }, [modsFiltrados.length]); // Solo cuando cambie el número de resultados

  // Actualizar paginación cuando cambien los resultados filtrados
  useEffect(() => {
    // Resetear a página 1 cuando cambien los filtros
    if (paginacion.paginaActual > totalPaginas && totalPaginas > 0) {
      setPaginacion(prev => ({
        ...prev,
        paginaActual: 1
      }));
    }
  }, [totalPaginas, paginacion.paginaActual]);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en los checkboxes de edad
  const handleEdadChange = (edad) => {
    setFiltros(prev => {
      const nuevasEdades = prev.edades_seleccionadas.includes(edad)
        ? prev.edades_seleccionadas.filter(e => e !== edad)
        : [...prev.edades_seleccionadas, edad];
      return {
        ...prev,
        edades_seleccionadas: nuevasEdades
      };
    });
  };

  // Función para manejar etiquetas excluidas
  const handleEtiquetaExcluidaChange = (etiqueta) => {
    setFiltros(prev => {
      const nuevasEtiquetasExcluidas = prev.etiquetasExcluidas.includes(etiqueta)
        ? prev.etiquetasExcluidas.filter(e => e !== etiqueta)
        : [...prev.etiquetasExcluidas, etiqueta];
      return {
        ...prev,
        etiquetasExcluidas: nuevasEtiquetasExcluidas
      };
    });
  };

  // Función para aplicar filtros de búsqueda avanzada
  const handleBusquedaAvanzadaSubmit = () => {
    // Mostrar notificación de filtros aplicados
    const filtrosActivos = [];
    if (filtros.busqueda) filtrosActivos.push(`Título: "${filtros.busqueda}"`);
    if (filtros.busquedaDescripcion) filtrosActivos.push(`Descripción: "${filtros.busquedaDescripcion}"`);
    if (filtros.busquedaAutor) filtrosActivos.push(`Autor: "${filtros.busquedaAutor}"`);
    
    if (filtrosActivos.length > 0) {
      showNotification(`Filtros de búsqueda aplicados: ${filtrosActivos.join(', ')}`, 'success');
    } else {
      showNotification('No hay parámetros de búsqueda específicos activos', 'info');
    }
    
    // Resetear a la primera página cuando se aplican nuevos filtros
    setPaginacion(prev => ({
      ...prev,
      paginaActual: 1
    }));
  };

  // Función para manejar etiquetas incluidas
  const handleEtiquetaIncluidaChange = (etiqueta) => {
    setFiltros(prev => {
      const nuevasEtiquetas = prev.etiquetas.includes(etiqueta)
        ? prev.etiquetas.filter(e => e !== etiqueta)
        : [...prev.etiquetas, etiqueta];
      return {
        ...prev,
        etiquetas: nuevasEtiquetas
      };
    });
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFiltros(FILTROS_DEFAULT);
    resetearEstadosBusqueda();
    
    // Limpiar la URL también
    window.history.replaceState({ filtros: FILTROS_DEFAULT }, '', window.location.pathname);
  };

  // Cambiar entre vistas
  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  // Remover una etiqueta específica
  const removeEtiqueta = (etiqueta) => {
    setFiltros(prev => ({
      ...prev,
      etiquetas: prev.etiquetas.filter(t => t !== etiqueta)
    }));
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtros.juego || filtros.etiquetas.length > 0 || filtros.busqueda ||
    filtros.edades_seleccionadas.length > 0 || filtros.popularidad || filtros.version || filtros.fechaDesde || filtros.fechaHasta ||
    filtros.descargasMin || filtros.descargasMax || filtros.valoracionesMin || filtros.valoracionesMax ||
    filtros.tamanoMin || filtros.tamanoMax || filtros.busquedaDescripcion || filtros.busquedaAutor || filtros.etiquetasExcluidas.length > 0;

  // Función para calcular fechas basadas en el período seleccionado
  const calcularFechasPeriodo = (periodo) => {
    const hoy = new Date();
    let fechaDesde = '';

    switch (periodo) {
      case '24h':
        fechaDesde = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        fechaDesde = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '14d':
        fechaDesde = new Date(hoy.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '28d':
        fechaDesde = new Date(hoy.getTime() - 28 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        fechaDesde = new Date(hoy.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        fechaDesde = '';
    }

    return {
      fechaDesde: fechaDesde ? fechaDesde.toISOString().split('T')[0] : '',
      fechaHasta: periodo === 'todo' ? '' : hoy.toISOString().split('T')[0]
    };
  };

  // Manejar cambio de período
  const handlePeriodoChange = (e) => {
    const nuevoPeriodo = e.target.value;
    const fechas = calcularFechasPeriodo(nuevoPeriodo);

    setFiltros(prev => ({
      ...prev,
      periodoTiempo: nuevoPeriodo,
      fechaDesde: fechas.fechaDesde,
      fechaHasta: fechas.fechaHasta
    }));
  };

  // Manejar cambio de página
  const handlePaginaChange = (nuevaPagina) => {
    setPaginacion(prev => ({
      ...prev,
      paginaActual: nuevaPagina
    }));
  };

  // Función helper para validar etiquetas disponibles usando useMemo para optimización
  const validarEtiquetaDisponible = useCallback((etiqueta, busqueda, esIncluir) => {
    // Filtrar por búsqueda solo si hay texto
    const coincideBusqueda = !busqueda || etiqueta.toLowerCase().includes(busqueda.toLowerCase());
    
    if (esIncluir) {
      // Para incluir: no debe estar ya incluida ni excluida
      const noEstaIncluida = !filtros.etiquetas.includes(etiqueta);
      const noEstaExcluida = !filtros.etiquetasExcluidas.includes(etiqueta);
      return coincideBusqueda && noEstaIncluida && noEstaExcluida;
    } else {
      // Para excluir: no debe estar ya excluida ni incluida
      const noEstaExcluida = !filtros.etiquetasExcluidas.includes(etiqueta);
      const noEstaIncluida = !filtros.etiquetas.includes(etiqueta);
      return coincideBusqueda && noEstaExcluida && noEstaIncluida;
    }
  }, [filtros.etiquetas, filtros.etiquetasExcluidas]);

  // Extraer datos únicos para los filtros usando useMemo para optimización
  const { juegosUnicos, categoriasUnicas, etiquetasUnicas, edades_seleccionadasUnicas, popularidadUnica, versionesUnicas } = useMemo(() => {
    if (!mods.length) return {
      juegosUnicos: [],
      categoriasUnicas: [],
      etiquetasUnicas: [],
      edades_seleccionadasUnicas: [],
      popularidadUnica: [],
      versionesUnicas: []
    };

    return {
      juegosUnicos: [...new Set(mods.map(mod => mod.juego.titulo))],
      categoriasUnicas: [...new Set(mods.map(mod => mod.categoria))],
      etiquetasUnicas: [...new Set(mods.flatMap(mod => mod.etiquetas.map(tag => tag.nombre)))],
      edades_seleccionadasUnicas: [...new Set(mods.map(mod => mod.edad_recomendada))],
      popularidadUnica: [...new Set(mods.map(mod => mod.popularidad))],
      versionesUnicas: [...new Set(mods.map(mod => mod.version))]
    };
  }, [mods]);

  // Función para alternar secciones
  const toggleSeccion = (seccion) => {
    setSecciones(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Función para editar mod
  const handleEditMod = useCallback((mod) => {
    navigate(`/mods/editar/${mod.id}`);
  }, [navigate]);

  // Función para eliminar mod (soft delete)
  const handleDeleteMod = useCallback(async (mod) => {
    setModToDelete(mod);
    setShowDeleteModal(true);
  }, []);

  // Función para confirmar la eliminación
  const confirmDelete = useCallback(async () => {
    if (!modToDelete) return;

    try {
      const response = await modService.softDeleteMod(modToDelete.id);
      
      if (response.status === 'success') {
        // Remover el mod de la lista local
        setMods(prevMods => prevMods.filter(m => m.id !== modToDelete.id));
        showNotification(`Mod "${modToDelete.titulo}" eliminado correctamente`, 'success');
      } else {
        throw new Error(response.message || 'Error al eliminar el mod');
      }
    } catch (err) {
      showNotification(err.message || 'Error al eliminar el mod', 'error');
    } finally {
      setShowDeleteModal(false);
      setModToDelete(null);
    }
  }, [modToDelete, showNotification]);

  // Función para cancelar la eliminación
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setModToDelete(null);
  }, []);

  // Optimización: Calcular una sola vez qué mods son propios del usuario
  const ownershipMap = useMemo(() => {
    if (!isAuthenticated || userLoading || modsFiltrados.length === 0) {
      return {};
    }
    return getOwnershipMap(modsFiltrados);
  }, [isAuthenticated, userLoading, modsFiltrados, getOwnershipMap]);

  return (
    <PageContainer>
      <div className="explorar-container">
        {/* Cabecera con título y contador de resultados */}
        <div className="explorar-header">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-custom-text">Explorar Mods</h1>
                <p className={`mt-1 text-custom-detail results-counter ${isUpdatingResults ? 'updating' : ''}`}>
                  {modsFiltrados.length} {modsFiltrados.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="explorar-content max-w-7xl mx-auto px-4 sm:px-6 lg-custom:px-8 pt-8 pb-16">
          <div className="flex flex-col lg-custom:flex-row gap-8">
            {/* Panel de filtros */}
            <div className={`lg-custom:w-80 flex-shrink-0 transition-all duration-300 ${showFilters ? 'block' : 'hidden'}`}>
              <div className="filters-panel rounded-lg">
                {/* Botón de mostrar/ocultar filtros */}
                <div className="flex justify-start items-center min-h-[60px] h-[60px] px-4 border-b border-custom-detail/10">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-button text-sm text-custom-text hover:text-custom-primary transition-colors bg-custom-bg/30 px-4 py-2 rounded-md flex items-center h-9 w-auto"
                  >
                    <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Esconder filtros
                  </button>
                </div>

                {/* Contenido del panel de filtros */}
                <div className="p-2">
                  {/* Sección JUEGO */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('juego')}
                    >
                      <span className="text-xs font-bold uppercase">Juego</span>
                      <svg className={`h-4 w-4 transition-transform ${secciones.juego ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {secciones.juego && (
                      <div className="filter-section-content p-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={busquedaJuegos}
                            onChange={(e) => {
                              setBusquedaJuegos(e.target.value);
                              setShowJuegosDropdown(true);
                            }}
                            onFocus={() => setShowJuegosDropdown(true)}
                            placeholder="Buscar juego..."
                            className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text text-sm"
                          />
                          {showJuegosDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-custom-card border border-custom-detail/20 rounded-md shadow-lg max-h-40 overflow-y-auto">
                              <button
                                onClick={() => clearJuegoSelection()}
                                className="w-full text-left px-3 py-2 text-sm text-custom-text hover:bg-custom-bg/50 transition-colors border-b border-custom-detail/10"
                              >
                                Todos los juegos
                              </button>
                              {juegosUnicos
                                .filter(juego => 
                                  juego.toLowerCase().includes(busquedaJuegos.toLowerCase())
                                )
                                .map(juego => (
                                  <button
                                    key={juego}
                                    onClick={() => selectJuego(juego)}
                                    className="w-full text-left px-3 py-2 text-sm text-custom-text hover:bg-custom-bg/50 transition-colors"
                                  >
                                    {juego}
                                  </button>
                                ))
                              }
                              {juegosUnicos.filter(juego => 
                                juego.toLowerCase().includes(busquedaJuegos.toLowerCase())
                              ).length === 0 && (
                                <div className="px-3 py-2 text-sm text-custom-detail">
                                  No se encontraron juegos
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección ETIQUETAS */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('etiquetas')}
                    >
                      <span className="text-xs font-bold uppercase">Etiquetas</span>
                      <svg className={`h-4 w-4 transition-transform ${secciones.etiquetas ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {secciones.etiquetas && (
                      <div className="filter-section-content p-2 space-y-2">
                        {/* Sección de incluir etiquetas */}
                        <div>
                          <label className="text-xs text-custom-detail">Incluye</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={busquedaEtiquetasIncluir}
                              onChange={(e) => {
                                setBusquedaEtiquetasIncluir(e.target.value);
                                setShowEtiquetasIncluirDropdown(true);
                              }}
                              onFocus={() => setShowEtiquetasIncluirDropdown(true)}
                              placeholder="Buscar etiquetas para incluir..."
                              className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text text-sm"
                            />
                            {showEtiquetasIncluirDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-custom-card border border-custom-detail/20 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {etiquetasUnicas
                                  .filter(etiqueta => validarEtiquetaDisponible(etiqueta, busquedaEtiquetasIncluir, true))
                                  .map(etiqueta => (
                                    <button
                                      key={etiqueta}
                                      onClick={() => {
                                        handleEtiquetaIncluidaChange(etiqueta);
                                        setBusquedaEtiquetasIncluir('');
                                        setShowEtiquetasIncluirDropdown(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-custom-text hover:bg-custom-bg/50 transition-colors"
                                    >
                                      {etiqueta}
                                    </button>
                                  ))
                                }
                                {etiquetasUnicas.filter(etiqueta => validarEtiquetaDisponible(etiqueta, busquedaEtiquetasIncluir, true)).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-custom-detail">
                                    No se encontraron etiquetas
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Mostrar etiquetas incluidas */}
                          {filtros.etiquetas.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {filtros.etiquetas.map(etiqueta => (
                                <div key={etiqueta} className="flex items-center justify-between bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                                  <span>Incluir: {etiqueta}</span>
                                  <button
                                    onClick={() => handleEtiquetaIncluidaChange(etiqueta)}
                                    className="text-green-400 hover:text-green-300 ml-2"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Sección de excluir etiquetas */}
                        <div>
                          <label className="text-xs text-custom-detail">Excluye</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={busquedaEtiquetasExcluir}
                              onChange={(e) => {
                                setBusquedaEtiquetasExcluir(e.target.value);
                                setShowEtiquetasExcluirDropdown(true);
                              }}
                              onFocus={() => setShowEtiquetasExcluirDropdown(true)}
                              placeholder="Buscar etiquetas para excluir..."
                              className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text text-sm"
                            />
                            {showEtiquetasExcluirDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-custom-card border border-custom-detail/20 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {etiquetasUnicas
                                  .filter(etiqueta => validarEtiquetaDisponible(etiqueta, busquedaEtiquetasExcluir, false))
                                  .map(etiqueta => (
                                    <button
                                      key={etiqueta}
                                      onClick={() => {
                                        handleEtiquetaExcluidaChange(etiqueta);
                                        setBusquedaEtiquetasExcluir('');
                                        setShowEtiquetasExcluirDropdown(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm text-custom-text hover:bg-custom-bg/50 transition-colors"
                                    >
                                      {etiqueta}
                                    </button>
                                  ))
                                }
                                {etiquetasUnicas.filter(etiqueta => validarEtiquetaDisponible(etiqueta, busquedaEtiquetasExcluir, false)).length === 0 && (
                                  <div className="px-3 py-2 text-sm text-custom-detail">
                                    No se encontraron etiquetas
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Mostrar etiquetas excluidas */}
                          {filtros.etiquetasExcluidas.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {filtros.etiquetasExcluidas.map(etiqueta => (
                                <div key={etiqueta} className="flex items-center justify-between bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">
                                  <span>Excluir: {etiqueta}</span>
                                  <button
                                    onClick={() => handleEtiquetaExcluidaChange(etiqueta)}
                                    className="text-red-400 hover:text-red-300 ml-2"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección PARAMETROS DE BÚSQUEDA */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('parametrosBusqueda')}
                    >
                      <span className="text-xs font-bold uppercase">Parámetros de búsqueda</span>
                      <div className="flex items-center">
                        <svg className={`h-4 w-4 transition-transform ${secciones.parametrosBusqueda ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {secciones.parametrosBusqueda && (
                      <div className="filter-section-content p-2 space-y-2">
                        <div>
                          <input
                            type="text"
                            name="busqueda"
                            value={filtros.busqueda}
                            onChange={handleFiltroChange}
                            placeholder="Título contiene..."
                            className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            name="busquedaDescripcion"
                            value={filtros.busquedaDescripcion}
                            onChange={handleFiltroChange}
                            placeholder="Descripción contiene..."
                            className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text"
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            name="busquedaAutor"
                            value={filtros.busquedaAutor}
                            onChange={handleFiltroChange}
                            placeholder="Autor contiene..."
                            className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text"
                          />
                        </div>

                        <button
                          onClick={handleBusquedaAvanzadaSubmit}
                          className="w-full bg-custom-primary hover:bg-custom-primary-hover text-white py-2 rounded-md transition-colors"
                        >
                          Aplicar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sección EDAD RECOMENDADA */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('opcionesContenido')}
                    >
                      <span className="text-xs font-bold uppercase">Edad Recomendada</span>
                      <svg className={`h-4 w-4 transition-transform ${secciones.opcionesContenido ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {secciones.opcionesContenido && (
                      <div className="filter-section-content p-2 space-y-2">
                        <div className="text-xs text-custom-detail mb-2">
                          Selecciona para ver mods adecuados para esa edad y rangos inferiores
                        </div>

                        {/* Opción por defecto - Sin filtro */}
                        <div className="classification-option bg-custom-bg/30 p-2 rounded-md">
                          <label className="custom-checkbox block">
                            <input
                              type="checkbox"
                              checked={filtros.edades_seleccionadas.length === 0}
                              onChange={() => setFiltros(prev => ({
                                ...prev,
                                edades_seleccionadas: []
                              }))}
                            />
                            <span className="checkmark"></span>
                            <span className="text-sm font-medium text-custom-text">Todos los mods</span>
                            <span className="text-xs text-custom-detail block ml-6">Mostrar contenido de todas las edades</span>
                          </label>
                        </div>

                        {/* Opciones de edad */}
                        <div className="mt-3 space-y-1.5">
                          <div className="classification-option">
                            <label className="custom-checkbox block">
                              <input
                                type="checkbox"
                                checked={filtros.edades_seleccionadas.includes('3')}
                                onChange={() => handleEdadChange('3')}
                              />
                              <span className="checkmark"></span>
                              <span className="text-sm text-custom-text">Para todos los públicos (3+)</span>
                            </label>
                          </div>

                          <div className="classification-option">
                            <label className="custom-checkbox block">
                              <input
                                type="checkbox"
                                checked={filtros.edades_seleccionadas.includes('7')}
                                onChange={() => handleEdadChange('7')}
                              />
                              <span className="checkmark"></span>
                              <span className="text-sm text-custom-text">7+ años</span>
                            </label>
                          </div>

                          <div className="classification-option">
                            <label className="custom-checkbox block">
                              <input
                                type="checkbox"
                                checked={filtros.edades_seleccionadas.includes('12')}
                                onChange={() => handleEdadChange('12')}
                              />
                              <span className="checkmark"></span>
                              <span className="text-sm text-custom-text">12+ años</span>
                            </label>
                          </div>

                          <div className="classification-option">
                            <label className="custom-checkbox block">
                              <input
                                type="checkbox"
                                checked={filtros.edades_seleccionadas.includes('16')}
                                onChange={() => handleEdadChange('16')}
                              />
                              <span className="checkmark"></span>
                              <span className="text-sm text-custom-text">16+ años</span>
                            </label>
                          </div>

                          <div className="classification-option">
                            <label className="custom-checkbox block">
                              <input
                                type="checkbox"
                                checked={filtros.edades_seleccionadas.includes('18')}
                                onChange={() => handleEdadChange('18')}
                              />
                              <span className="checkmark"></span>
                              <span className="text-sm text-custom-text">18+ años</span>
                            </label>
                          </div>
                        </div>

                        {/* Contenido sin etiqueta */}
                        <div className="classification-option mt-3 pt-3 border-t border-custom-detail/10">
                          <label className="custom-checkbox block">
                            <input
                              type="checkbox"
                              checked={filtros.edades_seleccionadas.includes('0')}
                              onChange={() => handleEdadChange('0')}
                            />
                            <span className="checkmark"></span>
                            <span className="text-sm text-custom-text">Solo sin clasificar</span>
                            <span className="text-xs text-custom-detail block ml-6">Mods sin etiqueta de edad</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección TAMAÑO DE ARCHIVO */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('tamanoArchivo')}
                    >
                      <span className="text-xs font-bold uppercase">Tamaño de archivo</span>
                      <svg className={`h-4 w-4 transition-transform ${secciones.tamanoArchivo ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {secciones.tamanoArchivo && (
                      <div className="filter-section-content p-2">
                        <div className="flex items-center justify-between space-x-2">
                          <div className="custom-select w-1/2">
                            <select
                              name="tamanoMin"
                              value={filtros.tamanoMin}
                              onChange={handleFiltroChange}
                              className="w-full"
                            >
                              <option value="">Sin mín.</option>
                              <option value="1">1 MB</option>
                              <option value="10">10 MB</option>
                              <option value="50">50 MB</option>
                              <option value="100">100 MB</option>
                            </select>
                          </div>
                          <div className="custom-select w-1/2">
                            <select
                              name="tamanoMax"
                              value={filtros.tamanoMax}
                              onChange={handleFiltroChange}
                              className="w-full"
                            >
                              <option value="">Sin máx.</option>
                              <option value="100">100 MB</option>
                              <option value="500">500 MB</option>
                              <option value="1024">1 GB</option>
                              <option value="5120">5 GB</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección DESCARGAS */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('descargas')}
                    >
                      <span className="text-xs font-bold uppercase">Descargas</span>
                      <svg className={`h-4 w-4 transition-transform ${secciones.descargas ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {secciones.descargas && (
                      <div className="filter-section-content p-2">
                        <div className="flex items-center justify-between space-x-2">
                          <div className="custom-select w-1/2">
                            <select
                              name="descargasMin"
                              value={filtros.descargasMin}
                              onChange={handleFiltroChange}
                              className="w-full"
                            >
                              <option value="">Sin mín.</option>
                              <option value="100">100+</option>
                              <option value="1000">1K+</option>
                              <option value="10000">10K+</option>
                              <option value="100000">100K+</option>
                            </select>
                          </div>
                          <div className="custom-select w-1/2">
                            <select
                              name="descargasMax"
                              value={filtros.descargasMax}
                              onChange={handleFiltroChange}
                              className="w-full"
                            >
                              <option value="">Sin máx.</option>
                              <option value="10000">10K</option>
                              <option value="100000">100K</option>
                              <option value="1000000">1M</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sección VALORACIONES */}
                  <div className="filter-section mb-2 border border-custom-detail/10 rounded-md">
                    <button
                      className="filter-section-header w-full p-2 flex justify-between items-center bg-custom-bg/50 text-custom-text"
                      onClick={() => toggleSeccion('valoraciones')}
                    >
                      <span className="text-xs font-bold uppercase">Valoraciones</span>
                      <svg className={`h-4 w-4 transition-transform ${secciones.valoraciones ? 'transform rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {secciones.valoraciones && (
                      <div className="filter-section-content p-2">
                        <div className="flex items-center justify-between space-x-2">
                          <div className="custom-select w-1/2">
                            <select
                              name="valoracionesMin"
                              value={filtros.valoracionesMin}
                              onChange={handleFiltroChange}
                              className="w-full"
                            >
                              <option value="">Sin mín.</option>
                              <option value="10">10+</option>
                              <option value="100">100+</option>
                              <option value="1000">1K+</option>
                            </select>
                          </div>
                          <div className="custom-select w-1/2">
                            <select
                              name="valoracionesMax"
                              value={filtros.valoracionesMax}
                              onChange={handleFiltroChange}
                              className="w-full"
                            >
                              <option value="">Sin máx.</option>
                              <option value="500">500</option>
                              <option value="1000">1K</option>
                              <option value="10000">10K</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              {/* Barra de ordenamiento */}
              <div className="sort-bar rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-4 min-h-[60px]">
                  {/* Botón de mostrar filtros (si están ocultos) */}
                  {!showFilters && (
                    <div className="flex items-center h-9">
                      <button
                        onClick={() => setShowFilters(true)}
                        className="filter-button text-sm text-custom-text hover:text-custom-primary transition-colors bg-custom-bg/30 px-4 py-2 rounded-md flex items-center justify-center sm:justify-start h-9 w-full sm:w-auto"
                      >
                        <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                        Mostrar filtros
                      </button>
                    </div>
                  )}

                  {/* Controles de ordenamiento y vista */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 w-full">
                    {/* Controles de ordenamiento */}
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      {/* Filtro de período */}
                      <div className="custom-select text-sm flex-1 sm:flex-none min-w-[140px]">
                        <select
                          name="periodoTiempo"
                          value={filtros.periodoTiempo}
                          onChange={handlePeriodoChange}
                          className="h-9 px-2 py-1 w-full"
                        >
                          <option value="todo">Todo el tiempo</option>
                          <option value="24h">Últimas 24 horas</option>
                          <option value="7d">Últimos 7 días</option>
                          <option value="14d">Últimos 14 días</option>
                          <option value="28d">Últimos 28 días</option>
                          <option value="1y">Último año</option>
                        </select>
                      </div>

                      {/* Tipo de orden */}
                      <div className="custom-select text-sm flex-1 sm:flex-none min-w-[120px]">
                        <select
                          name="ordenarPor"
                          value={filtros.ordenarPor}
                          onChange={handleFiltroChange}
                          className="h-9 px-2 py-1 w-full"
                        >
                          <option value="recientes">Fecha</option>
                          <option value="descargas">Descargas</option>
                          <option value="valoracion">Valoración</option>
                          <option value="alfabetico">Alfabético</option>
                          <option value="popularidad">Popularidad</option>
                        </select>
                      </div>

                      {/* Dirección de orden */}
                      <div className="custom-select text-sm flex-1 sm:flex-none min-w-[120px]">
                        <select
                          name="orden"
                          value={filtros.orden}
                          onChange={handleFiltroChange}
                          className="h-9 px-2 py-1 w-full"
                        >
                          <option value="desc">Descendente</option>
                          <option value="asc">Ascendente</option>
                        </select>
                      </div>
                    </div>

                    {/* Selector de vista - alineado a la derecha */}
                    <div className="view-selector text-sm ml-auto">
                      <button
                        onClick={() => cambiarVista('compacta')}
                        className={`px-3 py-2 ${vistaActual === 'compacta' ? 'active' : ''}`}
                      >
                        <svg className="h-4 w-4 view-icon-margin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span className="view-text">Compacta</span>
                      </button>
                      <button
                        onClick={() => cambiarVista('lista')}
                        className={`px-3 py-2 ${vistaActual === 'lista' ? 'active' : ''}`}
                      >
                        <svg className="h-4 w-4 view-icon-margin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span className="view-text">Lista</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros activos */}
              {hayFiltrosActivos && (
                <div className="filtros-activos mb-6">
                  {filtros.busqueda && (
                    <div className="filtro-tag">
                      <span className="tipo">Búsqueda:</span> {filtros.busqueda}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, busqueda: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.juego && (
                    <div className="filtro-tag">
                      <span className="tipo">Juego:</span> {filtros.juego}
                      <span
                        className="remove"
                        onClick={() => removeJuegoFilter()}
                      >×</span>
                    </div>
                  )}

                  {filtros.etiquetas.map(etiqueta => (
                    <div key={etiqueta} className="filtro-tag">
                      <span className="tipo">Incluir:</span> {etiqueta}
                      <span
                        className="remove"
                        onClick={() => handleEtiquetaIncluidaChange(etiqueta)}
                      >×</span>
                    </div>
                  ))}

                  {filtros.edades_seleccionadas.length > 0 && (
                    <div className="filtro-tag">
                      <span className="tipo">Edad recomendada:</span>
                      {filtros.edades_seleccionadas.map(edad =>
                        edad === '0' ? 'Sin clasificar' : `${edad}+`
                      ).join(', ')}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, edades_seleccionadas: [] }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.popularidad && (
                    <div className="filtro-tag">
                      <span className="tipo">Popularidad:</span> {filtros.popularidad}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, popularidad: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.version && (
                    <div className="filtro-tag">
                      <span className="tipo">Versión:</span> {filtros.version}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, version: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaDesde && filtros.periodoTiempo === '24h' && (
                    <div className="filtro-tag bg-blue-500/20 text-blue-400 border-blue-400/30">
                      <span className="tipo">📅 Últimas 24 horas</span>
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: '', fechaHasta: '', periodoTiempo: 'todo' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaDesde && filtros.periodoTiempo === '7d' && (
                    <div className="filtro-tag bg-green-500/20 text-green-400 border-green-400/30">
                      <span className="tipo">📅 Últimos 7 días</span>
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: '', fechaHasta: '', periodoTiempo: 'todo' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaDesde && filtros.periodoTiempo === '14d' && (
                    <div className="filtro-tag bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
                      <span className="tipo">📅 Últimos 14 días</span>
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: '', fechaHasta: '', periodoTiempo: 'todo' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaDesde && filtros.periodoTiempo === '28d' && (
                    <div className="filtro-tag bg-purple-500/20 text-purple-400 border-purple-400/30">
                      <span className="tipo">📅 Últimos 28 días</span>
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: '', fechaHasta: '', periodoTiempo: 'todo' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaDesde && filtros.periodoTiempo === '1y' && (
                    <div className="filtro-tag bg-orange-500/20 text-orange-400 border-orange-400/30">
                      <span className="tipo">📅 Último año</span>
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: '', fechaHasta: '', periodoTiempo: 'todo' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaDesde && !['24h', '7d', '14d', '28d', '1y'].includes(filtros.periodoTiempo) && (
                    <div className="filtro-tag">
                      <span className="tipo">Desde:</span> {new Date(filtros.fechaDesde).toLocaleDateString()}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.fechaHasta && !['24h', '7d', '14d', '28d', '1y'].includes(filtros.periodoTiempo) && (
                    <div className="filtro-tag">
                      <span className="tipo">Hasta:</span> {new Date(filtros.fechaHasta).toLocaleDateString()}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, fechaHasta: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.descargasMin && (
                    <div className="filtro-tag">
                      <span className="tipo">Descargas mín:</span> {filtros.descargasMin}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, descargasMin: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.descargasMax && (
                    <div className="filtro-tag">
                      <span className="tipo">Descargas máx:</span> {filtros.descargasMax}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, descargasMax: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.valoracionesMin && (
                    <div className="filtro-tag">
                      <span className="tipo">Valoraciones mín:</span> {filtros.valoracionesMin}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, valoracionesMin: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.valoracionesMax && (
                    <div className="filtro-tag">
                      <span className="tipo">Valoraciones máx:</span> {filtros.valoracionesMax}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, valoracionesMax: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.tamanoMin && (
                    <div className="filtro-tag">
                      <span className="tipo">Tamaño mín:</span> {filtros.tamanoMin} MB
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, tamanoMin: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.tamanoMax && (
                    <div className="filtro-tag">
                      <span className="tipo">Tamaño máx:</span> {filtros.tamanoMax} MB
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, tamanoMax: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.busquedaDescripcion && (
                    <div className="filtro-tag">
                      <span className="tipo">Descripción:</span> {filtros.busquedaDescripcion}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, busquedaDescripcion: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.busquedaAutor && (
                    <div className="filtro-tag">
                      <span className="tipo">Autor:</span> {filtros.busquedaAutor}
                      <span
                        className="remove"
                        onClick={() => setFiltros(prev => ({ ...prev, busquedaAutor: '' }))}
                      >×</span>
                    </div>
                  )}

                  {filtros.etiquetasExcluidas.map(etiqueta => (
                    <div key={`excluida-${etiqueta}`} className="filtro-tag bg-red-500/20 text-red-400 border-red-400/30">
                      <span className="tipo">Excluir:</span> {etiqueta}
                      <span
                        className="remove"
                        onClick={() => handleEtiquetaExcluidaChange(etiqueta)}
                      >×</span>
                    </div>
                  ))}

                  <button
                    onClick={handleClearFilters}
                    className="filtro-tag bg-custom-primary/20 hover:bg-custom-primary/30"
                  >
                    <span className="tipo">Limpiar</span> todos los filtros
                  </button>
                </div>
              )}

              {/* Estado de carga y error */}
              {cargando ? (
                <div className="flex justify-center items-center py-12">
                  <div className="loading-spinner h-12 w-12 border-b-2 border-custom-primary rounded-full"></div>
                </div>
              ) : error ? (
                <div className="empty-state">
                  <svg className="mx-auto h-12 w-12 text-custom-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-custom-text">Error al cargar los mods</h3>
                  <p className="mt-1 text-custom-detail">{error}</p>
                  <button
                    onClick={() => cargarMods()}
                    className="mt-4 px-4 py-2 bg-custom-primary text-white rounded-md hover:bg-custom-primary-hover transition-colors"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : (
                <>
                  {modsFiltrados.length > 0 ? (
                    <>
                      {/* Vista compacta (usando ModCards) */}
                      {vistaActual === 'compacta' && (
                        <div className="mods-grid">
                          {modsEnPagina.map((mod) => {
                            const isOwnerOfMod = ownershipMap[mod.id] || false;
                            return (
                              <ModCard
                                key={mod.id}
                                mod={mod}
                                isOwner={isOwnerOfMod}
                                showSaveButton={true}
                                onEdit={isOwnerOfMod ? () => handleEditMod(mod) : undefined}
                                onDelete={isOwnerOfMod ? () => handleDeleteMod(mod) : undefined}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Vista de lista */}
                      {vistaActual === 'lista' && (
                        <ModList
                          mods={modsEnPagina.map(mod => ({
                            ...mod,
                            isOwner: ownershipMap[mod.id] || false
                          }))}
                          showSaveButton={true}
                          onEdit={handleEditMod}
                          onDelete={handleDeleteMod}
                        />
                      )}

                      {/* Paginación */}
                      {totalPaginas > 1 && (
                        <div className="pagination-container mt-8 mb-8 flex justify-center items-center gap-2">
                          <button
                            onClick={() => handlePaginaChange(1)}
                            disabled={paginacion.paginaActual === 1}
                            className="pagination-button"
                          >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>

                          <button
                            onClick={() => handlePaginaChange(paginacion.paginaActual - 1)}
                            disabled={paginacion.paginaActual === 1}
                            className="pagination-button"
                          >
                            Anterior
                          </button>

                          <span className="text-custom-text">
                            Página {paginacion.paginaActual} de {totalPaginas}
                          </span>

                          <button
                            onClick={() => handlePaginaChange(paginacion.paginaActual + 1)}
                            disabled={paginacion.paginaActual === totalPaginas}
                            className="pagination-button"
                          >
                            Siguiente
                          </button>

                          <button
                            onClick={() => handlePaginaChange(totalPaginas)}
                            disabled={paginacion.paginaActual === totalPaginas}
                            className="pagination-button"
                          >
                            <svg className="h-5 w-5 transform rotate-180" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="empty-state">
                      <svg className="mx-auto h-12 w-12 text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-custom-text">No se encontraron mods</h3>
                      <p className="mt-1 text-custom-detail">Prueba a cambiar los filtros de búsqueda</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <ModDeleteConfirmationModal
          isOpen={showDeleteModal}
          modTitle={modToDelete?.titulo || ''}
          message="¿Estás seguro de que quieres desactivar este mod? Podrá ser restaurado posteriormente."
          confirmText="Desactivar"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDangerous={false}
        />
      )}
    </PageContainer>
  );
};

export default ExplorarMods; 