import React from 'react';
import { Link } from 'react-router-dom';

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
  // Datos de usuario
  const userData = {
    username: 'Usuario1',
    modsCreated: 12,
    modsInstalled: 45,
    favorites: 8,
    rating: 4.8
  };
  
  // Actividad reciente
  const recentActivities = [
    {
      id: 1,
      type: 'upload',
      title: 'Has subido una nueva versión de',
      content: 'Enhanced Combat System',
      time: 'Hace 2 horas',
      icon: (
        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      )
    },
    {
      id: 2,
      type: 'comment',
      title: 'Ha comentado tu mod',
      author: 'ModMaster',
      content: 'Better UI',
      time: 'Ayer',
      icon: (
        <svg className="h-5 w-5 text-custom-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      id: 3,
      type: 'favorite',
      title: 'Tu mod',
      content: 'Realistic Weather',
      suffix: 'ha recibido 5 nuevos favoritos',
      time: 'Hace 3 días',
      icon: (
        <svg className="h-5 w-5 text-custom-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  // Datos para las estadísticas
  const statData = [
    {
      title: 'Visitas a tus mods',
      value: '1,245',
      percentage: '75%',
      color: 'bg-custom-primary',
      change: '+12% comparado con el mes anterior'
    },
    {
      title: 'Descargas este mes',
      value: '852',
      percentage: '62%',
      color: 'bg-custom-secondary',
      change: '+8% comparado con el mes anterior'
    },
    {
      title: 'Comentarios recibidos',
      value: '24',
      percentage: '40%',
      color: 'bg-custom-tertiary',
      change: '+5% comparado con el mes anterior'
    },
    {
      title: 'Valoraciones promedio',
      value: '4.8/5.0',
      percentage: '95%',
      color: 'bg-purple-500',
      change: '+0.2 comparado con el mes anterior'
    }
  ];

  // Datos para las notificaciones
  const notifications = [
    {
      id: 1,
      content: 'Un nuevo usuario ha comentado en tu mod Enhanced Combat System.',
      time: 'Hace 30 minutos',
      action: 'Ver comentario',
      bgColor: 'bg-blue-400/10', 
      borderColor: 'border-blue-400/30',
      buttonColor: 'bg-blue-400/20 hover:bg-blue-400/40 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300'
    },
    {
      id: 2,
      content: 'Tu mod Better Graphics Overhaul ha recibido 10 descargas más.',
      time: 'Hace 2 horas',
      action: 'Ver estadísticas',
      bgColor: 'bg-custom-secondary/10', 
      borderColor: 'border-custom-secondary/20',
      buttonColor: 'bg-custom-secondary/20 hover:bg-custom-secondary/40 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300'
    },
    {
      id: 3,
      content: 'Hay nuevos mods disponibles para Skyrim que podrían interesarte.',
      time: 'Hace 1 día',
      action: 'Explorar',
      bgColor: 'bg-custom-bg/30', 
      borderColor: 'border-custom-detail/20',
      buttonColor: 'bg-custom-tertiary/20 hover:bg-custom-tertiary/40 text-white px-3 py-1 rounded-md shadow-sm hover:shadow transition-all duration-300'
    }
  ];

  // Definir los iconos para las tarjetas de estadísticas
  const statCardData = [
    {
      title: 'Mods Creados',
      value: userData.modsCreated,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>,
      change: '↗ 5% más que el mes pasado',
      color: 'from-custom-primary/80 to-custom-primary'
    },
    {
      title: 'Mods Instalados',
      value: userData.modsInstalled,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>,
      change: '↗ 12% más que el mes pasado',
      color: 'from-custom-secondary/80 to-custom-secondary'
    },
    {
      title: 'Favoritos',
      value: userData.favorites,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>,
      change: '↗ 3% más que el mes pasado',
      color: 'from-custom-tertiary/80 to-custom-tertiary'
    },
    {
      title: 'Valoración Media',
      value: userData.rating,
      icon: <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>,
      change: '↑ 0.2 puntos desde el último mes',
      color: 'from-purple-500/80 to-purple-600'
    }
  ];

  return (
    <div className="space-y-7">
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

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actividad reciente */}
          <div className="bg-custom-card rounded-xl shadow-lg p-5 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center border-b border-custom-detail/10 pb-3">
              <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Actividad Reciente
              <span className="ml-auto text-xs font-normal bg-custom-primary/20 text-white px-2 py-1 rounded-full">3 nuevas</span>
            </h4>
            
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
            
            <div className="mt-5 text-center">
              <button className="bg-custom-primary/10 hover:bg-custom-primary/20 text-white font-medium transition-all duration-300 px-4 py-2 rounded-lg border border-custom-primary/30 hover:border-custom-primary/50 shadow-sm hover:shadow inline-flex items-center">
                <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Ver toda la actividad
              </button>
            </div>
          </div>
          
          {/* Estadísticas detalladas */}
          <div className="bg-custom-card rounded-xl shadow-lg p-5 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Estadísticas Detalladas
            </h4>
            
            <div className="space-y-5">
              {statData.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-white font-medium">{stat.title}</span>
                    <span className="text-sm font-medium text-white">{stat.value}</span>
                  </div>
                  <div className="w-full bg-custom-bg/50 rounded-full h-2">
                    <div className={`${stat.color} h-2 rounded-full`} style={{ width: stat.percentage }}></div>
                  </div>
                  <p className="text-xs text-custom-detail mt-1">{stat.change}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-5 flex items-center justify-between text-sm">
              <span className="text-custom-detail text-xs">Últimos 30 días</span>
              <Link to="/dashboard/estadisticas" className="bg-custom-secondary/10 hover:bg-custom-secondary/20 text-white font-medium transition-all duration-300 px-4 py-2 rounded-lg border border-custom-secondary/30 hover:border-custom-secondary/50 shadow-sm hover:shadow">
                Ver estadísticas completas
              </Link>
            </div>
          </div>
        </div>
        
        {/* Columna derecha (1/3) */}
        <div className="space-y-6">
          {/* Acciones rápidas */}
          <div className="bg-custom-card rounded-xl shadow-lg p-5 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Acciones Rápidas
            </h4>
            
            <div className="space-y-3">
              <button className="w-full bg-custom-primary hover:bg-custom-primary-hover text-white flex items-center justify-center rounded-lg px-4 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg">
                <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Crear Nuevo Mod</span>
              </button>
              
              <button className="w-full bg-custom-bg/40 hover:bg-custom-bg/60 text-white flex items-center justify-center rounded-lg px-4 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg border border-custom-detail/20">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Subir Actualización</span>
              </button>
              
              <button className="w-full bg-custom-bg/40 hover:bg-custom-bg/60 text-white flex items-center justify-center rounded-lg px-4 py-2.5 transition-all duration-300 shadow-md hover:shadow-lg border border-custom-detail/20">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>Ver Mis Mods</span>
              </button>
            </div>
          </div>
          
          {/* Notificaciones */}
          <div className="bg-custom-card rounded-xl shadow-lg p-5 border border-custom-detail/10 hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notificaciones
            </h4>
            
            <div className="space-y-2">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button className="bg-custom-tertiary/10 hover:bg-custom-tertiary/20 text-white font-medium transition-all duration-300 px-4 py-2 rounded-lg border border-custom-tertiary/30 hover:border-custom-tertiary/50 shadow-sm hover:shadow">
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default General; 