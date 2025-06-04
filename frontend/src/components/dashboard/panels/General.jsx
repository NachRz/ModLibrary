import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import UserProfileEditModal from '../modals/UserProfileEditModal';
import userService from '../../../services/api/userService';

// Componente para mostrar las tarjetas de estadísticas
const StatCard = ({ title, value, icon, change, color }) => (
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
  const { user, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    modsCreated: 0,
    modsInstalled: 0,
    favorites: 0,
    rating: 0
  });
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas del usuario
  useEffect(() => {
    const loadUserStats = async () => {
      if (user) {
        try {
          setLoading(true);
          const stats = await userService.getUserStats();
          setUserStats(stats.data || {
            modsCreated: 0,
            modsInstalled: 0,
            favorites: 0,
            rating: 0
          });
        } catch (error) {
          console.error('Error al cargar estadísticas:', error);
          // Usar valores por defecto si hay error
          setUserStats({
            modsCreated: 0,
            modsInstalled: 0,
            favorites: 0,
            rating: 0
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserStats();
  }, [user]);

  // Datos del usuario con valores por defecto
  const userData = {
    id: user?.id || 0,
    username: user?.nome || 'Usuario',
    nome: user?.nome || 'Usuario',
    correo: user?.correo || '',
    nombre: user?.nombre || '',
    apelidos: user?.apelidos || '',
    rol: user?.rol || 'usuario',
    foto_perfil: user?.foto_perfil || null,
    fechaRegistro: user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'No disponible',
    ultimaActividad: 'Ahora',
    ...userStats
  };

  // Definir los iconos para las tarjetas de estadísticas
  const statCardData = [
    {
      title: 'Mods Creados',
      value: loading ? '...' : userStats.modsCreated,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>,
      change: '↗ 5% más que el mes pasado',
      color: 'from-custom-primary/80 to-custom-primary'
    },
    {
      title: 'Mods Instalados',
      value: loading ? '...' : userStats.modsInstalled,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>,
      change: '↗ 12% más que el mes pasado',
      color: 'from-custom-secondary/80 to-custom-secondary'
    },
    {
      title: 'Favoritos',
      value: loading ? '...' : userStats.favorites,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>,
      change: '↗ 3% más que el mes pasado',
      color: 'from-custom-tertiary/80 to-custom-tertiary'
    },
    {
      title: 'Valoración Media',
      value: loading ? '...' : (userStats.rating || 0).toFixed(1),
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>,
      change: '↑ 0.2 puntos desde el último mes',
      color: 'from-purple-500/80 to-purple-600'
    }
  ];

  const handleSaveUser = (updatedUser) => {
    // Actualizar el usuario en el contexto de autenticación
    updateUser(updatedUser);
    console.log('Perfil actualizado:', updatedUser);
  };

  // Si no hay usuario, mostrar mensaje de carga
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-primary/20 border-t-custom-primary"></div>
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