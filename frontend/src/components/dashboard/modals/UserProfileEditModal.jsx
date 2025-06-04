import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import userService from '../../../services/api/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEdit,
  faSpinner,
  faSave
} from '@fortawesome/free-solid-svg-icons';

const UserProfileEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apelidos: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Cargar datos del perfil desde el backend cuando se abre el modal
  const loadProfileData = async () => {
    try {
      setLoadingProfile(true);
      const response = await userService.getCurrentProfile();
      
      setFormData({
        nombre: response.data.nombre || '',
        apelidos: response.data.apelidos || ''
      });
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      // Solo usar los datos de props como fallback si no estamos cargando desde el backend
      if (!loadingProfile) {
        setFormData({
          nombre: user.nombre || '',
          apelidos: user.apelidos || ''
        });
      }
      
      setError('');
    }
  }, [user, isOpen, loadingProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData = {
        nombre: formData.nombre,
        apelidos: formData.apelidos
      };

      const response = await userService.updateProfile(updateData);
      
      const updatedUser = {
        ...user,
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      onSave(updatedUser);
      onClose();
    } catch (error) {
      setError(error.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-md h-auto flex flex-col overflow-hidden border border-gray-700/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-custom-primary/10 to-blue-600/10 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex justify-between items-center p-3 sm:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-custom-primary/20 to-custom-primary/40 rounded-lg">
                <FontAwesomeIcon icon={faEdit} className="text-custom-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Editar Mi Perfil
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Actualiza tu información personal</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-lg sm:text-xl hover:rotate-90 transition-transform duration-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-3 sm:p-5">
          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              {error}
            </div>
          )}

          {loadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-custom-primary/20 border-t-custom-primary"></div>
              <span className="ml-3 text-white">Cargando datos del perfil...</span>
            </div>
          ) : (
            <form id="profile-edit-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Información personal */}
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-2">
                    <FontAwesomeIcon icon={faUser} className="text-green-400" />
                  </div>
                  Información Personal
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-custom-primary focus:ring-1 focus:ring-custom-primary transition-all duration-300"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      name="apelidos"
                      value={formData.apelidos}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-custom-primary focus:ring-1 focus:ring-custom-primary transition-all duration-300"
                      placeholder="Tus apellidos"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer con botones */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-3 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
              disabled={loading || loadingProfile}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="profile-edit-form"
              disabled={loading || loadingProfile}
              className="flex items-center space-x-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-custom-primary to-custom-primary/80 hover:from-custom-primary-hover hover:to-custom-primary text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
            >
              <FontAwesomeIcon 
                icon={loading ? faSpinner : faSave} 
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
              />
              <span className="hidden sm:inline">{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
              <span className="sm:hidden">{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default UserProfileEditModal; 