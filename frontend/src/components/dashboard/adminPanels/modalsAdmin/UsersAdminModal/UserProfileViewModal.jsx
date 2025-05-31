import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import adminService from '../../../../../services/api/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faCalendarAlt, 
  faGamepad,
  faShieldAlt,
  faEdit,
  faTrophy,
  faChartLine,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

const UserProfileViewModal = ({ user, isOpen, onClose, onEdit }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadUserProfile();
    }
  }, [user, isOpen]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar detalles del usuario y estadísticas
      const [detailsResponse, statsResponse] = await Promise.all([
        adminService.getUserDetails(user.id),
        adminService.getUserStats(user.id)
      ]);
      
      setUserDetails(detailsResponse.data);
      setUserStats(statsResponse.data);
    } catch (error) {
      setError('Error al cargar el perfil del usuario');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (rol) => {
    const styles = {
      admin: 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 border border-purple-500/50',
      usuario: 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border border-blue-500/50'
    };
    
    return styles[rol] || styles.usuario;
  };

  // Función para obtener el estilo de cada estadística con colores únicos
  const getStatCardStyle = (type) => {
    const styles = {
      totalMods: 'bg-gradient-to-br from-blue-600/20 to-blue-800/30 border border-blue-500/30',
      published: 'bg-gradient-to-br from-green-600/20 to-emerald-800/30 border border-green-500/30',
      downloads: 'bg-gradient-to-br from-yellow-600/20 to-orange-800/30 border border-yellow-500/30',
      rating: 'bg-gradient-to-br from-purple-600/20 to-indigo-800/30 border border-purple-500/30',
      drafts: 'bg-gradient-to-br from-orange-600/20 to-red-800/30 border border-orange-500/30',
      reviews: 'bg-gradient-to-br from-pink-600/20 to-rose-800/30 border border-pink-500/30',
      saved: 'bg-gradient-to-br from-cyan-600/20 to-teal-800/30 border border-cyan-500/30'
    };
    
    return styles[type] || styles.totalMods;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-4xl mx-auto overflow-hidden shadow-2xl border border-gray-700/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-gray-700/50">
          <div className="flex justify-between items-center p-5">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {userDetails?.foto_perfil && !imageError ? (
                    <img 
                      src={userDetails.foto_perfil} 
                      alt={`Avatar de ${userDetails.nome}`}
                      className="w-14 h-14 rounded-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <span className="text-white text-xl font-bold">
                      {userDetails?.nome ? userDetails.nome.charAt(0).toUpperCase() : user?.nome?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {userDetails?.rol === 'admin' && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCrown} className="text-white text-xs" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Perfil de {userDetails?.nome || user?.nome}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Panel de administración - Vista detallada</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadge(userDetails?.rol)}`}>
                  <FontAwesomeIcon icon={userDetails?.rol === 'admin' ? faShieldAlt : faUser} className="mr-1" />
                  {userDetails?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(userDetails || user)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  <span>Editar</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/20 border-t-purple-500"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-purple-500/10"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-5">
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {error}
              </div>
            </div>
          ) : userDetails ? (
            <div className="p-5 space-y-6">
              {/* Información básica mejorada */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Datos personales */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faUser} className="text-purple-400" />
                    </div>
                    Información Personal
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Nombre de usuario:</span>
                      <span className="text-white font-semibold text-sm">{userDetails?.nome}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Nombre completo:</span>
                      <span className="text-white text-sm">
                        {userDetails?.nombre || userDetails?.apelidos 
                          ? `${userDetails?.nombre || ''} ${userDetails?.apelidos || ''}`.trim()
                          : 'No especificado'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Correo electrónico:</span>
                      <span className="text-white text-sm">{userDetails?.correo}</span>
                    </div>
                  </div>
                </div>

                {/* Información del sistema */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400" />
                    </div>
                    Información del Sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Fecha de registro:</span>
                      <span className="text-white text-sm">{formatDate(userDetails?.fecha_registro)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Días activo:</span>
                      <span className="text-white font-semibold text-sm">{userStats?.dias_activo || 0} días</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de mods mejoradas */}
              {userStats && (
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-6 border border-gray-600/30">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-3">
                        <FontAwesomeIcon icon={faGamepad} className="text-green-400" />
                      </div>
                      Estadísticas de Mods
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <FontAwesomeIcon icon={faChartLine} />
                      <span>Datos en tiempo real</span>
                    </div>
                  </div>
                  
                  {/* Estadísticas principales con efectos mejorados */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className={`relative p-4 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('totalMods')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-2xl font-bold text-blue-300 mb-1">{userStats.total_mods || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Total Mods</div>
                      </div>
                    </div>
                    
                    <div className={`relative p-4 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('published')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-2xl font-bold text-green-300 mb-1">{userStats.mods_publicados || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Publicados</div>
                      </div>
                    </div>
                    
                    <div className={`relative p-4 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('downloads')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-2xl font-bold text-yellow-300 mb-1">{userStats.total_descargas || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Descargas</div>
                      </div>
                    </div>
                    
                    <div className={`relative p-4 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('rating')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-2xl font-bold text-purple-300 mb-1">{userStats.valoracion_promedio || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Valoración</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Estadísticas secundarias */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className={`relative p-3 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('drafts')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-xl font-bold text-orange-300 mb-1">{userStats.mods_borradores || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Borradores</div>
                      </div>
                    </div>
                    
                    <div className={`relative p-3 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('reviews')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-xl font-bold text-pink-300 mb-1">{userStats.total_valoraciones || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Valoraciones</div>
                      </div>
                    </div>
                    
                    <div className={`relative p-3 rounded-xl transition-all duration-300 hover:scale-105 ${getStatCardStyle('saved')}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl"></div>
                      <div className="relative text-center">
                        <div className="text-xl font-bold text-cyan-300 mb-1">{userStats.total_guardados || 0}</div>
                        <div className="text-gray-300 text-xs font-medium">Guardados</div>
                      </div>
                    </div>
                  </div>

                  {/* Cronología de actividad */}
                  {userStats.fecha_primer_mod && (
                    <div className="bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl p-4">
                      <h4 className="text-base font-semibold text-white mb-3 flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-400" />
                        Cronología de Actividad
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 p-3 rounded-lg border border-indigo-500/30">
                          <div className="text-xs text-gray-300 mb-1">Primer mod publicado</div>
                          <div className="text-white font-semibold text-sm">{formatDate(userStats.fecha_primer_mod)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 p-3 rounded-lg border border-emerald-500/30">
                          <div className="text-xs text-gray-300 mb-1">Último mod actualizado</div>
                          <div className="text-white font-semibold text-sm">{formatDate(userStats.fecha_ultimo_mod)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-5">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar el modal usando un portal al body del documento
  return ReactDOM.createPortal(modalContent, document.body);
};

export default UserProfileViewModal; 