import React, { useState, useEffect } from 'react';
import adminService from '../../../services/api/adminService';
import comentarioService from '../../../services/api/comentarioService';
import CommentEditModal from './modalsAdmin/CommentsAdminModal/CommentEditModal';
import CommentDeleteModal from './modalsAdmin/CommentsAdminModal/CommentDeleteModal';
import CommentViewModal from './modalsAdmin/CommentsAdminModal/CommentViewModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash, faEye, faComment, faUser, faGamepad } from '@fortawesome/free-solid-svg-icons';
import Pagination from '../../common/Pagination';
import { useNotification } from '../../../context/NotificationContext';
import '../../../assets/styles/components/dashboard/adminPanel/adminTables.css';

const ComentariosAdmin = () => {
  const { showNotification } = useNotification();
  
  // Estados principales
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMod, setFiltroMod] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  
  // Estados de modales
  const [editModal, setEditModal] = useState({ isOpen: false, comment: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, comment: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, comment: null });
  
  // Cargar comentarios
  const loadComentarios = async (page = 1, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        per_page: itemsPerPage,
        search: searchTerm,
        mod_filter: filtroMod,
        user_filter: filtroUsuario,
        ...filters
      };
      
      // Aquí necesitaremos crear un endpoint específico para admin
      const response = await adminService.getComentarios(params);
      
      if (response.status === 'success') {
        console.log('Comentarios recibidos:', response.data.data);
        // Log para verificar los datos del mod
        response.data.data?.forEach((comment, index) => {
          console.log(`Comentario ${index}:`, {
            id: comment.id,
            mod: comment.mod,
            mod_id: comment.mod_id
          });
        });
        setComentarios(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalItems(response.data.total || 0);
        setCurrentPage(response.data.current_page || 1);
      }
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError('Error al cargar la lista de comentarios');
      showNotification('Error al cargar comentarios', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadComentarios(1);
  }, []);
  
  // Efecto para filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadComentarios(1);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filtroMod, filtroUsuario]);
  
  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Manejar filtros
  const handleModFilter = (e) => {
    setFiltroMod(e.target.value);
    setCurrentPage(1);
  };
  
  const handleUserFilter = (e) => {
    setFiltroUsuario(e.target.value);
    setCurrentPage(1);
  };
  
  // Manejar paginación
  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadComentarios(page);
  };
  
  // Abrir modales
  const openEditModal = (comment) => {
    setEditModal({ isOpen: true, comment });
  };
  
  const openDeleteModal = (comment) => {
    setDeleteModal({ isOpen: true, comment });
  };
  
  const openViewModal = (comment) => {
    setViewModal({ isOpen: true, comment });
  };
  
  // Cerrar modales
  const closeEditModal = () => {
    setEditModal({ isOpen: false, comment: null });
  };
  
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, comment: null });
  };
  
  const closeViewModal = () => {
    setViewModal({ isOpen: false, comment: null });
  };
  
  // Manejar actualización de comentario
  const handleCommentUpdated = (updatedComment) => {
    setComentarios(prevComentarios =>
      prevComentarios.map(comment =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
    closeEditModal();
    showNotification('Comentario actualizado exitosamente', 'success');
  };
  
  // Manejar eliminación de comentario
  const handleCommentDeleted = (deletedCommentId) => {
    setComentarios(prevComentarios =>
      prevComentarios.filter(comment => comment.id !== deletedCommentId)
    );
    closeDeleteModal();
    showNotification('Comentario eliminado exitosamente', 'success');
    
    // Recargar si la página actual queda vacía
    if (comentarios.length === 1 && currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Truncar texto
  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  if (loading && comentarios.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Cargando comentarios...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">Gestión de Comentarios</h2>
          <p className="text-sm text-gray-400 mt-1">
            Administra todos los comentarios del sistema ({totalItems} total)
          </p>
        </div>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="bg-custom-card rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por contenido */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por contenido..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* Filtro por mod */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faGamepad} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Filtrar por mod..."
              value={filtroMod}
              onChange={handleModFilter}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* Filtro por usuario */}
          <div className="relative">
            <FontAwesomeIcon 
              icon={faUser} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Filtrar por usuario..."
              value={filtroUsuario}
              onChange={handleUserFilter}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => loadComentarios(currentPage)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Intentar nuevamente
          </button>
        </div>
      )}
      
      {/* Tabla de comentarios */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-user">Usuario</th>
                <th className="col-name">Mod</th>
                <th className="col-content">Contenido</th>
                <th className="col-date">Fecha</th>
                <th className="actions-column">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comentarios.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        {comment.usuario?.foto_perfil ? (
                          <img
                            src={comment.usuario.foto_perfil}
                            alt={comment.usuario.nome}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUser} className="text-gray-400 text-sm" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {comment.usuario?.nome || 'Usuario eliminado'}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {comment.usuario_id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {comment.mod?.titulo || 'Mod eliminado'}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {comment.mod_id}
                      </p>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-gray-300">
                      {truncateText(comment.contenido, 60)}
                    </p>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm text-gray-300">
                        {formatDate(comment.created_at)}
                      </p>
                      {comment.updated_at !== comment.created_at && (
                        <p className="text-xs text-yellow-400">
                          Editado
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons-container">
                      <button
                        onClick={() => openViewModal(comment)}
                        className="action-btn-text view"
                        title="Ver detalles"
                      >
                        <FontAwesomeIcon icon={faEye} className="action-btn-icon" />
                        <span className="btn-text-full">Ver</span>
                        <span className="btn-text-short">V</span>
                      </button>
                      <button
                        onClick={() => openEditModal(comment)}
                        className="action-btn-text edit"
                        title="Editar comentario"
                      >
                        <FontAwesomeIcon icon={faEdit} className="action-btn-icon" />
                        <span className="btn-text-full">Editar</span>
                        <span className="btn-text-short">E</span>
                      </button>
                      <button
                        onClick={() => openDeleteModal(comment)}
                        className="action-btn-text delete"
                        title="Eliminar comentario"
                      >
                        <FontAwesomeIcon icon={faTrash} className="action-btn-icon" />
                        <span className="btn-text-full">Eliminar</span>
                        <span className="btn-text-short">X</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {comentarios.length === 0 && !loading && (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faComment} className="text-6xl text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No hay comentarios</h3>
            <p className="text-gray-500">
              {searchTerm || filtroMod || filtroUsuario
                ? 'No se encontraron comentarios con los filtros aplicados'
                : 'Aún no hay comentarios en el sistema'
              }
            </p>
          </div>
        )}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* Modales */}
      <CommentViewModal
        isOpen={viewModal.isOpen}
        onClose={closeViewModal}
        comment={viewModal.comment}
      />
      
      <CommentEditModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        comment={editModal.comment}
        onCommentUpdated={handleCommentUpdated}
      />
      
      <CommentDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        comment={deleteModal.comment}
        onCommentDeleted={handleCommentDeleted}
      />
    </div>
  );
};

export default ComentariosAdmin; 