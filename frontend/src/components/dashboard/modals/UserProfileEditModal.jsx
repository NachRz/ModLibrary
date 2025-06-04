import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import userService from '../../../services/api/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEdit,
  faSpinner,
  faSave,
  faImage,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

const UserProfileEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apelidos: '',
    sobre_mi: '',
    foto_perfil: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  // Cargar datos del perfil desde el backend cuando se abre el modal
  const loadProfileData = async () => {
    try {
      setLoadingProfile(true);
      const response = await userService.getCurrentProfile();
      
      const profileData = response.data;
      setFormData({
        nombre: profileData.nombre || '',
        apelidos: profileData.apelidos || '',
        sobre_mi: profileData.sobre_mi || '',
        foto_perfil: profileData.foto_perfil || ''
      });
      
      // Si hay foto de perfil, actualizar el timestamp para la URL
      if (profileData.foto_perfil) {
        const timestamp = Date.now();
        setImageTimestamp(timestamp);
        setPreviewUrl(`http://localhost:8000/storage/${profileData.foto_perfil}?t=${timestamp}`);
      }
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Limpiar estados de archivo al abrir el modal
      setSelectedFile(null);
      setError('');
      
      // Si tenemos datos del usuario del contexto, usarlos inmediatamente como valores iniciales
      if (user) {
        setFormData({
          nombre: user.nombre || '',
          apelidos: user.apelidos || '',
          sobre_mi: user.sobre_mi || '',
          foto_perfil: user.foto_perfil || ''
        });
        
        // Si hay foto de perfil en el contexto, mostrarla inmediatamente
        if (user.foto_perfil) {
          const timestamp = Date.now();
          setImageTimestamp(timestamp);
          setPreviewUrl(`http://localhost:8000/storage/${user.foto_perfil}?t=${timestamp}`);
        } else {
          setPreviewUrl('');
        }
      }
      
      // Luego cargar los datos más actualizados del backend
      loadProfileData();
    } else {
      // Limpiar todo cuando se cierra el modal
      setFormData({
        nombre: '',
        apelidos: '',
        sobre_mi: '',
        foto_perfil: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
      setError('');
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es demasiado grande. Máximo 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Limpiar error previo
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploadingImage(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      
      const response = await userService.uploadProfileImage(uploadFormData);
      
      // Actualizar timestamp para forzar actualización de imagen
      setImageTimestamp(Date.now());
      
      return response.data.url;
    } catch (error) {
      throw new Error('Error al subir la imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setImageTimestamp(Date.now());
    setFormData(prev => ({
      ...prev,
      foto_perfil: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalImageUrl = formData.foto_perfil;
      
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        finalImageUrl = await uploadImage();
      }
      
      const updateData = {
        nombre: formData.nombre,
        apelidos: formData.apelidos,
        sobre_mi: formData.sobre_mi,
        foto_perfil: finalImageUrl || null
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-md h-auto max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-700/50">
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

        {/* Contenido con scroll personalizado */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
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
              <form id="profile-edit-form" onSubmit={handleSubmit} className="space-y-5">
                {/* Foto de perfil */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <label className="block text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faImage} className="text-blue-400" />
                    </div>
                    Foto de Perfil
                  </label>
                  
                  {/* Preview e interfaz de subida */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-custom-primary to-custom-secondary rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {(previewUrl || formData.foto_perfil) ? (
                          <img 
                            src={selectedFile ? previewUrl : `http://localhost:8000/storage/${formData.foto_perfil}?t=${imageTimestamp}`}
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {(user?.nombre || user?.username || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {user?.rol === 'admin' && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faCrown} className="text-white text-xs" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          id="file-upload"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer bg-gradient-to-r from-custom-primary to-custom-primary/80 hover:from-custom-primary-hover hover:to-custom-primary text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 inline-block"
                        >
                          {uploadingImage ? 'Subiendo...' : 'Subir Imagen'}
                        </label>
                        
                        {(previewUrl || selectedFile) && (
                          <button
                            type="button"
                            onClick={clearImage}
                            className="text-red-400 hover:text-red-300 text-sm transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      
                      {selectedFile && (
                        <p className="text-green-400 text-sm">
                          ✓ {selectedFile.name}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400">
                        Formatos: JPG, PNG, GIF. Máximo 5MB
                      </p>
                    </div>
                  </div>
                </div>

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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Sobre Mi
                      </label>
                      <textarea
                        name="sobre_mi"
                        value={formData.sobre_mi}
                        onChange={handleChange}
                        className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-custom-primary focus:ring-1 focus:ring-custom-primary transition-all duration-300"
                        placeholder="Escribe algo sobre ti"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer con botones */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-3 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
              disabled={loading || loadingProfile || uploadingImage}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="profile-edit-form"
              disabled={loading || loadingProfile || uploadingImage}
              className="flex items-center space-x-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-custom-primary to-custom-primary/80 hover:from-custom-primary-hover hover:to-custom-primary text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
            >
              <FontAwesomeIcon 
                icon={loading || uploadingImage ? faSpinner : faSave} 
                className={`w-4 h-4 ${loading || uploadingImage ? 'animate-spin' : ''}`} 
              />
              <span className="hidden sm:inline">
                {loading || uploadingImage ? 'Guardando...' : 'Guardar Cambios'}
              </span>
              <span className="sm:hidden">
                {loading || uploadingImage ? 'Guardando...' : 'Guardar'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default UserProfileEditModal; 