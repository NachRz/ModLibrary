import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import modService from '../../../../../services/api/modService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faDownload, 
  faStar, 
  faCalendarAlt,
  faGamepad,
  faUser,
  faEdit,
  faChartLine,
  faTag,
  faImage,
  faFile,
  faGlobe,
  faShieldAlt,
  faComments,
  faHeart,
  faCrown,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

const ModViewModal = ({ mod, isOpen, onClose, onEdit }) => {
  const [modDetails, setModDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modStats, setModStats] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (mod && isOpen) {
      loadModProfile();
    }
  }, [mod, isOpen]);

  const loadModProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar detalles del mod y estadísticas
      const [detailsResponse] = await Promise.all([
        modService.getModById(mod.id)
      ]);
      
      setModDetails(detailsResponse.data);
      
      // Calcular estadísticas del mod
      const stats = {
        total_descargas: detailsResponse.data.estadisticas?.total_descargas || detailsResponse.data.total_descargas || 0,
        valoracion_media: detailsResponse.data.estadisticas?.valoracion_media || detailsResponse.data.val_media || 0,
        total_valoraciones: detailsResponse.data.estadisticas?.total_valoraciones || detailsResponse.data.num_valoraciones || 0,
        total_comentarios: detailsResponse.data.total_comentarios || 0,
        fecha_creacion: detailsResponse.data.fecha_creacion || detailsResponse.data.created_at || '',
        fecha_actualizacion: detailsResponse.data.fecha_actualizacion || detailsResponse.data.updated_at || '',
        visitas: detailsResponse.data.visitas || 0,
        favoritos: detailsResponse.data.favoritos || 0
      };
      
      setModStats(stats);
    } catch (error) {
      setError('Error al cargar el perfil del mod');
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

  const getStatusBadge = (estado) => {
    const styles = {
      publicado: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-300 border border-green-500/50',
      borrador: 'bg-gradient-to-r from-orange-600/20 to-yellow-600/20 text-orange-300 border border-orange-500/50',
      revision: 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-300 border border-blue-500/50',
      rechazado: 'bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-300 border border-red-500/50'
    };
    
    return styles[estado] || styles.borrador;
  };

  // Función para obtener el estilo de cada estadística con colores únicos
  const getStatCardStyle = (type) => {
    const styles = {
      downloads: 'bg-gradient-to-br from-blue-600/20 to-blue-800/30 border border-blue-500/30',
      rating: 'bg-gradient-to-br from-yellow-600/20 to-orange-800/30 border border-yellow-500/30',
      reviews: 'bg-gradient-to-br from-purple-600/20 to-indigo-800/30 border border-purple-500/30',
      comments: 'bg-gradient-to-br from-pink-600/20 to-rose-800/30 border border-pink-500/30',
      views: 'bg-gradient-to-br from-cyan-600/20 to-teal-800/30 border border-cyan-500/30',
      favorites: 'bg-gradient-to-br from-green-600/20 to-emerald-800/30 border border-green-500/30'
    };
    
    return styles[type] || styles.downloads;
  };

  const getStatusText = (estado) => {
    const statusMap = {
      publicado: 'Publicado',
      borrador: 'Borrador',
      revision: 'En Revisión',
      rechazado: 'Rechazado'
    };
    
    return statusMap[estado] || 'Desconocido';
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-5xl mx-auto overflow-hidden shadow-2xl border border-gray-700/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-gray-700/50">
          <div className="flex justify-between items-center p-5">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center overflow-hidden">
                  {modDetails?.imagen_banner && !imageError ? (
                    <img 
                      src={modDetails.imagen_banner} 
                      alt={`Banner de ${modDetails.titulo}`}
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <FontAwesomeIcon icon={faGamepad} className="text-white text-2xl" />
                  )}
                </div>
                {modDetails?.es_destacado && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faCrown} className="text-white text-xs" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {modDetails?.titulo || mod?.nombre || mod?.titulo}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Panel de administración - Vista detallada</p>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusBadge(modDetails?.estado || mod?.estado)}`}>
                  <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                  {getStatusText(modDetails?.estado || mod?.estado)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {onEdit && (
                <button
                  onClick={() => onEdit(modDetails || mod)}
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
                <FontAwesomeIcon icon={faGamepad} className="mr-2" />
                {error}
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-6">
              {/* Información básica del mod */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Detalles principales */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faGamepad} className="text-purple-400" />
                    </div>
                    Información del Mod
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Título:</span>
                      <span className="text-white font-semibold text-sm">{modDetails?.titulo}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Versión:</span>
                      <span className="text-white text-sm">
                        v{modDetails?.version || modDetails?.version_actual || '1.0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Juego:</span>
                      <span className="text-white text-sm">
                        {modDetails?.juego?.titulo || mod?.juego || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Creador:</span>
                      <span className="text-white text-sm flex items-center">
                        <img 
                          src={modDetails?.creador?.foto_perfil || '/images/user-placeholder.jpg'} 
                          alt={modDetails?.creador?.nome}
                          className="w-6 h-6 rounded-full mr-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {modDetails?.creador?.nome || mod?.creador || 'Usuario'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Edad recomendada:</span>
                      <span className="text-white text-sm">
                        {modDetails?.edad_recomendada ? `${modDetails.edad_recomendada}+` : 'No especificado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fechas importantes */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-400" />
                    </div>
                    Fechas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Fecha de creación:</span>
                      <span className="text-white text-sm">{formatDate(modStats?.fecha_creacion)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded-lg border border-gray-600/20">
                      <span className="text-gray-300 font-medium text-sm">Última actualización:</span>
                      <span className="text-white text-sm">{formatDate(modStats?.fecha_actualizacion)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {modDetails?.descripcion && (
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faFile} className="text-green-400" />
                    </div>
                    Descripción
                  </h3>
                  <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/20">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {modDetails.descripcion}
                    </p>
                  </div>
                </div>
              )}

              {/* Estadísticas del mod */}
              {modStats && (
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faChartLine} className="text-yellow-400" />
                    </div>
                    Estadísticas y Rendimiento
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${getStatCardStyle('downloads')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faDownload} className="text-blue-400 text-lg" />
                        <span className="text-2xl font-bold text-white">
                          {modStats.total_descargas.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Total Descargas</p>
                    </div>

                    <div className={`p-4 rounded-lg ${getStatCardStyle('rating')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-lg" />
                        <span className="text-2xl font-bold text-white">
                          {Number(modStats.valoracion_media).toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Valoración Media</p>
                    </div>

                    <div className={`p-4 rounded-lg ${getStatCardStyle('reviews')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faUser} className="text-purple-400 text-lg" />
                        <span className="text-2xl font-bold text-white">
                          {modStats.total_valoraciones.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Total Valoraciones</p>
                    </div>

                    <div className={`p-4 rounded-lg ${getStatCardStyle('comments')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faComments} className="text-pink-400 text-lg" />
                        <span className="text-2xl font-bold text-white">
                          {modStats.total_comentarios.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Comentarios</p>
                    </div>

                    <div className={`p-4 rounded-lg ${getStatCardStyle('views')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faEye} className="text-cyan-400 text-lg" />
                        <span className="text-2xl font-bold text-white">
                          {modStats.visitas ? modStats.visitas.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Visitas</p>
                    </div>

                    <div className={`p-4 rounded-lg ${getStatCardStyle('favorites')}`}>
                      <div className="flex items-center justify-between mb-2">
                        <FontAwesomeIcon icon={faHeart} className="text-green-400 text-lg" />
                        <span className="text-2xl font-bold text-white">
                          {modStats.favoritos ? modStats.favoritos.toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">Favoritos</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Etiquetas */}
              {modDetails?.etiquetas && modDetails.etiquetas.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faTag} className="text-indigo-400" />
                    </div>
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {modDetails.etiquetas.map((etiqueta, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                      >
                        {etiqueta.nombre || etiqueta}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enlaces y accesos directos */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 rounded-lg mr-2">
                    <FontAwesomeIcon icon={faGlobe} className="text-cyan-400" />
                  </div>
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href={`/mods/${modDetails?.id || mod?.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500/20 to-blue-600/30 hover:from-blue-500/30 hover:to-blue-600/40 text-blue-300 px-4 py-3 rounded-lg transition-all duration-300 border border-blue-500/30"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                    <span>Ver en Frontend</span>
                  </a>
                  
                  {modDetails?.url && (
                    <a
                      href={modDetails.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500/20 to-green-600/30 hover:from-green-500/30 hover:to-green-600/40 text-green-300 px-4 py-3 rounded-lg transition-all duration-300 border border-green-500/30"
                    >
                      <FontAwesomeIcon icon={faDownload} />
                      <span>Descargar Mod</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
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

export default ModViewModal; 