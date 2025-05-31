import React, { useState, useEffect } from 'react';
import adminService from '../../../services/api/adminService';
import UserEditModalAdmin from './modalsAdmin/UsersAdminModal/UserEditModalAdmin';
import { UserHasModsModal, FinalConfirmationModal, PermanentDeleteModal } from './modalsAdmin/UsersAdminModal/UserDeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash, faUndo, faTrashAlt, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import { NotificationsAdminUserDeleteProvider, useAdminUserDeleteNotifications } from '../../../context/notifications/notificationsAdmin/NotificationsAdminUserDelete';
import Pagination from '../../common/Pagination';
import CreateUserAdminModal from './modalsAdmin/UsersAdminModal/CreateUserAdminModal';
import UserProfileViewModal from './modalsAdmin/UsersAdminModal/UserProfileViewModal';
import '../../../assets/styles/components/dashboard/adminPanel/adminTables.css';

const UsuariosAdminContent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // Nueva pestaña activa
  const [deletedUsers, setDeletedUsers] = useState([]); // Usuarios eliminados
  
  // Estados para los nuevos modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Estados para los modales de eliminación
  const [showUserHasModsModal, setShowUserHasModsModal] = useState(false);
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { showNotification } = useAdminUserDeleteNotifications();

  // Cargar usuarios desde la API
  useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar todos los datos iniciales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar ambos tipos de datos en paralelo
      const [usersResponse, deletedUsersResponse] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getDeletedUsers()
      ]);
      
      setUsuarios(usersResponse.data || []);
      setDeletedUsers(deletedUsersResponse.data || []);
    } catch (error) {
      setError(error.message || 'Error al cargar datos');
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAllUsers();
      setUsuarios(response.data || []);
    } catch (error) {
      setError(error.message || 'Error al cargar usuarios');
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeletedUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getDeletedUsers();
      setDeletedUsers(response.data || []);
    } catch (error) {
      setError(error.message || 'Error al cargar usuarios eliminados');
      console.error('Error al cargar usuarios eliminados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar pestaña y cargar datos correspondientes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'active') {
      loadUsers();
    } else {
      loadDeletedUsers();
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await adminService.restoreUser(userId);
      setDeletedUsers(prev => prev.filter(user => user.id !== userId));
      showNotification('Usuario restaurado correctamente', 'success');
    } catch (error) {
      showNotification(error.message || 'Error al restaurar usuario', 'error');
    }
  };

  const handlePermanentDelete = async (userId) => {
    const user = deletedUsers.find(u => u.id === userId);
    setUserToDelete(user);
    setShowPermanentDeleteModal(true);
  };

  const handlePermanentDeleteKeepMods = async () => {
    try {
      await adminService.permanentDeleteUser(userToDelete.id);
      setDeletedUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      showNotification(
        `Usuario "${userToDelete.nome}" eliminado definitivamente (mods mantenidos)`, 
        'success'
      );
      setShowPermanentDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      showNotification(error.message || 'Error al eliminar usuario definitivamente', 'error');
    }
  };

  const handlePermanentDeleteWithMods = async () => {
    try {
      await adminService.permanentDeleteUserWithMods(userToDelete.id);
      setDeletedUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      showNotification(
        `Usuario "${userToDelete.nome}" y todos sus mods eliminados definitivamente`, 
        'success'
      );
      setShowPermanentDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      showNotification(error.message || 'Error al eliminar usuario con mods definitivamente', 'error');
    }
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.nombre_completo && usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Lógica de paginación para usuarios activos
  const totalPagesActive = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const startIndexActive = (currentPage - 1) * itemsPerPage;
  const endIndexActive = startIndexActive + itemsPerPage;
  const paginatedUsuarios = filteredUsuarios.slice(startIndexActive, endIndexActive);

  // Filtrado y paginación para usuarios eliminados
  const filteredDeletedUsers = deletedUsers.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (usuario.nombre_completo && usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPagesDeleted = Math.ceil(filteredDeletedUsers.length / itemsPerPage);
  const startIndexDeleted = (currentPage - 1) * itemsPerPage;
  const endIndexDeleted = startIndexDeleted + itemsPerPage;
  const paginatedDeletedUsers = filteredDeletedUsers.slice(startIndexDeleted, endIndexDeleted);

  // Resetear página cuando cambian los filtros o pestañas
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsuarios(prev => prev.map(user => 
        user.id === userId ? { ...user, rol: newRole } : user
      ));
      showNotification(`Rol actualizado correctamente`, 'success');
    } catch (error) {
      showNotification(error.message || 'Error al actualizar rol', 'error');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsuarios(prev => prev.map(user => 
        user.id === userId ? { ...user, estado: newStatus } : user
      ));
      showNotification(`Estado actualizado correctamente`, 'success');
    } catch (error) {
      showNotification(error.message || 'Error al actualizar estado', 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      // Actualizar el usuario en la lista local
      setUsuarios(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      // Recargar los datos del usuario para asegurar que las estadísticas estén actualizadas
      // Esto es especialmente importante si se ha navegado desde la edición de mods
      await loadUsers();
    } catch (error) {
      console.error('Error al recargar usuarios:', error);
      // Mostrar notificación si hay un error
      showNotification('Usuario actualizado, pero hubo un problema al recargar los datos', 'warning');
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = usuarios.find(u => u.id === userId);
    setUserToDelete(user);
    
    // Siempre mostrar el modal de opciones (tanto para usuarios con mods como sin mods)
    setShowUserHasModsModal(true);
  };

  const handleUserHasModsConfirm = () => {
    setShowUserHasModsModal(false);
    setShowFinalConfirmationModal(true);
  };

  const handleSoftDelete = async () => {
    try {
      await adminService.softDeleteUser(userToDelete.id);
      setUsuarios(prev => prev.filter(user => user.id !== userToDelete.id));
      showNotification(
        `Usuario "${userToDelete.nome}" desactivado correctamente (los mods se mantienen)`, 
        'success'
      );
      setShowUserHasModsModal(false);
      setUserToDelete(null);
    } catch (softError) {
      showNotification(
        softError.message || 'Error al desactivar usuario', 
        'error'
      );
    }
  };

  const handleFinalConfirmation = async () => {
    try {
      if (userToDelete.tiene_mods) {
        // Usuario con mods - eliminar forzadamente (mantiene mods huérfanos)
        await adminService.forceDeleteUser(userToDelete.id);
        showNotification(
          `Usuario "${userToDelete.nome}" eliminado correctamente (los mods se mantienen)`, 
          'success'
        );
      } else {
        // Usuario sin mods - eliminación normal
        await adminService.deleteUser(userToDelete.id);
        showNotification(
          `Usuario "${userToDelete.nome}" eliminado correctamente`, 
          'success'
        );
      }
      
      setUsuarios(prev => prev.filter(user => user.id !== userToDelete.id));
      setShowFinalConfirmationModal(false);
      setUserToDelete(null);
    } catch (forceError) {
      showNotification(
        forceError.message || 'Error al eliminar usuario', 
        'error'
      );
    }
  };

  const handleCancelModals = () => {
    setShowUserHasModsModal(false);
    setShowFinalConfirmationModal(false);
    setShowPermanentDeleteModal(false);
    setUserToDelete(null);
  };

  // Funciones para los nuevos modales
  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleUserCreated = (newUser) => {
    setUsuarios(prev => [newUser, ...prev]);
    showNotification(`Usuario "${newUser.nome}" creado correctamente`, 'success');
  };

  const handleViewProfile = (user) => {
    setViewingUser(user);
    setIsProfileModalOpen(true);
  };

  const handleEditFromProfile = (user) => {
    setIsProfileModalOpen(false);
    setViewingUser(null);
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Componente para mostrar avatar del usuario
  const UserAvatar = ({ user }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <div className="flex items-center">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 overflow-hidden">
          {user.foto_perfil && !imageError ? (
            <img 
              src={user.foto_perfil} 
              alt={`Avatar de ${user.nome}`}
              className="w-8 h-8 rounded-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <span className="text-white font-medium">
              {user.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-white font-medium">{user.nome}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded">
        <p className="font-medium">Error al cargar usuarios</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={loadInitialData}
          className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y pestañas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Gestión de Usuarios</h2>
          <p className="text-gray-400">Administra los usuarios del sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          {activeTab === 'active' && (
            <button
              onClick={handleCreateUser}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Crear Usuario</span>
            </button>
          )}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-64"
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="border-b border-gray-600">
        <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => handleTabChange('active')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'active'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
          }`}
        >
            Usuarios Activos ({usuarios.length})
        </button>
        <button
          onClick={() => handleTabChange('deleted')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'deleted'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
          }`}
        >
            Usuarios Eliminados ({deletedUsers.length})
        </button>
        </nav>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">
            {activeTab === 'active' ? 'Total Usuarios' : 'Usuarios Eliminados'}
          </h3>
          <p className="text-2xl font-bold text-white">
            {activeTab === 'active' ? usuarios.length : deletedUsers.length}
          </p>
        </div>
        {activeTab === 'active' && (
          <>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-300 text-sm">Con Mods</h3>
              <p className="text-2xl font-bold text-yellow-400">
                {usuarios.filter(u => u.tiene_mods).length}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-300 text-sm">Administradores</h3>
              <p className="text-2xl font-bold text-purple-400">
                {usuarios.filter(u => u.rol === 'admin').length}
              </p>
            </div>
          </>
        )}
        {activeTab === 'deleted' && (
          <>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-300 text-sm">Con Mods</h3>
              <p className="text-2xl font-bold text-yellow-400">
                {deletedUsers.filter(u => u.tiene_mods).length}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-300 text-sm">Sin Mods</h3>
              <p className="text-2xl font-bold text-blue-400">
                {deletedUsers.filter(u => !u.tiene_mods).length}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Tabla de usuarios */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="col-user">Usuario</th>
                <th className="col-email hidden sm:table-cell">Correo</th>
                <th className="col-name hidden md:table-cell">Nombre Completo</th>
                {activeTab === 'active' ? (
                  <>
                    <th className="col-role">Rol</th>
                    <th className="col-status hidden lg:table-cell">Mods</th>
                    <th className="col-date hidden lg:table-cell">Registro</th>
                  </>
                ) : (
                  <>
                    <th className="col-role hidden lg:table-cell">Rol</th>
                    <th className="col-status hidden lg:table-cell">Mods</th>
                    <th className="col-date hidden lg:table-cell">Eliminado</th>
                  </>
                )}
                <th className="actions-column">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'active' ? (
                paginatedUsuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="col-user">
                      <UserAvatar user={usuario} />
                    </td>
                    <td className="col-email text-cell hidden sm:table-cell">{usuario.correo}</td>
                    <td className="col-name text-cell hidden md:table-cell">
                      {usuario.nombre_completo || 'No especificado'}
                    </td>
                    <td className="col-role">
                      <select
                        value={usuario.rol}
                        onChange={(e) => handleRoleChange(usuario.id, e.target.value)}
                        className="bg-gray-600 text-white px-2 py-1 rounded border border-gray-500 focus:border-purple-500 text-xs w-full max-w-[80px]"
                      >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="col-status hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.tiene_mods 
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' 
                          : 'bg-blue-500 bg-opacity-20 text-blue-400'
                      }`}>
                        {usuario.tiene_mods ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="col-date text-cell hidden lg:table-cell">{usuario.fecha_registro}</td>
                    <td className="actions-column">
                      <div className="action-buttons-container">
                        <button 
                          onClick={() => handleViewProfile(usuario)}
                          className="action-btn-text view"
                          title="Ver perfil"
                        >
                          <FontAwesomeIcon icon={faEye} className="action-btn-icon" />
                          <span className="btn-text-full">Ver</span>
                          <span className="btn-text-short">V</span>
                        </button>
                        <button 
                          onClick={() => handleEditUser(usuario)}
                          className="action-btn-text edit"
                          title="Editar usuario"
                        >
                          <FontAwesomeIcon icon={faEdit} className="action-btn-icon" />
                          <span className="btn-text-full">Editar</span>
                          <span className="btn-text-short">E</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(usuario.id)}
                          className="action-btn-text delete"
                          title="Eliminar usuario"
                        >
                          <FontAwesomeIcon icon={faTrash} className="action-btn-icon" />
                          <span className="btn-text-full">Eliminar</span>
                          <span className="btn-text-short">X</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                paginatedDeletedUsers.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="col-user">
                      <UserAvatar user={usuario} />
                    </td>
                    <td className="col-email text-cell hidden sm:table-cell">{usuario.correo}</td>
                    <td className="col-name text-cell hidden md:table-cell">
                      {usuario.nombre_completo || 'No especificado'}
                    </td>
                    <td className="col-role text-cell hidden lg:table-cell">{usuario.rol}</td>
                    <td className="col-status hidden lg:table-cell">
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.tiene_mods 
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' 
                          : 'bg-blue-500 bg-opacity-20 text-blue-400'
                      }`}>
                        {usuario.tiene_mods ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="col-date text-cell hidden lg:table-cell">{usuario.fecha_eliminacion}</td>
                    <td className="actions-column">
                      <div className="action-buttons-container">
                        <button 
                          onClick={() => handleRestoreUser(usuario.id)}
                          className="action-btn-text restore"
                          title="Restaurar usuario"
                        >
                          <FontAwesomeIcon icon={faUndo} className="action-btn-icon" />
                          <span className="btn-text-full">Restaurar</span>
                          <span className="btn-text-short">R</span>
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(usuario.id)}
                          className="action-btn-text delete"
                          title="Eliminar definitivamente"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="action-btn-icon" />
                          <span className="btn-text-full">Eliminar</span>
                          <span className="btn-text-short">X</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeTab === 'active' && paginatedUsuarios.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No se encontraron usuarios activos con ese criterio de búsqueda.</p>
        </div>
      )}

      {activeTab === 'deleted' && paginatedDeletedUsers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No hay usuarios eliminados.</p>
        </div>
      )}

      {/* Paginación */}
      {((activeTab === 'active' && filteredUsuarios.length > 0) || 
        (activeTab === 'deleted' && filteredDeletedUsers.length > 0)) && (
        <Pagination
          currentPage={currentPage}
          totalPages={activeTab === 'active' ? totalPagesActive : totalPagesDeleted}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={activeTab === 'active' ? filteredUsuarios.length : filteredDeletedUsers.length}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Modal de edición */}
      <UserEditModalAdmin
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />

      {/* Modales de eliminación */}
      <UserHasModsModal
        userName={userToDelete?.nome}
        userHasMods={userToDelete?.tiene_mods}
        onConfirm={handleUserHasModsConfirm}
        onSoftDelete={handleSoftDelete}
        onCancel={handleCancelModals}
        isOpen={showUserHasModsModal}
      />

      <FinalConfirmationModal
        userName={userToDelete?.nome}
        userHasMods={userToDelete?.tiene_mods}
        onConfirm={handleFinalConfirmation}
        onCancel={handleCancelModals}
        isOpen={showFinalConfirmationModal}
      />

      <PermanentDeleteModal
        userName={userToDelete?.nome}
        onDeleteKeepMods={handlePermanentDeleteKeepMods}
        onDeleteWithMods={handlePermanentDeleteWithMods}
        onCancel={handleCancelModals}
        isOpen={showPermanentDeleteModal}
      />

      {/* Nuevos modales */}
      <CreateUserAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <UserProfileViewModal
        user={viewingUser}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setViewingUser(null);
        }}
        onEdit={handleEditFromProfile}
      />
    </div>
  );
};

// Componente principal con provider
const UsuariosAdmin = () => {
  return (
    <NotificationsAdminUserDeleteProvider>
      <UsuariosAdminContent />
    </NotificationsAdminUserDeleteProvider>
  );
};

export default UsuariosAdmin; 