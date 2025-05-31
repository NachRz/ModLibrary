import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import adminService from '../../../../../services/api/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEyeSlash, 
  faUpload, 
  faTrash,
  faUser,
  faEnvelope,
  faLock,
  faUserPlus,
  faShieldAlt,
  faImage,
  faCrown
} from '@fortawesome/free-solid-svg-icons';

const CreateUserAdminModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    nome: '',
    correo: '',
    password: '',
    password_confirmation: '',
    nombre: '',
    apelidos: '',
    rol: 'usuario',
    foto_perfil: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const resetForm = () => {
    setFormData({
      nome: '',
      correo: '',
      password: '',
      password_confirmation: '',
      nombre: '',
      apelidos: '',
      rol: 'usuario',
      foto_perfil: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setValidationErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validación específica para el nombre de usuario
    if (name === 'nome') {
      const validUsernamePattern = /^[a-zA-Z0-9_.-]*$/;
      if (value && !validUsernamePattern.test(value)) {
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores de validación específicos
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
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
      
      setError('');
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    try {
      setUploadingImage(true);
      const response = await adminService.uploadProfileImage(selectedFile);
      return response.data.url;
    } catch (error) {
      throw new Error('Error al subir la imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nome.trim()) {
      errors.nome = 'El nombre de usuario es requerido';
    } else if (formData.nome.length < 3) {
      errors.nome = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!formData.correo.trim()) {
      errors.correo = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo no es válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Las contraseñas no coinciden';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      let finalImageUrl = '';
      
      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        finalImageUrl = await uploadImage();
      }
      
      // Preparar datos para crear usuario
      const createData = {
        nome: formData.nome.trim(),
        correo: formData.correo.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        nombre: formData.nombre.trim(),
        apelidos: formData.apelidos.trim(),
        rol: formData.rol,
        foto_perfil: finalImageUrl || null
      };

      const response = await adminService.createUser(createData);
      
      onUserCreated(response.data);
      resetForm();
      onClose();
    } catch (error) {
      // Manejar errores específicos de validación
      if (error.errors) {
        setValidationErrors(error.errors);
      } else {
        setError(error.message || 'Error al crear usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData(prev => ({
      ...prev,
      foto_perfil: ''
    }));
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-lg mx-auto overflow-hidden border border-gray-700/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-gray-700/50">
          <div className="flex justify-between items-center p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg">
                <FontAwesomeIcon icon={faUserPlus} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Crear Nuevo Usuario
                </h2>
                <p className="text-sm text-gray-400 mt-1">Panel de administración - Creación de usuario</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Error general */}
            {error && (
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                {error}
              </div>
            )}

            {/* Foto de perfil */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
              <label className="block text-lg font-bold text-white mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faImage} className="text-blue-400" />
                </div>
                Foto de Perfil (Opcional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {formData.nome ? formData.nome.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  {formData.rol === 'admin' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCrown} className="text-white text-xs" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="profile-upload"
                    disabled={uploadingImage}
                  />
                  <div className="flex space-x-2">
                    <label
                      htmlFor="profile-upload"
                      className="cursor-pointer bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all duration-300 disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span>{uploadingImage ? 'Subiendo...' : 'Subir'}</span>
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 transition-all duration-300"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información básica del usuario */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30 space-y-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faUser} className="text-green-400" />
                </div>
                Información Básica
              </h3>

              {/* Nombre de usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de Usuario *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="usuario123"
                  className={`w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border transition-all duration-300 ${
                    validationErrors.nome ? 'border-red-500/50' : 'border-gray-600/50'
                  } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                  required
                />
                {validationErrors.nome && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.nome}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-400" />
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  className={`w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border transition-all duration-300 ${
                    validationErrors.correo ? 'border-red-500/50' : 'border-gray-600/50'
                  } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                  required
                />
                {validationErrors.correo && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.correo}</p>
                )}
              </div>

              {/* Nombre y apellidos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
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
                    placeholder="Pérez García"
                    className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30 space-y-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faLock} className="text-red-400" />
                </div>
                Seguridad
              </h3>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-gray-700/50 text-white px-3 py-2 pr-10 rounded-lg border transition-all duration-300 ${
                      validationErrors.password ? 'border-red-500/50' : 'border-gray-600/50'
                    } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full bg-gray-700/50 text-white px-3 py-2 pr-10 rounded-lg border transition-all duration-300 ${
                      validationErrors.password_confirmation ? 'border-red-500/50' : 'border-gray-600/50'
                    } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={showPasswordConfirmation ? faEyeSlash : faEye} />
                  </button>
                </div>
                {validationErrors.password_confirmation && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.password_confirmation}</p>
                )}
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
        </div>

        {/* Footer con botones */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-5">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || uploadingImage}
              className="px-5 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creando usuario...</span>
                </>
              ) : uploadingImage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo imagen...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar el modal usando un portal al body del documento
  return ReactDOM.createPortal(modalContent, document.body);
};

export default CreateUserAdminModal; 