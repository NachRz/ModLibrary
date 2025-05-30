import React, { useState, useEffect } from 'react';
import adminService from '../../../../../services/api/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faCalendarAlt, 
  faGamepad,
  faShieldAlt,
  faMapMarkerAlt,
  faGlobe,
  faPhone,
  faBirthdayCake,
  faEdit,
  faEye
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (rol) => {
    const styles = {
      admin: 'bg-purple-500 bg-opacity-20 text-purple-400 border border-purple-500',
      usuario: 'bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500'
    };
    
    return styles[rol] || styles.usuario;
  };

  const getStatusBadge = (estado) => {
    const styles = {
      activo: 'bg-green-500 bg-opacity-20 text-green-400 border border-green-500',
      inactivo: 'bg-red-500 bg-opacity-20 text-red-400 border border-red-500',
      suspendido: 'bg-yellow-500 bg-opacity-20 text-yellow-400 border border-yellow-500'
    };
    
    return styles[estado] || styles.activo;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center overflow-hidden">
              {userDetails?.foto_perfil && !imageError ? (
                <img 
                  src={userDetails.foto_perfil} 
                  alt={`Avatar de ${userDetails.nome}`}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <span className="text-white text-xl font-medium">
                  {userDetails?.nome ? userDetails.nome.charAt(0).toUpperCase() : user?.nome?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Perfil de {userDetails?.nome || user?.nome}
              </h2>
              <p className="text-xs text-gray-400 mt-1">Panel de administración - Vista detallada</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(userDetails || user)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Datos personales */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-purple-400" />
                    Información Personal
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nombre de usuario:</span>
                      <span className="text-white font-medium">{userDetails?.nome}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nombre completo:</span>
                      <span className="text-white">
                        {userDetails?.nombre || userDetails?.apelidos 
                          ? `${userDetails?.nombre || ''} ${userDetails?.apelidos || ''}`.trim()
                          : 'No especificado'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Correo electrónico:</span>
                      <span className="text-white">{userDetails?.correo}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Teléfono:</span>
                      <span className="text-white">{userDetails?.telefono || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Fecha de nacimiento:</span>
                      <span className="text-white">{formatDate(userDetails?.fecha_nacimiento)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">País:</span>
                      <span className="text-white">{userDetails?.pais || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Ciudad:</span>
                      <span className="text-white">{userDetails?.ciudad || 'No especificado'}</span>
                    </div>
                  </div>
                </div>

                {/* Información del sistema */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-blue-400" />
                    Información del Sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Rol:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getRoleBadge(userDetails?.rol)}`}>
                        {userDetails?.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(userDetails?.estado)}`}>
                        {userDetails?.estado?.charAt(0).toUpperCase() + userDetails?.estado?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Fecha de registro:</span>
                      <span className="text-white">{formatDateTime(userDetails?.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Última actualización:</span>
                      <span className="text-white">{formatDateTime(userDetails?.updated_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Último acceso:</span>
                      <span className="text-white">{formatDateTime(userDetails?.ultimo_acceso)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Email verificado:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userDetails?.email_verified_at 
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {userDetails?.email_verified_at ? 'Verificado' : 'No verificado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de mods */}
              {userStats && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FontAwesomeIcon icon={faGamepad} className="mr-2 text-green-400" />
                    Estadísticas de Mods
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{userStats.total_mods || 0}</div>
                      <div className="text-gray-400 text-sm">Total Mods</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{userStats.mods_activos || 0}</div>
                      <div className="text-gray-400 text-sm">Activos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{userStats.total_descargas || 0}</div>
                      <div className="text-gray-400 text-sm">Descargas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{userStats.total_likes || 0}</div>
                      <div className="text-gray-400 text-sm">Likes</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Biografía */}
              {userDetails?.biografia && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Biografía</h3>
                  <p className="text-gray-300 leading-relaxed">{userDetails.biografia}</p>
                </div>
              )}

              {/* Redes sociales y enlaces */}
              {(userDetails?.enlace_personal || userDetails?.redes_sociales) && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FontAwesomeIcon icon={faGlobe} className="mr-2 text-cyan-400" />
                    Enlaces y Redes Sociales
                  </h3>
                  <div className="space-y-3">
                    {userDetails.enlace_personal && (
                      <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={faGlobe} className="text-cyan-400" />
                        <a 
                          href={userDetails.enlace_personal} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          {userDetails.enlace_personal}
                        </a>
                      </div>
                    )}
                    {userDetails.redes_sociales && Object.keys(userDetails.redes_sociales).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(userDetails.redes_sociales).map(([platform, url]) => (
                          <div key={platform} className="flex items-center space-x-3">
                            <span className="text-gray-400 capitalize">{platform}:</span>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline truncate"
                            >
                              {url}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Configuración de privacidad */}
              {userDetails?.configuracion_privacidad && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FontAwesomeIcon icon={faEye} className="mr-2 text-orange-400" />
                    Configuración de Privacidad
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Perfil público:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userDetails.configuracion_privacidad.perfil_publico 
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {userDetails.configuracion_privacidad.perfil_publico ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mostrar email:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userDetails.configuracion_privacidad.mostrar_email 
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {userDetails.configuracion_privacidad.mostrar_email ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Mostrar estadísticas:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userDetails.configuracion_privacidad.mostrar_estadisticas 
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {userDetails.configuracion_privacidad.mostrar_estadisticas ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Recibir notificaciones:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        userDetails.configuracion_privacidad.recibir_notificaciones 
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : 'bg-red-500 bg-opacity-20 text-red-400'
                      }`}>
                        {userDetails.configuracion_privacidad.recibir_notificaciones ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileViewModal; 