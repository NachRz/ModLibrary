import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import adminService from '../../../../../services/api/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faEdit,
  faShieldAlt,
  faCrown,
  faImage,
  faSpinner,
  faSave
} from '@fortawesome/free-solid-svg-icons';

const UserEditModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    correo: '',
    nombre: '',
    apelidos: '',
    sobre_mi: '',
    rol: 'usuario',
    foto_perfil: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  useEffect(() => {
    if (user && isOpen) {
      // Cargar detalles completos del usuario
      loadUserDetails();
    }
  }, [user, isOpen]);

  useEffect(() => {
    // Actualizar preview cuando cambie foto_perfil desde la carga de datos
    if (formData.foto_perfil && !selectedFile) {
      const timestamp = Date.now();
      setImageTimestamp(timestamp);
      // Verificar si la URL ya es absoluta
      if (formData.foto_perfil.startsWith('http')) {
        setPreviewUrl(`${formData.foto_perfil}?t=${timestamp}`);
      } else {
        // Remover barras iniciales si existen para evitar doble barra
        const cleanPath = formData.foto_perfil.replace(/^\/+/, '');
        setPreviewUrl(`http://localhost:8000/storage/${cleanPath}?t=${timestamp}`);
      }
      console.log('Updated preview URL:', formData.foto_perfil, 'Final URL:', formData.foto_perfil.startsWith('http') ? `${formData.foto_perfil}?t=${timestamp}` : `http://localhost:8000/storage/${formData.foto_perfil.replace(/^\/+/, '')}?t=${timestamp}`);
    } else if (!formData.foto_perfil && !selectedFile) {
      setPreviewUrl('');
    }
  }, [formData.foto_perfil, selectedFile]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserDetails(user.id);
      const userData = response.data;
      
      // Agregar timestamp a los datos del usuario
      const userDataWithTimestamp = {
        ...userData,
        imageTimestamp: Date.now()
      };
      
      setFormData({
        nome: userDataWithTimestamp.nome || '',
        correo: userDataWithTimestamp.correo || '',
        nombre: userDataWithTimestamp.nombre || '',
        apelidos: userDataWithTimestamp.apelidos || '',
        sobre_mi: userDataWithTimestamp.sobre_mi || '',
        rol: userDataWithTimestamp.rol || 'usuario',
        foto_perfil: userDataWithTimestamp.foto_perfil || ''
      });
      
      // Limpiar estados de archivo al cargar nuevos datos
      setSelectedFile(null);
      setImageTimestamp(userDataWithTimestamp.imageTimestamp);
      
      // Actualizar preview URL con el nuevo timestamp
      if (userDataWithTimestamp.foto_perfil) {
        if (userDataWithTimestamp.foto_perfil.startsWith('http')) {
          setPreviewUrl(`${userDataWithTimestamp.foto_perfil}?t=${userDataWithTimestamp.imageTimestamp}`);
        } else {
          // Remover barras iniciales si existen para evitar doble barra
          const cleanPath = userDataWithTimestamp.foto_perfil.replace(/^\/+/, '');
          setPreviewUrl(`http://localhost:8000/storage/${cleanPath}?t=${userDataWithTimestamp.imageTimestamp}`);
        }
        console.log('Loaded user image:', userDataWithTimestamp.foto_perfil, 'Preview URL:', userDataWithTimestamp.foto_perfil.startsWith('http') ? `${userDataWithTimestamp.foto_perfil}?t=${userDataWithTimestamp.imageTimestamp}` : `http://localhost:8000/storage/${userDataWithTimestamp.foto_perfil.replace(/^\/+/, '')}?t=${userDataWithTimestamp.imageTimestamp}`);
      } else {
        setPreviewUrl('');
        console.log('No profile image found for user');
      }
    } catch (error) {
      setError('Error al cargar detalles del usuario');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación específica para el nombre de usuario
    if (name === 'nome') {
      // Validar que solo contenga letras, números y algunos caracteres especiales
      const validUsernamePattern = /^[a-zA-Z0-9_.-]*$/;
      if (value && !validUsernamePattern.test(value)) {
        return; // No actualizar si contiene caracteres inválidos
      }
    }
    
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
      uploadFormData.append('user_id', user.id);
      
      const response = await adminService.uploadProfileImage(uploadFormData);
      
      // Actualizar timestamp para forzar actualización de imagen
      const newTimestamp = Date.now();
      setImageTimestamp(newTimestamp);
      
      // Actualizar el preview URL con el nuevo timestamp
      if (response.data.url) {
        if (response.data.url.startsWith('http')) {
          setPreviewUrl(`${response.data.url}?t=${newTimestamp}`);
        } else {
          setPreviewUrl(`http://localhost:8000/storage/${response.data.url}?t=${newTimestamp}`);
        }
      }
      
      return response.data.url;
    } catch (error) {
      throw new Error('Error al subir la imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalImageUrl = formData.foto_perfil;
      const newTimestamp = Date.now();
      
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        finalImageUrl = await uploadImage();
      }
      
      // Preparar datos para actualizar
      const updateData = {
        rol: formData.rol,
        nome: formData.nome,
        nombre: formData.nombre,
        apelidos: formData.apelidos,
        sobre_mi: formData.sobre_mi,
        foto_perfil: finalImageUrl || null
      };

      await adminService.updateUser(user.id, updateData);
      
      // Crear objeto de usuario actualizado con timestamp fresco
      const updatedUser = {
        ...user,
        ...formData,
        foto_perfil: finalImageUrl,
        nombre_completo: `${formData.nombre} ${formData.apelidos}`.trim(),
        imageTimestamp: newTimestamp,
        updated_at: new Date().toISOString()
      };
      
      onSave(updatedUser);
      onClose();
    } catch (error) {
      // Manejar errores específicos de validación
      if (error.errors && error.errors.nome) {
        setError(`Nombre de usuario: ${error.errors.nome[0]}`);
      } else if (error.message && error.message.includes('nome')) {
        setError('El nombre de usuario ya está en uso. Por favor, elige otro.');
      } else {
        setError(error.message || 'Error al actualizar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    const newTimestamp = Date.now();
    setImageTimestamp(newTimestamp);
    setFormData(prev => ({
      ...prev,
      foto_perfil: ''
    }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-lg h-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-700/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex justify-between items-center p-3 sm:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-lg">
                <FontAwesomeIcon icon={faEdit} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Editar Usuario
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Panel de administración - Edición completa</p>
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
            {loading && !formData.nome && (
              <div className="flex justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/20 border-t-purple-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-purple-500/10"></div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-4">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {error}
              </div>
            )}

            {formData.nome && (
              <form id="user-edit-form" onSubmit={handleSubmit} className="space-y-5">
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
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {previewUrl ? (
                          <img 
                            src={previewUrl}
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover"
                            onError={(e) => {
                              console.error('Error loading image:', previewUrl);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className="text-white font-bold text-xl"
                          style={{ display: previewUrl ? 'none' : 'flex' }}
                        >
                          {formData.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {formData.rol === 'admin' && (
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
                          className="cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 inline-block"
                        >
                          Subir Imagen
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

                {/* Información de usuario */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30 space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faUser} className="text-green-400" />
                    </div>
                    Información de Usuario
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de Usuario
                      <span className="text-purple-400 text-xs ml-2">(Solo Admin)</span>
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      placeholder="Nombre de usuario único"
                      required
                      minLength="3"
                      maxLength="50"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Solo administradores pueden modificar nombres de usuario. 
                      Debe ser único (3-50 caracteres: letras, números, puntos, guiones y guiones bajos)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-400" />
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      className="w-full bg-gray-600/30 text-gray-300 px-3 py-2 rounded-lg border border-gray-600/50 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">El correo no se puede modificar</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Real
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      placeholder="Nombre del usuario"
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
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      placeholder="Apellidos del usuario"
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
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      placeholder="Sobre mi del usuario"
                    />
                  </div>
                </div>

                {/* Configuración de rol */}
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-600/30 rounded-lg mr-2">
                      <FontAwesomeIcon icon={faShieldAlt} className="text-orange-400" />
                    </div>
                    Configuración de Rol
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rol del Usuario
                    </label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
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
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="user-edit-form"
              disabled={loading}
              className="flex items-center space-x-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
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

  // Renderizar el modal usando un portal al body del documento
  return ReactDOM.createPortal(modalContent, document.body);
};

export default UserEditModal; 