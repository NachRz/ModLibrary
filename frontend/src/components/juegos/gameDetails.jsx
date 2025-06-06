import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageContainer from '../layout/PageContainer';
import ModCard from '../common/Cards/ModCard';
import ModDeleteConfirmationModal from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import EditModAdmin from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/EditModAdmin';
import Breadcrumb from '../common/Breadcrumb/Breadcrumb';
import gameService from '../../services/api/gameService';
import modService from '../../services/api/modService';
import useUserModsStatus from '../../hooks/useUserModsStatus';
import { useNotification } from '../../context/NotificationContext';
import { useFavorite } from '../../hooks/useFavorites';
import '../../assets/styles/components/juegos/gameDetails.css';

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // Estados
  const [juego, setJuego] = useState(null);
  const [mods, setMods] = useState([]);
  const [cargandoJuego, setCargandoJuego] = useState(true);
  const [cargandoMods, setCargandoMods] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMods, setFiltroMods] = useState('todos');
  const [filtroTiempo, setFiltroTiempo] = useState('todo');
  const [pestañaActiva, setPestañaActiva] = useState('nuevo');
  
  // Estados para el modal de eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modToDelete, setModToDelete] = useState(null);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [modToEdit, setModToEdit] = useState(null);
  
  // Hook para manejar favoritos
  const [esFavorito, toggleFavorito, cargandoFavorito, errorFavorito, mensaje] = useFavorite(parseInt(id));
  
  // Hook para verificar propiedad de mods
  const { 
    isAuthenticated, 
    getOwnershipMap, 
    loading: userLoading 
  } = useUserModsStatus();

  // Mostrar notificaciones cuando cambien los mensajes del hook de favoritos
  useEffect(() => {
    if (mensaje) {
      showNotification(mensaje, 'success');
    }
  }, [mensaje, showNotification]);

  useEffect(() => {
    if (errorFavorito) {
      showNotification(errorFavorito, 'error');
    }
  }, [errorFavorito, showNotification]);

  // Cargar mods del juego
  const cargarMods = useCallback(async () => {
    if (!juego?.id) return;
    
    try {
      setCargandoMods(true);
      
      const response = await modService.getModsByGame(juego.id);
      if (response.status === 'success') {
        setMods(response.data.map(mod => ({
          id: mod.id,
          titulo: mod.titulo,
          imagen: mod.imagen_banner ? `http://localhost:8000/storage/${mod.imagen_banner}` : '/images/mod-placeholder.jpg',
          juego: { titulo: mod.juego?.titulo || 'Juego desconocido' },
          categoria: mod.etiquetas?.[0]?.nombre || 'General',
          etiquetas: mod.etiquetas || [],
          autor: mod.creador?.nome || 'Anónimo',
          creador_id: mod.creador_id,
          descargas: mod.estadisticas?.total_descargas || mod.total_descargas || 0,
          valoracion: mod.estadisticas?.valoracion_media || 0,
          numValoraciones: mod.estadisticas?.total_valoraciones || 0,
          descripcion: mod.descripcion || '',
          estado: mod.estado || 'publicado',
          created_at: mod.created_at,
          updated_at: mod.updated_at,
          fecha_creacion: mod.fecha_creacion,
          fecha_actualizacion: mod.fecha_actualizacion
        })));
      }
    } catch (err) {
      console.error('Error al cargar los mods:', err);
      // No mostramos error si no hay mods, es normal
      setMods([]);
    } finally {
      setCargandoMods(false);
    }
  }, [juego?.id]);

  // Cargar datos del juego
  useEffect(() => {
    const cargarJuego = async () => {
      try {
        setCargandoJuego(true);
        setError(null);
        
        const response = await gameService.getGameById(parseInt(id));
        setJuego(response);
      } catch (err) {
        setError('Error al cargar la información del juego');
        showNotification('Error al cargar el juego', 'error');
        console.error('Error al cargar el juego:', err);
      } finally {
        setCargandoJuego(false);
      }
    };

    if (id) {
      cargarJuego();
    }
  }, [id, showNotification]);

  // useEffect para cargar mods cuando cambia el juego
  useEffect(() => {
    cargarMods();
  }, [cargarMods]);

  // Filtrar y ordenar mods
  const modsFiltrados = mods
    .filter(mod => {
      // Filtro por tiempo
      if (filtroTiempo !== 'todo') {
        const fechaMod = new Date(mod.created_at || mod.fecha_creacion);
        const ahora = new Date();
        const diferencia = ahora - fechaMod;
        
        switch (filtroTiempo) {
          case 'hoy':
            if (diferencia > 24 * 60 * 60 * 1000) return false;
            break;
          case 'semana':
            if (diferencia > 7 * 24 * 60 * 60 * 1000) return false;
            break;
          case 'mes':
            if (diferencia > 30 * 24 * 60 * 60 * 1000) return false;
            break;
          case 'año':
            if (diferencia > 365 * 24 * 60 * 60 * 1000) return false;
            break;
        }
      }
      
      // Filtro por categoría
      if (filtroMods === 'todos') return true;
      return mod.categoria.toLowerCase() === filtroMods.toLowerCase();
    })
    .sort((a, b) => {
      switch (pestañaActiva) {
        case 'nuevo':
          // Ordenar por fecha de creación (más recientes primero)
          return new Date(b.created_at || b.fecha_creacion || 0) - new Date(a.created_at || a.fecha_creacion || 0);
        case 'actualizado':
          // Ordenar por fecha de actualización (más recientes primero)
          return new Date(b.updated_at || b.fecha_actualizacion || 0) - new Date(a.updated_at || a.fecha_actualizacion || 0);
        case 'tendencias':
          // Ordenar por descargas (más descargados primero)
          return b.descargas - a.descargas;
        case 'popular':
          // Ordenar por valoración (mejor valorados primero)
          return b.valoracion - a.valoracion;
        case 'sorpresa':
          // Orden aleatorio
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

  // Obtener categorías únicas de los mods
  const categorias = ['todos', ...new Set(mods.map(mod => mod.categoria))];

  // Función para mostrar estrellas según la valoración
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-star-${i}`} className="h-4 w-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  // Funciones para editar y eliminar mods
  const handleEditMod = (mod) => {
    setModToEdit(mod);
    setShowEditModal(true);
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setModToEdit(null);
  };

  // Función para guardar cambios desde el modal de edición
  const handleSaveModFromModal = (updatedMod) => {
    console.log('Mod actualizado desde modal:', updatedMod);
    
    // Actualizar el mod en la lista local
    setMods(prevMods => 
      prevMods.map(mod => 
        mod.id === updatedMod.id ? {
          ...mod, // Mantener los campos existentes
          ...updatedMod, // Sobrescribir con los campos actualizados
          // Asegurar que los campos necesarios estén presentes
          titulo: updatedMod.titulo || updatedMod.nombre || mod.titulo,
          imagen: updatedMod.imagen_banner ? `http://localhost:8000/storage/${updatedMod.imagen_banner}` : mod.imagen,
          etiquetas: updatedMod.etiquetas || mod.etiquetas,
          estado: updatedMod.estado || mod.estado,
          descripcion: updatedMod.descripcion || mod.descripcion,
          fecha_actualizacion: new Date().toISOString()
        } : mod
      )
    );
    
    // Cerrar el modal
    setShowEditModal(false);
    setModToEdit(null);
    
    // Mostrar notificación de éxito
    showNotification(`Mod "${updatedMod.titulo || updatedMod.nombre}" actualizado exitosamente`, 'success');
  };

  const handleDeleteMod = (mod) => {
    setModToDelete(mod);
    setShowDeleteModal(true);
  };

  // Funciones para el modal de eliminar
  const confirmDelete = async () => {
    if (!modToDelete) return;
    
    try {
      await modService.deleteMod(modToDelete.id);
      showNotification('Mod eliminado correctamente', 'success');
      // Recargar los mods después de eliminar
      if (juego?.id) {
        cargarMods();
      }
      setShowDeleteModal(false);
      setModToDelete(null);
    } catch (error) {
      console.error('Error al eliminar el mod:', error);
      showNotification('Error al eliminar el mod', 'error');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setModToDelete(null);
  };

  // Obtener mapa de propiedad para todos los mods
  const ownershipMap = getOwnershipMap(mods);

  if (cargandoJuego) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary mb-4"></div>
            <p className="text-custom-detail">Cargando información del juego...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !juego) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
              <p>{error || 'Juego no encontrado'}</p>
            </div>
            <Link 
              to="/juegos" 
              className="bg-custom-primary hover:bg-custom-primary-hover text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Volver a juegos
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-custom-bg text-white pb-16">
      {/* Header del juego */}
      <div className="relative">
        {/* Imagen de fondo con overlay */}
        <div 
          className="h-[28rem] bg-cover relative"
          style={{ 
            backgroundImage: `url(${juego.imagen_fondo || juego.background_image})`,
            backgroundPosition: 'center 25%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-custom-bg via-custom-bg/60 to-transparent"></div>
          
          {/* Breadcrumbs */}
          <div className="absolute top-4 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
              <Breadcrumb
                items={[
                  { label: 'Juegos', path: '/juegos' },
                  { label: juego.titulo || juego.title, path: `/juegos/${id}` },
                ]}
              />
            </div>
          </div>
        </div>
        
        {/* Contenido del header */}
        <div className="max-w-7xl mx-auto px-4 relative -mt-72">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Imagen del juego */}
            <div className="flex-shrink-0">
              <img 
                src={juego.imagen_fondo || juego.background_image} 
                alt={juego.titulo || juego.title}
                className="w-48 h-64 object-cover rounded-lg shadow-2xl border-2 border-gray-700"
              />
            </div>
            
            {/* Información del juego */}
            <div className="flex-1 pt-8">
              <div className="flex items-start justify-between mb-4">
                <h1 
                  className="text-4xl md:text-5xl font-bold text-white"
                  data-game-name={juego.titulo || juego.title}
                >
                  {juego.titulo || juego.title}
                </h1>
                
                {/* Botón de favoritos */}
                <button
                  onClick={toggleFavorito}
                  disabled={cargandoFavorito}
                  className={`ml-4 p-3 rounded-full transition-all duration-300 ${
                    esFavorito 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-red-400'
                  } ${cargandoFavorito ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                  title={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  {cargandoFavorito ? (
                    <div className="animate-spin h-6 w-6">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                    </div>
                  ) : (
                    <svg 
                      className="h-6 w-6" 
                      fill={esFavorito ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={esFavorito ? 0 : 2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Estadísticas */}
              <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
                <div className="flex items-center">
                  {renderStars(juego.rating || 0)}
                  <span className="ml-2 text-lg">
                    {juego.rating ? parseFloat(juego.rating).toFixed(1) : '0.0'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{juego.total_mods || juego.mods_totales || 0} mods</span>
                </div>
                
                {juego.fecha_lanzamiento && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(juego.fecha_lanzamiento).getFullYear()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Header con título y Ver todo */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg className="h-6 w-6 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Mods
          </h2>
          <button className="text-orange-500 hover:text-orange-400 font-medium text-sm transition-colors">
            Ver todo
          </button>
        </div>

        {/* Filtros de pestañas */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setPestañaActiva('nuevo')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pestañaActiva === 'nuevo'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>

          <button
            onClick={() => setPestañaActiva('actualizado')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pestañaActiva === 'actualizado'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizado
          </button>

          <button
            onClick={() => setPestañaActiva('tendencias')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pestañaActiva === 'tendencias'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Tendencias
          </button>

          <button
            onClick={() => setPestañaActiva('popular')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pestañaActiva === 'popular'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Popular
          </button>

          <button
            onClick={() => setPestañaActiva('sorpresa')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              pestañaActiva === 'sorpresa'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            Sorpresa
          </button>

          {/* Filtro de tiempo */}
          <select 
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ml-auto"
          >
            <option value="todo">Todo el tiempo</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="año">Este año</option>
          </select>
        </div>
      </div>

      {/* Sección de Mods */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Información de resultados */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm">
            {modsFiltrados.length} {modsFiltrados.length === 1 ? 'mod encontrado' : 'mods encontrados'}
            {filtroTiempo !== 'todo' && ` en ${
              filtroTiempo === 'hoy' ? 'hoy' :
              filtroTiempo === 'semana' ? 'esta semana' :
              filtroTiempo === 'mes' ? 'este mes' :
              filtroTiempo === 'año' ? 'este año' : ''
            }`}
          </p>
        </div>

        {/* Grid de Mods */}
        {cargandoMods ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-400">Cargando mods...</p>
          </div>
        ) : modsFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modsFiltrados.map(mod => {
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
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No hay mods disponibles</h3>
              <p className="text-gray-400 mb-4">
                {filtroMods === 'todos' 
                  ? 'Aún no hay mods creados para este juego.' 
                  : `No hay mods en la categoría "${filtroMods}".`
                }
              </p>
              {filtroMods !== 'todos' && (
                <button 
                  onClick={() => setFiltroMods('todos')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Ver todos los mods
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de eliminación */}
      {showDeleteModal && (
        <ModDeleteConfirmationModal
          isOpen={showDeleteModal}
          modTitle={modToDelete?.titulo || ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          message="¿Estás seguro de que quieres desactivar este mod? Podrá ser restaurado posteriormente."
          confirmText="Desactivar"
          isDangerous={false}
        />
      )}

      {/* Modal de edición */}
      {showEditModal && modToEdit && (
        <EditModAdmin
          mod={modToEdit}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveModFromModal}
        />
      )}
    </div>
  );
};

export default GameDetails;
