import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import UserProfileEditModal from '../modals/UserProfileEditModal';
import userService from '../../../services/api/userService';
import modService from '../../../services/api/modService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGamepad, faPlus, faBookmark, faStar } from '@fortawesome/free-solid-svg-icons';

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

// Componente para mostrar actividades recientes
const ActivityItem = ({ activity }) => (
  <div className="flex items-start p-3 rounded-lg hover:bg-custom-bg/40 transition-all duration-300 border border-transparent hover:border-custom-detail/20 group">
    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-custom-primary/20 to-custom-primary/40 flex items-center justify-center mr-4 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
      {activity.icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="text-white text-sm font-medium">
          {activity.title} {activity.author && (
            <span className="font-semibold">{activity.author}</span>
          )} <span className="font-semibold text-custom-secondary">{activity.content}</span> {activity.suffix}
        </p>
        <span className="bg-custom-bg/40 text-xs text-custom-detail px-2 py-1 rounded-full ml-2 whitespace-nowrap">{activity.time}</span>
      </div>
      <div className="flex space-x-2 mt-2">
        {activity.type === 'upload' && (
          <button className="text-xs bg-custom-primary/20 hover:bg-custom-primary/40 text-white px-2 py-1 rounded transition-colors duration-300 flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver cambios
          </button>
        )}
        {activity.type === 'comment' && (
          <button className="text-xs bg-custom-secondary/20 hover:bg-custom-secondary/40 text-white px-2 py-1 rounded transition-colors duration-300 flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Responder
          </button>
        )}
        {activity.type === 'favorite' && (
          <button className="text-xs bg-custom-tertiary/20 hover:bg-custom-tertiary/40 text-white px-2 py-1 rounded transition-colors duration-300 flex items-center">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Ver estadísticas
          </button>
        )}
      </div>
    </div>
  </div>
);

// Componente para mostrar notificaciones
const NotificationItem = ({ notification }) => (
  <div className={`p-3 rounded-lg ${notification.bgColor} border ${notification.borderColor}`}>
    <p className="text-white text-sm">{notification.content}</p>
    <div className="flex justify-between items-center mt-2">
      <span className="text-custom-detail text-xs">{notification.time}</span>
      <button className={`${notification.buttonColor}`}>
        {notification.action}
      </button>
    </div>
  </div>
);

const General = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    modsCreated: 0,
    misJuegos: 0,
    modsGuardados: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      // Solo cargar estadísticas si el usuario está disponible y no estamos en carga de autenticación
      if (user && !authLoading) {
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
      } else if (!authLoading && !user) {
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
  }, [user, authLoading]);

  // Función para formatear fecha de registro
  const formatearFechaRegistro = (fechaString) => {
    if (!fechaString) return 'No disponible';
    
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
        return 'No disponible';
      }
      
      // Formatear en español
      return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'No disponible';
    }
  };

  // Datos del usuario con valores por defecto
  const userData = {
    id: user?.id || 0,
    username: user?.nome || 'Usuario',
    nome: user?.nome || 'Usuario',
    correo: user?.correo || '',
    nombre: user?.nombre || '',
    apelidos: user?.apelidos || '',
    sobre_mi: user?.sobre_mi || '',
    rol: user?.rol || 'usuario',
    foto_perfil: user?.foto_perfil || null,
    fechaRegistro: formatearFechaRegistro(user?.created_at || user?.updated_at),
    ultimaActividad: 'Ahora',
    ...userStats
  };

  // Definir los iconos para las tarjetas de estadísticas
  const statCardData = [
    {
      title: 'Mods Creados',
      value: loading ? '...' : userStats.modsCreated,
      icon: <FontAwesomeIcon icon={faPlus} className="h-7 w-7 text-white" />,
      change: userStats.modsCreated > 0 ? `${userStats.modsCreated} mod${userStats.modsCreated !== 1 ? 's' : ''} creado${userStats.modsCreated !== 1 ? 's' : ''}` : 'Comienza creando tu primer mod',
      color: 'from-custom-primary/80 to-custom-primary'
    },
    {
      title: 'Mis Juegos',
      value: loading ? '...' : userStats.misJuegos,
      icon: <FontAwesomeIcon icon={faGamepad} className="h-7 w-7 text-white" />,
      change: userStats.misJuegos > 0 ? `${userStats.misJuegos} juego${userStats.misJuegos !== 1 ? 's' : ''} favorito${userStats.misJuegos !== 1 ? 's' : ''}` : 'Explora y agrega juegos a favoritos',
      color: 'from-custom-secondary/80 to-custom-secondary'
    },
    {
      title: 'Mods Guardados',
      value: loading ? '...' : userStats.modsGuardados,
      icon: <FontAwesomeIcon icon={faBookmark} className="h-7 w-7 text-white" />,
      change: userStats.modsGuardados > 0 ? `${userStats.modsGuardados} mod${userStats.modsGuardados !== 1 ? 's' : ''} guardado${userStats.modsGuardados !== 1 ? 's' : ''}` : 'Guarda mods interesantes para más tarde',
      color: 'from-custom-tertiary/80 to-custom-tertiary'
    },
    {
      title: 'Valoración Media',
      value: loading ? '...' : (userStats.rating > 0 ? userStats.rating.toFixed(1) : '0.0'),
      icon: <FontAwesomeIcon icon={faStar} className="h-7 w-7 text-white" />,
      change: userStats.rating > 0 ? `${userStats.rating.toFixed(1)}/5.0 estrellas` : 'Sin valoraciones aún',
      color: 'from-purple-500/80 to-purple-600'
    }
  ];

  const handleSaveUser = (updatedUser) => {
    // Actualizar el usuario en el contexto de autenticación
    updateUser(updatedUser);
    console.log('Perfil actualizado:', updatedUser);
  };

  // Si estamos cargando la autenticación, mostrar mensaje de carga
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-primary/20 border-t-custom-primary"></div>
      </div>
    );
  }

  // Si no hay usuario después de la carga de autenticación, mostrar mensaje de error
  if (!authLoading && !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No se pudo cargar la información del usuario</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-custom-primary text-white rounded-lg hover:bg-custom-primary/80 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 mb-8">
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
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-custom-primary hover:bg-custom-primary-hover text-white px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Perfil</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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

      {/* Botón de Crear Mod */}
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

      {/* Sección Sobre Mi */}
      <div className="bg-custom-card rounded-xl shadow-lg p-6 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
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

      {/* Sección Sobre mí */}
      <div className="bg-custom-card rounded-xl shadow-lg p-6 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
        <h4 className="text-lg font-semibold text-white mb-6 flex items-center border-b border-custom-detail/10 pb-4">
          <svg className="h-5 w-5 mr-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Información del Usuario
        </h4>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <p className="text-custom-detail text-xs">Usuario</p>
                <p className="text-white font-medium">@{userData.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-custom-detail text-xs">Correo</p>
                <p className="text-white font-medium">{userData.correo}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-8 4v1a3 3 0 003 3h6a3 3 0 003-3v-1M8 11h8" />
              </svg>
              <div>
                <p className="text-custom-detail text-xs">Miembro desde</p>
                <p className="text-white font-medium">{userData.fechaRegistro}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-sm">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-custom-detail text-xs">Última actividad</p>
                <p className="text-white font-medium">{userData.ultimaActividad}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición de perfil */}
      <UserProfileEditModal 
        user={userData}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default General; 