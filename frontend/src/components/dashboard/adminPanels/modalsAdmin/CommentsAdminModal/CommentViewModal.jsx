import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faComment, faUser, faGamepad, faCalendarAlt, faEdit, faEye } from '@fortawesome/free-solid-svg-icons';

const CommentViewModal = ({ isOpen, onClose, comment }) => {
  if (!isOpen || !comment) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-3xl h-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-700/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between p-3 sm:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg">
                <FontAwesomeIcon icon={faEye} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Detalles del Comentario
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  ID: {comment.id} | Visualización completa
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content - Área scrolleable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar min-h-0">
          <div className="space-y-6">
            {/* Información principal del comentario */}
            <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FontAwesomeIcon icon={faComment} className="text-blue-400" />
                <h4 className="text-lg font-semibold text-blue-300">Contenido del Comentario</h4>
              </div>
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {comment.contenido}
                </p>
              </div>
            </div>

            {/* Información del contexto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Usuario */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg">
                    <FontAwesomeIcon icon={faUser} className="text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Usuario Autor</h4>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-gray-600/50">
                    {comment.usuario?.foto_perfil ? (
                      <img
                        src={comment.usuario.foto_perfil}
                        alt={comment.usuario.nome}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="text-gray-400 text-lg" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-base">
                      {comment.usuario?.nome || 'Usuario eliminado'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ID: {comment.usuario_id}
                    </p>
                  </div>
                </div>

                {comment.usuario && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-gray-300">{comment.usuario.correo || 'No disponible'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rol:</span>
                      <span className={`font-medium ${
                        comment.usuario.rol === 'admin' ? 'text-purple-400' : 'text-blue-400'
                      }`}>
                        {comment.usuario.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mod */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg">
                    <FontAwesomeIcon icon={faGamepad} className="text-green-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-white">Mod Asociado</h4>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-gray-600/50">
                    {comment.mod?.imagen ? (
                      <img
                        src={comment.mod.imagen}
                        alt={comment.mod.titulo}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faGamepad} className="text-gray-400 text-lg" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-base">
                      {comment.mod?.titulo || 'Mod eliminado'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ID: {comment.mod_id}
                    </p>
                  </div>
                </div>

                {comment.mod && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className={`font-medium ${
                        comment.mod.estado === 'publicado' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {comment.mod.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creador:</span>
                      <span className="text-gray-300">{comment.mod.creador?.nome || 'No disponible'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información temporal */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 rounded-lg">
                  <FontAwesomeIcon icon={faCalendarAlt} className="text-yellow-400" />
                </div>
                <h4 className="text-lg font-semibold text-white">Información Temporal</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-400 text-sm" />
                    <span className="text-blue-300 font-medium text-sm">Fecha de Creación</span>
                  </div>
                  <p className="text-white font-medium">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon icon={faEdit} className="text-purple-400 text-sm" />
                    <span className="text-purple-300 font-medium text-sm">Última Modificación</span>
                  </div>
                  <p className="text-white font-medium">
                    {comment.updated_at !== comment.created_at 
                      ? formatDate(comment.updated_at)
                      : 'Sin modificaciones'
                    }
                  </p>
                  {comment.updated_at !== comment.created_at && (
                    <div className="flex items-center space-x-1 mt-2">
                      <FontAwesomeIcon icon={faEdit} className="text-yellow-400 text-xs" />
                      <span className="text-yellow-400 text-xs font-medium">Comentario editado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas adicionales */}
            <div className="bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FontAwesomeIcon icon={faComment} className="text-green-400" />
                <h4 className="text-sm font-medium text-green-300">Estadísticas del Comentario</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{comment.contenido.length}</div>
                  <div className="text-gray-400">Caracteres</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{comment.contenido.split(' ').length}</div>
                  <div className="text-gray-400">Palabras</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{comment.contenido.split('\n').length}</div>
                  <div className="text-gray-400">Líneas</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    comment.updated_at !== comment.created_at ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {comment.updated_at !== comment.created_at ? 'Editado' : 'Original'}
                  </div>
                  <div className="text-gray-400">Estado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-3 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-3 sm:px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CommentViewModal; 