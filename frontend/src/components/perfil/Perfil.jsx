import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserProfileEditModal from '../dashboard/modals/UserProfileEditModal';
import userService from '../../services/api/userService';
import modService from '../../services/api/modService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faPlus, faBookmark, faStar, faChevronDown, faDownload } from '@fortawesome/free-solid-svg-icons';
import PageContainer from '../layout/PageContainer';
import ModCard from '../common/Cards/ModCard';
import ModDeleteConfirmationModal from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import EditModAdmin from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/EditModAdmin';

// Componente para mostrar las tarjetas de estadísticas
const StatCard = ({ title, value, icon, change, color }) => {
  const cardContent = (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-5 text-white transform hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-white/20 rounded-lg">
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-3">
          <span className="text-white/80 text-xs font-medium">{change}</span>
        </div>
      )}
    </div>
  );

  return cardContent;
};

const Perfil = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const { userId } = useParams(); // Obtener el userId de la URL si existe
  
  // Debug logs
  console.log('Perfil component - userId:', userId, 'authLoading:', authLoading, 'user:', user);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    modsCreated: 0,
    misJuegos: 0,
    modsGuardados: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sobre-mi');
  const [userMods, setUserMods] = useState([]);
  const [filteredMods, setFilteredMods] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [modsLoading, setModsLoading] = useState(false);
  
  // Estado para el usuario público (cuando se ve el perfil de otro usuario)
  const [publicUser, setPublicUser] = useState(null);
  const [publicUserLoading, setPublicUserLoading] = useState(false);
  
  // Estados para filtros
  const [selectedGame, setSelectedGame] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para modales de mod
  const [selectedModForEdit, setSelectedModForEdit] = useState(null);
  const [selectedModForDelete, setSelectedModForDelete] = useState(null);
  const [isEditModModalOpen, setIsEditModModalOpen] = useState(false);
  const [isDeleteModModalOpen, setIsDeleteModModalOpen] = useState(false);
  const [deletingMod, setDeletingMod] = useState(false);
  
  const navigate = useNavigate();

  // Determinar si es un perfil público o el perfil propio
  const isPublicProfile = !!userId;
  const currentUser = isPublicProfile ? publicUser : user;

  // Función para formatear fecha de registro
  const formatearFechaRegistro = (fechaString) => {
    console.log('formatearFechaRegistro recibió:', fechaString, typeof fechaString);
    
    if (!fechaString) {
      console.log('No hay fecha, usando fecha actual como fallback');
      // Si no hay fecha, usar fecha actual como fallback
      const hoy = new Date();
      return hoy.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    try {
      let fecha;
      
      // Manejar diferentes formatos de fecha
      if (typeof fechaString === 'string') {
        // Si es una fecha ISO (YYYY-MM-DD HH:MM:SS o YYYY-MM-DDTHH:MM:SS)
        if (fechaString.includes('T') || fechaString.includes(' ')) {
          fecha = new Date(fechaString);
        } else {
          // Si es solo una fecha (YYYY-MM-DD)
          fecha = new Date(fechaString + 'T00:00:00');
        }
      } else {
        // Si es un timestamp u otro formato
        fecha = new Date(fechaString);
      }
      
      // Verificar si la fecha es válida
      if (isNaN(fecha.getTime())) {
        console.log('Fecha inválida, usando fecha actual como fallback');
        const hoy = new Date();
        return hoy.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      // Formatear en español
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      console.log('Fecha formateada exitosamente:', fechaFormateada);
      return fechaFormateada;
      
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      // Fallback a fecha actual en caso de error
      const hoy = new Date();
      return hoy.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Datos del usuario con valores por defecto
  const userData = {
    id: currentUser?.id || 0,
    username: currentUser?.nome || 'Usuario',
    nome: currentUser?.nome || 'Usuario',
    correo: currentUser?.correo || '',
    nombre: currentUser?.nombre || '',
    apelidos: currentUser?.apelidos || '',
    sobre_mi: currentUser?.sobre_mi || '',
    rol: currentUser?.rol || 'usuario',
    foto_perfil: currentUser?.foto_perfil || null,
    fechaRegistro: formatearFechaRegistro(
      currentUser?.created_at || 
      currentUser?.updated_at || 
      currentUser?.fecha_registro || 
      currentUser?.fecha_creacion
    ),
    ultimaActividad: 'Ahora',
    ...userStats
  };

  // Debug para ver qué fechas están disponibles
  console.log('Debug fechas usuario:', {
    created_at: currentUser?.created_at,
    updated_at: currentUser?.updated_at,
    fecha_registro: currentUser?.fecha_registro,
    fecha_creacion: currentUser?.fecha_creacion,
    usuarioCompleto: currentUser
  });

  // Verificar si es el perfil propio
  const isOwnProfile = !isPublicProfile && user && userData && user.id === userData.id;

  // Cargar datos del usuario público si es necesario
  useEffect(() => {
    const loadPublicUser = async () => {
      if (isPublicProfile && userId) {
        try {
          setPublicUserLoading(true);
          setLoading(true);
          
          console.log('Cargando perfil público para usuario ID:', userId);
          
          // Obtener mods del usuario para extraer información del creador
          const modsResponse = await modService.getModsByCreatorId(userId);
          
          console.log('Respuesta de mods:', modsResponse);
          
          if (modsResponse.status === 'success' && modsResponse.data.length > 0) {
            // Extraer información del creador del primer mod
            const creadorData = modsResponse.data[0].creador;
            console.log('Datos del creador:', creadorData);
            
            // Intentar obtener fecha de registro desde diferentes campos
            const fechaRegistro = creadorData.created_at || 
                                  creadorData.updated_at || 
                                  creadorData.fecha_registro || 
                                  creadorData.fecha_creacion ||
                                  new Date().toISOString(); // Fallback a fecha actual
            
            console.log('Fecha de registro encontrada:', fechaRegistro);
            
            setPublicUser({
              ...creadorData,
              created_at: fechaRegistro
            });
            
            // Calcular rating promedio de todos los mods del usuario
            const totalMods = modsResponse.data.length;
            const totalRating = modsResponse.data.reduce((sum, mod) => {
              return sum + (mod.estadisticas?.valoracion_media || 0);
            }, 0);
            const averageRating = totalMods > 0 ? totalRating / totalMods : 0;
            
            // Calcular total de descargas de todos los mods
            const totalDownloads = modsResponse.data.reduce((sum, mod) => {
              return sum + (mod.estadisticas?.total_descargas || mod.total_descargas || 0);
            }, 0);
            
            // Para perfiles públicos, establecemos estadísticas basadas en los mods reales
            setUserStats({
              modsCreated: totalMods,
              misJuegos: 0, // No mostraremos juegos favoritos para perfiles públicos
              modsGuardados: 0, // No mostraremos mods guardados para perfiles públicos
              rating: averageRating,
              totalDownloads: totalDownloads
            });
            
            console.log('Perfil público cargado exitosamente:', {
              usuario: creadorData.nome,
              mods: totalMods,
              rating: averageRating,
              descargas: totalDownloads,
              fechaRegistro: fechaRegistro
            });
          } else {
            // Si no hay mods, crear un usuario básico con solo el ID
            console.log('No se encontraron mods para el usuario, creando perfil básico');
            
            const fechaActual = new Date().toISOString();
            
            setPublicUser({
              id: parseInt(userId),
              nome: `Usuario ${userId}`,
              correo: '',
              nombre: '',
              apelidos: '',
              sobre_mi: 'Este usuario no ha creado mods aún.',
              rol: 'usuario',
              foto_perfil: null,
              created_at: fechaActual
            });
            
            setUserStats({
              modsCreated: 0,
              misJuegos: 0,
              modsGuardados: 0,
              rating: 0,
              totalDownloads: 0
            });
          }
        } catch (error) {
          console.error('Error al cargar perfil público:', error);
          // Crear perfil básico aún con error
          const fechaActual = new Date().toISOString();
          
          setPublicUser({
            id: parseInt(userId),
            nome: `Usuario ${userId}`,
            correo: '',
            nombre: '',
            apelidos: '',
            sobre_mi: 'No se pudo cargar la información de este usuario.',
            rol: 'usuario',
            foto_perfil: null,
            created_at: fechaActual
          });
          
          setUserStats({
            modsCreated: 0,
            misJuegos: 0,
            modsGuardados: 0,
            rating: 0,
            totalDownloads: 0
          });
        } finally {
          setPublicUserLoading(false);
          setLoading(false);
        }
      }
    };

    loadPublicUser();
  }, [userId, isPublicProfile]);

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      // Para perfiles públicos, las estadísticas ya se cargan en loadPublicUser
      if (isPublicProfile) {
        return;
      }
      
      // Solo cargar estadísticas si el usuario está disponible y no estamos en carga de autenticación
      if (currentUser && !authLoading) {
        try {
          setLoading(true);
          
          // Cargar estadísticas del usuario, juegos favoritos y mods guardados en paralelo
          const [statsResponse, gamesResponse, savedModsResponse] = await Promise.all([
            userService.getUserStats(),
            userService.getFavoriteGames(),
            modService.getSavedMods()
          ]);
          
          const stats = statsResponse.data || {};
          const favoriteGames = gamesResponse.data || [];
          const savedMods = savedModsResponse.data || [];
          
          setUserStats({
            modsCreated: stats.modsCreated || 0,
            misJuegos: favoriteGames.length || 0,
            modsGuardados: savedMods.length || 0,
            rating: stats.rating || 0
          });
        } catch (error) {
          console.error('Error al cargar estadísticas:', error);
          // Usar valores por defecto si hay error
          setUserStats({
            modsCreated: 0,
            misJuegos: 0,
            modsGuardados: 0,
            rating: 0
          });
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !currentUser) {
        // Si no hay usuario y no estamos cargando la autenticación, establecer valores por defecto
        setUserStats({
          modsCreated: 0,
          misJuegos: 0,
          modsGuardados: 0,
          rating: 0
        });
        setLoading(false);
      }
    };

    loadUserStats();
  }, [currentUser, authLoading, isPublicProfile]);

  // Cargar los mods del usuario
  const loadUserMods = async () => {
    if (currentUser && !authLoading) {
      try {
        setModsLoading(true);
        
        let response;
        if (isPublicProfile) {
          // Para perfiles públicos, usar getModsByCreatorId
          console.log('Cargando mods para perfil público, usuario ID:', currentUser.id);
          response = await modService.getModsByCreatorId(currentUser.id);
        } else {
          // Para el perfil propio, usar getMyMods
          response = await modService.getMyMods();
        }
        
        if (response && response.status === 'success') {
          // Transformar los datos para que sean compatibles con ModCard
          const transformedMods = response.data.map(mod => ({
            ...mod,
            // Mapear las estadísticas a las propiedades que espera ModCard
            valoracion: mod.estadisticas?.valoracion_media || 0,
            numValoraciones: mod.estadisticas?.total_valoraciones || 0,
            descargas: mod.estadisticas?.total_descargas || mod.total_descargas || 0,
            // Mapear el autor desde el objeto creador
            autor: mod.creador?.nome || 'Usuario desconocido',
            // Mapear la categoría desde las etiquetas (tomar la primera si existe)
            categoria: mod.etiquetas && mod.etiquetas.length > 0 ? mod.etiquetas[0].nombre : 'Sin categoría'
          }));
          
          setUserMods(transformedMods);
          
          // Extraer juegos únicos de los mods
          const games = transformedMods.reduce((acc, mod) => {
            if (mod.juego && !acc.find(g => g.id === mod.juego.id)) {
              acc.push(mod.juego);
            }
            return acc;
          }, []);
          setAvailableGames(games);
          
          console.log(`Mods cargados exitosamente: ${transformedMods.length} mods encontrados`);
        } else {
          setUserMods([]);
          setAvailableGames([]);
        }
      } catch (error) {
        console.error('Error al cargar mods del usuario:', error);
        setUserMods([]);
        setAvailableGames([]);
      } finally {
        setModsLoading(false);
      }
    }
  };

  // Aplicar filtros y ordenación
  useEffect(() => {
    let filtered = [...userMods];
    
    // Filtrar por juego
    if (selectedGame !== 'all') {
      filtered = filtered.filter(mod => mod.juego?.id === parseInt(selectedGame));
    }
    
    // Ordenar
    switch (sortBy) {
      case 'endorsements':
        filtered.sort((a, b) => (b.valoracion || 0) - (a.valoracion || 0));
        break;
      case 'downloads':
        filtered.sort((a, b) => (b.descargas || 0) - (a.descargas || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
    }
    
    setFilteredMods(filtered);
    setCurrentPage(1); // Reset página al cambiar filtros
  }, [userMods, selectedGame, sortBy]);

  // Cargar mods cuando cambie el tab
  useEffect(() => {
    if (activeTab === 'mis-mods' && userMods.length === 0) {
      loadUserMods();
    }
  }, [activeTab, currentUser, authLoading]);

  // Definir los iconos para las tarjetas de estadísticas
  const allStatCards = [
    {
      title: 'Mods Creados',
      value: loading ? '...' : userStats.modsCreated,
      icon: <FontAwesomeIcon icon={faPlus} className="h-7 w-7 text-white" />,
      change: userStats.modsCreated > 0 ? `${userStats.modsCreated} mod${userStats.modsCreated !== 1 ? 's' : ''} creado${userStats.modsCreated !== 1 ? 's' : ''}` : (isPublicProfile ? 'No ha creado mods aún' : 'Comienza creando tu primer mod'),
      color: 'from-custom-primary/80 to-custom-primary',
      showInPublic: true
    },
    {
      title: 'Valoración Media',
      value: loading ? '...' : (userStats.rating > 0 ? userStats.rating.toFixed(1) : '0.0'),
      icon: <FontAwesomeIcon icon={faStar} className="h-7 w-7 text-white" />,
      change: userStats.rating > 0 ? `${userStats.rating.toFixed(1)}/5.0 estrellas` : 'Sin valoraciones aún',
      color: 'from-purple-500/80 to-purple-600',
      showInPublic: true
    },
    {
      title: isPublicProfile ? 'Descargas Totales' : 'Mis Juegos',
      value: loading ? '...' : (isPublicProfile ? (userStats.totalDownloads || 0) : userStats.misJuegos),
      icon: <FontAwesomeIcon icon={isPublicProfile ? faDownload : faGamepad} className="h-7 w-7 text-white" />,
      change: isPublicProfile 
        ? (userStats.totalDownloads > 0 ? `${userStats.totalDownloads} descargas en total` : 'Sin descargas aún')
        : (userStats.misJuegos > 0 ? `${userStats.misJuegos} juego${userStats.misJuegos !== 1 ? 's' : ''} favorito${userStats.misJuegos !== 1 ? 's' : ''}` : 'Explora y agrega juegos a favoritos'),
      color: 'from-custom-secondary/80 to-custom-secondary',
      showInPublic: true
    },
    {
      title: 'Mods Guardados',
      value: loading ? '...' : userStats.modsGuardados,
      icon: <FontAwesomeIcon icon={faBookmark} className="h-7 w-7 text-white" />,
      change: userStats.modsGuardados > 0 ? `${userStats.modsGuardados} mod${userStats.modsGuardados !== 1 ? 's' : ''} guardado${userStats.modsGuardados !== 1 ? 's' : ''}` : 'Guarda mods interesantes para más tarde',
      color: 'from-custom-tertiary/80 to-custom-tertiary',
      showInPublic: false // No mostrar en perfiles públicos por privacidad
    }
  ];

  // Filtrar las tarjetas según el tipo de perfil
  const statCardData = isPublicProfile 
    ? allStatCards.filter(card => card.showInPublic)
    : allStatCards;

  const handleSaveUser = (updatedUser) => {
    // Actualizar el usuario en el contexto de autenticación
    updateUser(updatedUser);
    console.log('Perfil actualizado:', updatedUser);
  };

  // Obtener mods para la página actual
  const getCurrentPageMods = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMods.slice(startIndex, endIndex);
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredMods.length / itemsPerPage);

  // Funciones para manejar modales de mod
  const handleEditMod = (mod) => {
    setSelectedModForEdit(mod);
    setIsEditModModalOpen(true);
  };

  const handleDeleteMod = (mod) => {
    setSelectedModForDelete(mod);
    setIsDeleteModModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModModalOpen(false);
    setSelectedModForEdit(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModModalOpen(false);
    setSelectedModForDelete(null);
    setDeletingMod(false);
  };

  const handleConfirmEdit = async (updatedModData) => {
    try {
      setLoading(true);
      
      // El EditModAdmin ya maneja la actualización del mod internamente
      // Solo necesitamos actualizar la lista local con los datos transformados
      setUserMods(prevMods => 
        prevMods.map(mod => 
          mod.id === selectedModForEdit.id 
            ? {
                ...mod,
                titulo: updatedModData.titulo || updatedModData.nombre || mod.titulo,
                descripcion: updatedModData.descripcion || mod.descripcion,
                estado: updatedModData.estado || mod.estado,
                imagen_banner: updatedModData.imagen_banner || mod.imagen_banner,
                // Mantener las propiedades transformadas que espera ModCard
                valoracion: mod.valoracion,
                numValoraciones: mod.numValoraciones,
                descargas: mod.descargas,
                autor: mod.autor,
                categoria: mod.categoria
              }
            : mod
        )
      );
      
      handleCloseEditModal();
      console.log('Mod actualizado exitosamente en la lista');
    } catch (error) {
      console.error('Error al actualizar el mod en la lista:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeletingMod(true);
      const response = await modService.deleteMod(selectedModForDelete.id);
      
      if (response.status === 'success') {
        // Remover el mod de la lista local
        setUserMods(prevMods => 
          prevMods.filter(mod => mod.id !== selectedModForDelete.id)
        );
        
        handleCloseDeleteModal();
        console.log('Mod eliminado exitosamente');
      }
    } catch (error) {
      console.error('Error al eliminar el mod:', error);
    } finally {
      setDeletingMod(false);
    }
  };

  // Si estamos cargando la autenticación O cargando un perfil público, mostrar mensaje de carga
  if (authLoading || (isPublicProfile && publicUserLoading)) {
    console.log('Mostrando pantalla de carga - authLoading:', authLoading, 'publicUserLoading:', publicUserLoading);
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-primary/20 border-t-custom-primary"></div>
          <p className="ml-4 text-white">Cargando perfil...</p>
        </div>
      </PageContainer>
    );
  }

  // Si no hay usuario después de la carga de autenticación, mostrar mensaje de error
  if (!authLoading && !currentUser && (!isPublicProfile || !publicUserLoading)) {
    console.log('Mostrando error - no currentUser disponible');
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              {isPublicProfile ? 'No se pudo cargar la información del usuario' : 'No se pudo cargar la información del usuario'}
            </p>
            <button 
              onClick={() => isPublicProfile ? navigate('/') : window.location.reload()} 
              className="px-4 py-2 bg-custom-primary text-white rounded-lg hover:bg-custom-primary/80 transition-colors"
            >
              {isPublicProfile ? 'Volver al inicio' : 'Recargar página'}
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  console.log('Renderizando perfil normal - currentUser:', currentUser, 'isPublicProfile:', isPublicProfile);

  return (
    <PageContainer>
      <div className="bg-custom-card rounded-lg shadow-lg p-6 mb-8" data-username={userData.username}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isPublicProfile ? `Perfil de ${userData.username}` : 'Mi Perfil'}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {isPublicProfile 
              ? `Información pública de ${userData.username}` 
              : 'Gestiona tu información personal y revisa tus estadísticas'
            }
          </p>
        </div>

        <div className={`mb-8 ${!isOwnProfile ? 'space-y-6' : 'space-y-7'}`}>
          {/* Cabecera del Perfil */}
          <div className="bg-custom-card rounded-xl shadow-lg p-6 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-custom-primary to-custom-secondary rounded-full flex items-center justify-center shadow-lg">
                    {userData.foto_perfil ? (
                      <img 
                        src={`http://localhost:8000/storage/${userData.foto_perfil}?t=${Date.now()}`}
                        alt="Foto de perfil" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-2xl">
                        {userData.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {userData.rol === 'admin' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center">
                    {userData.nombre && userData.apelidos ? `${userData.nombre} ${userData.apelidos}` : userData.username}
                    <span className="ml-3 text-sm bg-custom-primary/20 text-custom-primary px-2 py-1 rounded-full">
                      @{userData.username}
                    </span>
                  </h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-custom-detail">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4v1a3 3 0 003 3h6a3 3 0 003-3v-1M8 11h8" />
                      </svg>
                      Miembro desde {userData.fechaRegistro}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Última actividad: {userData.ultimaActividad}
                    </span>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-custom-primary hover:bg-custom-primary-hover text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editar Perfil</span>
                </button>
              )}
            </div>
          </div>

          {/* Tarjetas de estadísticas - Ajustadas para perfiles públicos */}
          <div className={`grid gap-5 ${isPublicProfile ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            {statCardData.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                change={stat.change}
                color={stat.color}
              />
            ))}
          </div>

          {/* Sección adicional para perfiles públicos - Aprovecha el espacio de "Crear Mod" */}
          {isPublicProfile && (
            <div className="bg-custom-card rounded-xl shadow-lg p-6 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Actividad del Usuario</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-custom-primary rounded-full"></div>
                      <span className="text-custom-detail">
                        {userStats.modsCreated > 0 ? `${userStats.modsCreated} mod${userStats.modsCreated !== 1 ? 's' : ''} creado${userStats.modsCreated !== 1 ? 's' : ''}` : 'Sin mods creados'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-custom-secondary rounded-full"></div>
                      <span className="text-custom-detail">
                        {userStats.rating > 0 ? `${userStats.rating.toFixed(1)}/5.0 valoración media` : 'Sin valoraciones'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-custom-tertiary rounded-full"></div>
                      <span className="text-custom-detail">
                        {userStats.totalDownloads > 0 ? `${userStats.totalDownloads} descargas totales` : 'Sin descargas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de Crear Mod - Solo para perfil propio */}
          {isOwnProfile && (
          <div className="bg-custom-card rounded-xl shadow-lg p-4 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">¿Tienes una idea para un mod?</h3>
                <p className="text-custom-detail text-sm mt-1">Comparte tu creatividad con la comunidad</p>
              </div>
                <button
                  onClick={() => navigate('/mods/crear')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-custom-primary to-custom-primary/80 hover:from-custom-primary-hover hover:to-custom-primary text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                  Crear Mod
                </button>
              </div>
            </div>
          )}

          {/* Sistema de Tabs */}
          <div className={`bg-custom-card rounded-xl shadow-lg border border-custom-detail/10 overflow-hidden ${isPublicProfile ? 'mt-4' : ''}`}>
            {/* Tab Navigation */}
            <div className="border-b border-custom-detail/10">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('sobre-mi')}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-300 ${
                    activeTab === 'sobre-mi'
                      ? 'text-custom-primary border-b-2 border-custom-primary bg-custom-primary/5'
                      : 'text-custom-detail hover:text-custom-text hover:bg-custom-bg/30'
                  }`}
                >
                  Sobre Mi
                </button>
                <button
                  onClick={() => setActiveTab('mis-mods')}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-300 flex items-center ${
                    activeTab === 'mis-mods'
                      ? 'text-custom-primary border-b-2 border-custom-primary bg-custom-primary/5'
                      : 'text-custom-detail hover:text-custom-text hover:bg-custom-bg/30'
                  }`}
                >
                  {isPublicProfile ? 'Sus Mods' : 'Mis Mods'}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-custom-secondary/20 text-custom-secondary rounded-full">
                    {userMods.length}
                  </span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className={`${isPublicProfile ? 'p-4' : 'p-6'}`}>
              {activeTab === 'sobre-mi' && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-3 text-custom-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sobre Mi
                  </h4>
                  <div className="bg-custom-bg/30 rounded-lg p-4 border border-custom-detail/20">
                    <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                      {userData.sobre_mi || (
                        <span className="text-custom-detail italic">No hay nada aquí todavía</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'mis-mods' && (
                <div>
                  {/* Filtros */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4 p-4 bg-custom-bg/30 rounded-lg border border-custom-detail/20">
                    {/* Filtro por Juego - Izquierda */}
                    <div className="relative">
                      <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="bg-custom-card text-custom-text border border-custom-detail/20 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-custom-primary/50 focus:border-custom-primary appearance-none min-w-[140px]"
                      >
                        <option value="all">Todos los Juegos</option>
                        {availableGames.map(game => (
                          <option key={game.id} value={game.id}>
                            {game.titulo}
                          </option>
                        ))}
                      </select>
                      <FontAwesomeIcon 
                        icon={faChevronDown} 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-custom-detail pointer-events-none h-3 w-3" 
                      />
                    </div>

                    {/* Controles de la derecha */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Información de resultados */}
                      <div className="text-sm text-custom-detail">
                        Mostrando {getCurrentPageMods().length} de {filteredMods.length} mods
                      </div>

                      {/* Ordenar por */}
                      <div className="relative">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-custom-card text-custom-text border border-custom-detail/20 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-custom-primary/50 focus:border-custom-primary appearance-none min-w-[140px]"
                        >
                          <option value="recent">Más Recientes</option>
                          <option value="endorsements">Valoraciones</option>
                          <option value="downloads">Descargas</option>
                        </select>
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-custom-detail pointer-events-none h-3 w-3" 
                        />
                      </div>

                      {/* Items por página */}
                      <div className="relative">
                        <select
                          value={itemsPerPage}
                          onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                          className="bg-custom-card text-custom-text border border-custom-detail/20 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-custom-primary/50 focus:border-custom-primary appearance-none min-w-[100px]"
                        >
                          <option value={10}>10 Items</option>
                          <option value={20}>20 Items</option>
                          <option value={50}>50 Items</option>
                        </select>
                        <FontAwesomeIcon 
                          icon={faChevronDown} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-custom-detail pointer-events-none h-3 w-3" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de Mods */}
                  {modsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-primary/20 border-t-custom-primary"></div>
                    </div>
                  ) : getCurrentPageMods().length > 0 ? (
                    <>
                      <div className={`grid gap-6 ${isPublicProfile ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {getCurrentPageMods().map(mod => (
                          <ModCard 
                            key={mod.id} 
                            mod={mod} 
                            isOwner={isOwnProfile}
                            showSaveButton={!isOwnProfile}
                            onEdit={isOwnProfile ? handleEditMod : undefined}
                            onDelete={isOwnProfile ? handleDeleteMod : undefined}
                          />
                        ))}
                      </div>

                      {/* Paginación */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center mt-8 space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-custom-detail hover:text-custom-text disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-custom-primary text-white'
                                  : 'text-custom-detail hover:text-custom-text hover:bg-custom-bg/30'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-custom-detail hover:text-custom-text disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-custom-bg/50 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faGamepad} className="h-8 w-8 text-custom-detail" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-2">
                        {selectedGame === 'all' ? 
                          (isPublicProfile ? 'No ha creado mods aún' : 'No tienes mods creados') : 
                          'No hay mods para este juego'
                        }
                      </h3>
                      <p className="text-custom-detail mb-4">
                        {selectedGame === 'all' 
                          ? (isPublicProfile ? 
                              `${userData.username} aún no ha creado ningún mod` : 
                              'Comienza creando tu primer mod para la comunidad'
                            )
                          : 'Intenta cambiar el filtro de juego o crear un nuevo mod'
                        }
                      </p>
                      {isOwnProfile && (
                        <button
                          onClick={() => navigate('/mods/crear')}
                          className="inline-flex items-center px-4 py-2 bg-custom-primary hover:bg-custom-primary-hover text-white font-medium rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                          Crear Mod
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modal de edición de perfil */}
          {isOwnProfile && (
            <UserProfileEditModal 
              user={userData}
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSave={handleSaveUser}
            />
          )}

          {/* Modal de edición de mod */}
          {isEditModModalOpen && selectedModForEdit && (
            <EditModAdmin
              mod={selectedModForEdit}
              isOpen={isEditModModalOpen}
              onClose={handleCloseEditModal}
              onSave={handleConfirmEdit}
            />
          )}

          {/* Modal de confirmación de eliminación de mod */}
          {isDeleteModModalOpen && selectedModForDelete && (
            <ModDeleteConfirmationModal
              modTitle={selectedModForDelete.titulo}
              isOpen={isDeleteModModalOpen}
              onConfirm={handleConfirmDelete}
              onCancel={handleCloseDeleteModal}
              message="¿Estás seguro de que quieres eliminar este mod? Esta acción se puede deshacer más tarde."
              confirmText="Eliminar"
              isDangerous={false}
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Perfil; 