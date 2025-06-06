import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faSpinner, faExclamationTriangle, faUser, faGamepad, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import adminService from '../../../../../services/api/adminService';
import { useNotification } from '../../../../../context/NotificationContext';

const CommentDeleteModal = ({ isOpen, onClose, comment, onCommentDeleted }) => {
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await adminService.deleteComentario(comment.id);

      if (response.status === 'success') {
        onCommentDeleted(comment.id);
        showNotification('Comentario eliminado exitosamente', 'success');
        onClose();
      }
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      setError(err.message || 'Error al eliminar el comentario');
      showNotification('Error al eliminar el comentario', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

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

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-lg h-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-red-500/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-red-600/10 to-red-700/10 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between p-3 sm:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-lg">
                <FontAwesomeIcon icon={faTrashAlt} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Eliminar Comentario
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  ID: {comment.id} | Acción irreversible
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Content - Área scrolleable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar min-h-0">
          <div className="space-y-6">
            {/* Advertencia principal */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-xl" />
                <h4 className="text-lg font-semibold text-red-300">¡Advertencia!</h4>
              </div>
              <p className="text-red-200 leading-relaxed">
                Esta acción eliminará permanentemente el comentario y <strong>no se puede deshacer</strong>.
                Una vez eliminado, el comentario desaparecerá completamente del sistema.
              </p>
            </div>

            {/* Vista previa del comentario a eliminar */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
              <div className="flex items-center space-x-2 mb-3">
                <FontAwesomeIcon icon={faTrash} className="text-yellow-400" />
                <h4 className="text-lg font-semibold text-white">Comentario a Eliminar</h4>
              </div>

              <div className="bg-gradient-to-br from-red-500/5 to-red-600/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {truncateText(comment.contenido, 150)}
                </p>
                {comment.contenido.length > 150 && (
                  <p className="text-gray-400 text-xs mt-2 italic">
                    ... contenido truncado ({comment.contenido.length} caracteres total)
                  </p>
                )}
              </div>
            </div>

            {/* Información del contexto */}
            <div className="grid grid-cols-1 gap-4">
              {/* Usuario */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg">
                    <FontAwesomeIcon icon={faUser} className="text-blue-400 text-sm" />
                  </div>
                  <h4 className="font-semibold text-white">Autor del comentario</h4>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-gray-600/50">
                    {comment.usuario?.foto_perfil ? (
                      <img
                        src={comment.usuario.foto_perfil}
                        alt={comment.usuario.nome}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {comment.usuario?.nome || 'Usuario eliminado'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ID: {comment.usuario_id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mod */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg">
                    <FontAwesomeIcon icon={faGamepad} className="text-green-400 text-sm" />
                  </div>
                  <h4 className="font-semibold text-white">Mod asociado</h4>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-gray-600/50">
                    {comment.mod?.imagen_principal ? (
                      <img
                        src={comment.mod.imagen_principal}
                        alt={comment.mod.nombre}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faGamepad} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {comment.mod?.nombre || 'Mod eliminado'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      ID: {comment.mod_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información temporal */}
            <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FontAwesomeIcon icon={faTrash} className="text-yellow-400" />
                <h4 className="text-sm font-medium text-yellow-300">Información del comentario</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">Creado el</span>
                  <span className="text-yellow-200 font-medium">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">Caracteres</span>
                  <span className="text-yellow-200 font-medium">
                    {comment.contenido.length} caracteres
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-3 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-3 sm:px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center space-x-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
            >
              <FontAwesomeIcon
                icon={loading ? faSpinner : faTrashAlt}
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">{loading ? 'Eliminando...' : 'Eliminar Comentario'}</span>
              <span className="sm:hidden">{loading ? 'Eliminando...' : 'Eliminar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CommentDeleteModal; 