import React, { useState } from 'react';
import adminService from '../../../../../services/api/adminService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUpload, faTrash } from '@fortawesome/free-solid-svg-icons';
import '../../../../../assets/styles/components/dashboard/adminPanel/UserAdminModal/UserCreateAdminModal.css';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Crear Nuevo Usuario</h2>
            <p className="text-xs text-gray-400 mt-1">Panel de administración - Creación de usuario</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error general */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Foto de perfil */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Foto de Perfil (Opcional)
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">
                      {formData.nome ? formData.nome.charAt(0).toUpperCase() : '?'}
                    </span>
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
                      className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faUpload} />
                      <span>{uploadingImage ? 'Subiendo...' : 'Subir'}</span>
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={clearImage}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center space-x-2"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Datos básicos */}
            <div className="grid grid-cols-1 gap-4">
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
                  className={`w-full bg-gray-700 text-white px-4 py-2 rounded-lg border ${
                    validationErrors.nome ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                  required
                />
                {validationErrors.nome && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.nome}</p>
                )}
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  className={`w-full bg-gray-700 text-white px-4 py-2 rounded-lg border ${
                    validationErrors.correo ? 'border-red-500' : 'border-gray-600'
                  } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                  required
                />
                {validationErrors.correo && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.correo}</p>
                )}
              </div>

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
                    className={`w-full bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-600'
                    } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
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
                    className={`w-full bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border ${
                      validationErrors.password_confirmation ? 'border-red-500' : 'border-gray-600'
                    } focus:border-purple-500 focus:ring-1 focus:ring-purple-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={showPasswordConfirmation ? faEyeSlash : faEye} />
                  </button>
                </div>
                {validationErrors.password_confirmation && (
                  <p className="text-red-400 text-xs mt-1">{validationErrors.password_confirmation}</p>
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
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer con botones */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creando...</span>
              </>
            ) : (
              <span>Crear Usuario</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateUserAdminModal; 