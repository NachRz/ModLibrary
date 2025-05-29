import React, { useState, useEffect } from 'react';
import adminService from '../../../services/api/adminService';
import UserEditModalAdmin from './modalsAdmin/UsersAdminModal/UserEditModalAdmin';
import { UserHasModsModal, FinalConfirmationModal } from './modalsAdmin/UsersAdminModal/UserDeleteConfirmationModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { NotificationsAdminUserDeleteProvider, useAdminUserDeleteNotifications } from '../../../context/notifications/notificationsAdmin/NotificationsAdminUserDelete';

const UsuariosAdminContent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para los modales de eliminación
  const [showUserHasModsModal, setShowUserHasModsModal] = useState(false);
  const [showFinalConfirmationModal, setShowFinalConfirmationModal] = useState(false);
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
    
    try {
      // Intentar eliminación normal primero
      await adminService.deleteUser(userId);
      
      // Si llegamos aquí, el usuario se eliminó sin problemas
      setUsuarios(prev => prev.filter(user => user.id !== userId));
      showNotification('Usuario eliminado correctamente', 'success');
      
    } catch (error) {
      // Si el error es porque tiene mods, mostrar flujo de confirmación
      if (error.message && error.message.includes('mods publicados')) {
        setShowUserHasModsModal(true);
      } else {
        // Error diferente
        showNotification(error.message || 'Error al eliminar usuario', 'error');
      }
    }
  };

  const handleUserHasModsConfirm = () => {
    setShowUserHasModsModal(false);
    setShowFinalConfirmationModal(true);
  };

  const handleFinalConfirmation = async () => {
    try {
      await adminService.forceDeleteUser(userToDelete.id);
      setUsuarios(prev => prev.filter(user => user.id !== userToDelete.id));
      showNotification(
        `Usuario "${userToDelete.nome}" y todos sus mods eliminados correctamente`, 
        'success'
      );
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
      {/* Header y búsqueda */}
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

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Total Usuarios</h3>
          <p className="text-2xl font-bold text-white">{usuarios.length}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Activos</h3>
          <p className="text-2xl font-bold text-green-400">
            {usuarios.filter(u => u.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Administradores</h3>
          <p className="text-2xl font-bold text-purple-400">
            {usuarios.filter(u => u.rol === 'admin').length}
          </p>
        </div>
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
                <th className="px-6 py-3 text-gray-300 font-medium">Rol</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Estado</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Registro</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredUsuarios.map((usuario) => (
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
                    <select
                      value={usuario.estado}
                      onChange={(e) => handleStatusChange(usuario.id, e.target.value)}
                      className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-purple-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="suspendido">Suspendido</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{usuario.fecha_registro}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(usuario)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(usuario.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsuarios.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">No se encontraron usuarios con ese criterio de búsqueda.</p>
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
        onConfirm={handleUserHasModsConfirm}
        onCancel={handleCancelModals}
        isOpen={showUserHasModsModal}
      />

      <FinalConfirmationModal
        userName={userToDelete?.nome}
        onConfirm={handleFinalConfirmation}
        onCancel={handleCancelModals}
        isOpen={showFinalConfirmationModal}
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