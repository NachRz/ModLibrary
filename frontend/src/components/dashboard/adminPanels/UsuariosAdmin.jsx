import React, { useState, useEffect } from 'react';
import adminService from '../../../services/api/adminService';
import UserEditModalAdmin from './modalsAdmin/UsersAdminModal/UserEditModalAdmin';
import { UserHasModsModal, FinalConfirmationModal, PermanentDeleteModal } from './modalsAdmin/UsersAdminModal/UserDeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEdit, faTrash, faUndo, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { NotificationsAdminUserDeleteProvider, useAdminUserDeleteNotifications } from '../../../context/notifications/notificationsAdmin/NotificationsAdminUserDelete';

const UsuariosAdminContent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // Nueva pestaña activa
  const [deletedUsers, setDeletedUsers] = useState([]); // Usuarios eliminados
  
  // Estados para los modales de eliminación
  const [showUserHasModsModal, setShowUserHasModsModal] = useState(false);
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState(false);
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { showNotification } = useAdminUserDeleteNotifications();

  // Cargar usuarios desde la API
  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleSaveUser = (updatedUser) => {
    setUsuarios(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
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
          onClick={loadUsers}
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

      {/* Pestañas */}
      <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => handleTabChange('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'bg-purple-500 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          Usuarios Activos
        </button>
        <button
          onClick={() => handleTabChange('deleted')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'deleted'
              ? 'bg-purple-500 text-white'
              : 'text-gray-300 hover:text-white hover:bg-gray-600'
          }`}
        >
          Usuarios Eliminados
        </button>
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
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-gray-300 font-medium">Usuario</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Correo</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Nombre Completo</th>
                {activeTab === 'active' ? (
                  <>
                    <th className="px-6 py-3 text-gray-300 font-medium">Rol</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Mods</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Registro</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-gray-300 font-medium">Rol</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Mods</th>
                    <th className="px-6 py-3 text-gray-300 font-medium">Eliminado</th>
                  </>
                )}
                <th className="px-6 py-3 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {activeTab === 'active' ? (
                filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <UserAvatar user={usuario} />
                    </td>
                    <td className="px-6 py-4 text-gray-300">{usuario.correo}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {usuario.nombre_completo || 'No especificado'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={usuario.rol}
                        onChange={(e) => handleRoleChange(usuario.id, e.target.value)}
                        className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-purple-500"
                      >
                        <option value="usuario">Usuario</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.tiene_mods 
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' 
                          : 'bg-blue-500 bg-opacity-20 text-blue-400'
                      }`}>
                        {usuario.tiene_mods ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{usuario.fecha_registro}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditUser(usuario)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 bg-opacity-20 text-blue-400 border border-blue-500 border-opacity-50 rounded-lg hover:bg-blue-500 hover:bg-opacity-30 hover:border-blue-400 transition-all duration-200 text-sm font-medium"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(usuario.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50 rounded-lg hover:bg-red-500 hover:bg-opacity-30 hover:border-red-400 transition-all duration-200 text-sm font-medium"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                deletedUsers.filter(usuario =>
                  usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  usuario.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (usuario.nombre_completo && usuario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-600">
                    <td className="px-6 py-4">
                      <UserAvatar user={usuario} />
                    </td>
                    <td className="px-6 py-4 text-gray-300">{usuario.correo}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {usuario.nombre_completo || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{usuario.rol}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        usuario.tiene_mods 
                          ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' 
                          : 'bg-blue-500 bg-opacity-20 text-blue-400'
                      }`}>
                        {usuario.tiene_mods ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{usuario.fecha_eliminacion}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleRestoreUser(usuario.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50 rounded-lg hover:bg-green-500 hover:bg-opacity-30 hover:border-green-400 transition-all duration-200 text-sm font-medium"
                        >
                          <FontAwesomeIcon icon={faUndo} className="w-3 h-3" />
                          <span>Restaurar</span>
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(usuario.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 border-opacity-50 rounded-lg hover:bg-red-500 hover:bg-opacity-30 hover:border-red-400 transition-all duration-200 text-sm font-medium"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} className="w-3 h-3" />
                          <span>Eliminar Definitivamente</span>
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

      {activeTab === 'active' && filteredUsuarios.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No se encontraron usuarios activos con ese criterio de búsqueda.</p>
        </div>
      )}

      {activeTab === 'deleted' && deletedUsers.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No hay usuarios eliminados.</p>
        </div>
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