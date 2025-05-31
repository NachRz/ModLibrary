import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGamepad, 
  faTag, 
  faImage, 
  faFile, 
  faCog, 
  faSave,
  faTimes,
  faArrowLeft,
  faFolder
} from '@fortawesome/free-solid-svg-icons';
import '../../assets/styles/components/mods/CrearMod.css';
import modService from '../../services/api/modService';
import gameService from '../../services/api/gameService';
import etiquetasService from '../../services/api/etiquetasService';
import AsyncSelect from 'react-select/async';

// Componente personalizado para la opción del select de juegos (mejorado desde EditModAdmin)
const CustomGameOption = ({ innerProps, label, data }) => (
  <div {...innerProps} className="game-option">
    <div className="game-option-image">
      {data.game?.background_image || data.game?.imagen_fondo ? (
        <img 
          src={data.game.background_image || data.game.imagen_fondo} 
          alt={label} 
        />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}
    </div>
    <div className="game-option-info">
      <div className="game-option-title">{label}</div>
      <div className="game-option-rating">
        <span className="rating-star">★</span>
        {data.game?.rating ? data.game.rating.toFixed(1) : 'N/A'}
      </div>
    </div>
  </div>
);

// Componente personalizado para el valor seleccionado del juego (mejorado desde EditModAdmin)
const CustomGameSingleValue = ({ children, data }) => (
  <div className="game-single-value">
    <div className="game-single-image">
      {data.game?.background_image || data.game?.imagen_fondo ? (
        <img 
          src={data.game.background_image || data.game.imagen_fondo} 
          alt={children} 
        />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}
    </div>
    <div className="game-single-info">
      <div className="game-single-title">{children}</div>
      <div className="game-single-rating">
        <span className="rating-star">★</span>
        {data.game?.rating ? data.game.rating.toFixed(1) : 'N/A'}
      </div>
    </div>
  </div>
);

// Componente personalizado para la opción de etiqueta
const CustomTagOption = ({ innerProps, label, data }) => (
  <div {...innerProps} className="tag-option">
    <div className="tag-option-info">
      <div className="tag-option-name">{data.label}</div>
      <div className="tag-option-count">
        {data.juegos_count.toLocaleString()} juegos
      </div>
    </div>
  </div>
);

// Componente personalizado para el valor seleccionado de etiqueta múltiple
const CustomTagValue = ({ children, removeProps, data }) => (
  <div className="inline-flex items-center bg-purple-500 text-white text-sm rounded-full px-3 py-1 mr-1 mb-1">
    <span>{children}</span>
    <button
      {...removeProps}
      className="ml-2 text-purple-200 hover:text-white focus:outline-none"
    >
      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
    </button>
  </div>
);

const CrearMod = () => {
  const navigate = useNavigate();
  
  // Estado para el tab activo
  const [activeTab, setActiveTab] = useState('basico');
  
  // Estado para controlar el envío del formulario
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Estado para la lista de juegos (mejorado desde EditModAdmin)
  const [loadingGames, setLoadingGames] = useState(false);
  const [errorGames, setErrorGames] = useState(null);
  const [initialGameOptions, setInitialGameOptions] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen: null,
    imagenPreview: '',
    imagenesAdicionales: [],
    imagenesAdicionalesFiles: [],
    juego_id: null,
    edad_recomendada: 12,
    version_juego_necesaria: '',
    version_actual: '1.0.0',
    url: '',
    etiquetas: [],
    estado: 'borrador',
    // Estados para archivos
    archivoFile: null
  });
  
  // Estado para los errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado para las etiquetas
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [errorTags, setErrorTags] = useState(null);
  
  // Lista hardcoded de etiquetas disponibles
  const availableTags = [
    { value: 1, label: 'Action', juegos_count: 15420 },
    { value: 2, label: 'Adventure', juegos_count: 12380 },
    { value: 3, label: 'RPG', juegos_count: 8560 },
    { value: 4, label: 'Shooter', juegos_count: 7890 },
    { value: 5, label: 'Strategy', juegos_count: 5670 },
    { value: 6, label: 'Simulation', juegos_count: 4320 },
    { value: 7, label: 'Sports', juegos_count: 3890 },
    { value: 8, label: 'Racing', juegos_count: 2980 },
    { value: 9, label: 'Platformer', juegos_count: 2450 },
    { value: 10, label: 'Fighting', juegos_count: 1890 },
    { value: 11, label: 'Puzzle', juegos_count: 1560 },
    { value: 12, label: 'Horror', juegos_count: 1230 },
    { value: 13, label: 'Survival', juegos_count: 1890 },
    { value: 14, label: 'Open World', juegos_count: 3450 },
    { value: 15, label: 'Multiplayer', juegos_count: 8900 },
    { value: 16, label: 'Co-op', juegos_count: 4560 },
    { value: 17, label: 'PvP', juegos_count: 2340 },
    { value: 18, label: 'Single Player', juegos_count: 12890 },
    { value: 19, label: 'Indie', juegos_count: 7890 },
    { value: 20, label: 'Casual', juegos_count: 3450 }
  ];

  // Función para cargar opciones iniciales de juegos (mejorado desde EditModAdmin)
  useEffect(() => {
    const loadInitialGames = async () => {
      try {
        console.log('Cargando juegos iniciales...');
        const games = await gameService.getInitialGames();
        console.log('Juegos iniciales cargados:', games);
        const options = games.map(game => ({
          value: game.id,
          label: game.title,
          game: game
        }));
        console.log('Opciones de juegos creadas:', options);
        setInitialGameOptions(options);
      } catch (error) {
        console.error('Error al cargar juegos iniciales:', error);
        setErrorGames(error.message);
      }
    };

    loadInitialGames();
  }, []);
  
  // Función para cargar opciones de juegos (mejorado desde EditModAdmin)
  const loadGameOptions = async (inputValue) => {
    try {
      setLoadingGames(true);
      setErrorGames(null);
      
      if (!inputValue) {
        return initialGameOptions;
      }
      
      const games = await gameService.searchRawgGames(inputValue);
      return games.map(game => ({
        value: game.id,
        label: game.title,
        game: game
      }));
    } catch (error) {
      setErrorGames(error.message);
      return [];
    } finally {
      setLoadingGames(false);
    }
  };
  
  // Función para cargar opciones de etiquetas
  const loadTagOptions = async (inputValue) => {
    try {
      setLoadingTags(true);
      setErrorTags(null);
      
      if (!inputValue) {
        return availableTags;
      }
      
      const filteredTags = availableTags.filter(tag => 
        tag.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      
      return filteredTags;
      } catch (error) {
      setErrorTags(error.message);
      return [];
      } finally {
      setLoadingTags(false);
    }
  };
  
  // Manejador para cambios en campos simples
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Manejador para cambios en la selección de juegos (mejorado desde EditModAdmin)
  const handleGameChange = async (selectedOption) => {
    if (selectedOption) {
      try {
        setLoadingGames(true);
        setErrorGames(null);

        // Verificar y sincronizar el juego
        const syncedGame = await gameService.verifyAndSyncGame(selectedOption.value);

        // Actualizar el formData con el ID del juego sincronizado
        setFormData(prev => ({
          ...prev,
          juego_id: syncedGame.id // Usamos el ID de nuestra base de datos
        }));

        // Actualizar el juego seleccionado para mostrar en el select
    setSelectedGame(selectedOption);
        
        console.log('Juego sincronizado correctamente:', syncedGame);
      } catch (error) {
        console.error('Error al sincronizar el juego:', error);
        setErrorGames(error.message || 'Error al sincronizar el juego');
        setSelectedGame(null);
    setFormData(prev => ({
      ...prev,
          juego_id: null
        }));
      } finally {
        setLoadingGames(false);
      }
    } else {
      // Si no hay selección, limpiar
      setSelectedGame(null);
      setFormData(prev => ({
        ...prev,
        juego_id: null
    }));
    }

    if (errors.juego_id) {
      setErrors(prev => ({ ...prev, juego_id: '' }));
    }
  };
  
  // Manejador para cambios en la selección de etiquetas
  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
    setFormData(prev => ({
      ...prev,
      etiquetas: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));

    if (selectedOptions?.length > 0 && errors.etiquetas) {
      setErrors(prev => ({ ...prev, etiquetas: '' }));
    }
  };
  
  // Manejador para la carga de imagen principal
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imagen: 'Por favor, selecciona un archivo de imagen válido' }));
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, imagen: 'La imagen es demasiado grande. Máximo 2MB' }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagen: file,
        imagenPreview: URL.createObjectURL(file)
      }));
      
      if (errors.imagen) {
        setErrors(prev => ({ ...prev, imagen: '' }));
      }
    }
  };

  // Manejador para la carga de archivo principal
  const handleMainFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tamaño (máximo 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, archivo: 'El archivo es demasiado grande. Máximo 100MB' }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        archivoFile: file
      }));
      
      if (errors.archivo) {
        setErrors(prev => ({ ...prev, archivo: '' }));
      }
    }
  };

  // Función para limpiar el archivo principal
  const clearSelectedFile = () => {
    setFormData(prev => ({
      ...prev,
      archivoFile: null
    }));
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Manejador para la carga de imágenes adicionales
  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    const validFiles = [];
    const errors = [];
    
    files.forEach((file, index) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`Archivo ${index + 1}: No es una imagen válida`);
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`Archivo ${index + 1}: Tamaño mayor a 2MB`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
    }
    
    if (validFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        imagenesAdicionalesFiles: [...prev.imagenesAdicionalesFiles, ...validFiles]
      }));
    }
  };

  // Función para eliminar imagen adicional
  const removeAdditionalImage = (index) => {
    setFormData(prev => ({
      ...prev,
      imagenesAdicionalesFiles: prev.imagenesAdicionalesFiles.filter((_, i) => i !== index)
    }));
  };

  // Función para limpiar la imagen principal
  const clearSelectedImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null,
      imagenPreview: ''
    }));
  };

  // Función para limpiar nombres de archivos y carpetas
  const cleanNameForFolder = (name) => {
    return name
      .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .toLowerCase();
  };

  // Función para generar vista previa de estructura de archivos
  const getFileStructurePreview = () => {
    if (!formData.titulo || !formData.version_actual) return null;
    
    const cleanModName = cleanNameForFolder(formData.titulo);
    const cleanVersion = cleanNameForFolder(formData.version_actual);
    
    let fileName = 'archivo-del-mod';
    if (formData.archivoFile) {
      const originalName = formData.archivoFile.name;
      const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
      fileName = `${cleanModName}-${cleanVersion}${fileExtension}`;
    } else {
      fileName = `${cleanModName}-${cleanVersion}.jar`;
    }
    
    return {
      modFolder: cleanModName,
      versionFolder: cleanVersion,
      fileName: fileName,
      fullPath: `${cleanModName}/${cleanVersion}/${fileName}`
    };
  };
  
  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    }
    
    if (!formData.juego_id) {
      newErrors.juego_id = 'Debes seleccionar un juego';
    }
    
    if (!formData.version_juego_necesaria.trim()) {
      newErrors.version_juego_necesaria = 'La versión del juego es obligatoria';
    }
    
    if (!formData.version_actual.trim()) {
      newErrors.version_actual = 'La versión del mod es obligatoria';
    }
    
    if (formData.etiquetas.length === 0) {
      newErrors.etiquetas = 'Debes seleccionar al menos una etiqueta';
    }
    
    if (!formData.imagen) {
      newErrors.imagen = 'Debes subir una imagen';
    }
    
    // Validar que haya al menos un archivo o una URL de descarga
    if (!formData.archivoFile && !formData.url.trim()) {
      newErrors.archivo = 'Debes subir un archivo o proporcionar una URL de descarga';
      newErrors.url = 'Debes subir un archivo o proporcionar una URL de descarga';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejador para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setSubmitting(true);
        setSubmitError(null);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (!user.id) {
          throw new Error('Debes iniciar sesión para crear un mod');
        }
        
        const syncedTags = await etiquetasService.syncMultipleTags(formData.etiquetas);
        
        // Preparar datos base del mod
        const modDataBase = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          edad_recomendada: parseInt(formData.edad_recomendada, 10),
          creador_id: user.id,
          version_actual: formData.version_actual,
          version_juego_necesaria: formData.version_juego_necesaria,
          url: formData.url,
          estado: formData.estado,
          juego_id: formData.juego_id,
          etiquetas: syncedTags.map(tag => tag.id)
        };

        // Crear FormData si hay archivos para subir
        let dataToSubmit;
        
        if (formData.imagen || formData.imagenesAdicionalesFiles.length > 0 || formData.archivoFile) {
          // Usar FormData para archivos
          dataToSubmit = new FormData();
          
          // Agregar datos básicos
          Object.keys(modDataBase).forEach(key => {
            if (key === 'etiquetas') {
              modDataBase[key].forEach(tagId => {
                dataToSubmit.append('etiquetas[]', tagId);
              });
            } else {
              dataToSubmit.append(key, modDataBase[key]);
            }
          });
          
          // Agregar imagen principal
          if (formData.imagen) {
            dataToSubmit.append('imagen_banner', formData.imagen);
          }
          
          // Agregar imágenes adicionales
          formData.imagenesAdicionalesFiles.forEach((file, index) => {
            dataToSubmit.append('imagenes_adicionales[]', file);
          });
          
          // Agregar archivo del mod con información de estructura
          if (formData.archivoFile) {
            // Limpiar el nombre del mod para usarlo como carpeta (remover caracteres especiales)
            const cleanModName = cleanNameForFolder(formData.titulo);
            
            // Limpiar la versión para usarla como subcarpeta
            const cleanVersion = cleanNameForFolder(formData.version_actual);
            
            // Obtener la extensión original del archivo
            const originalName = formData.archivoFile.name;
            const fileExtension = originalName.substring(originalName.lastIndexOf('.'));
            
            // Crear el nombre final del archivo: nombremod-version.extension
            const finalFileName = `${cleanModName}-${cleanVersion}${fileExtension}`;
            
            // Agregar el archivo con metadatos de estructura
            dataToSubmit.append('archivo_principal', formData.archivoFile);
            dataToSubmit.append('mod_folder_name', cleanModName);
            dataToSubmit.append('version_folder_name', cleanVersion);
            dataToSubmit.append('final_file_name', finalFileName);
            
            console.log('Estructura de carpetas:');
            console.log(`- Carpeta mod: ${cleanModName}`);
            console.log(`- Carpeta versión: ${cleanVersion}`);
            console.log(`- Nombre archivo: ${finalFileName}`);
            console.log(`- Ruta completa: ${cleanModName}/${cleanVersion}/${finalFileName}`);
          }
          
        } else {
          // Solo datos JSON si no hay archivos
          dataToSubmit = modDataBase;
        }
        
        console.log('Enviando datos del mod al backend...');
        const response = await modService.createMod(dataToSubmit);
        
        if (response.status === 'success') {
          setSubmitSuccess(true);
          setTimeout(() => {
            navigate('/dashboard/mis-mods');
          }, 1500);
        } else {
          throw new Error(response.message || 'Error al crear el mod');
        }
        
      } catch (error) {
        setSubmitError(error.message || 'Ha ocurrido un error al crear el mod');
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  // Renderizar contenido de la pestaña Básico
  const renderTabBasico = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faGamepad} className="mr-2" />
          Información Básica
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título del mod *
            </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.titulo ? 'border-red-500' : 'border-gray-600'
              }`}
                    disabled={submitting}
              placeholder="Ej: Mi increíble mod"
                  />
            {errors.titulo && <span className="text-red-400 text-sm mt-1 block">{errors.titulo}</span>}
                </div>
                
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="5"
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.descripcion ? 'border-red-500' : 'border-gray-600'
              }`}
                    disabled={submitting}
              placeholder="Describe tu mod, sus características y funcionalidades..."
            />
            {errors.descripcion && <span className="text-red-400 text-sm mt-1 block">{errors.descripcion}</span>}
                </div>
                
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Juego asociado *
            </label>
                  <AsyncSelect
              value={selectedGame}
              onChange={handleGameChange}
                    loadOptions={loadGameOptions}
                    defaultOptions={initialGameOptions}
                    cacheOptions
              placeholder="Seleccionar juego..."
              loadingMessage={() => "Buscando juegos..."}
              noOptionsMessage={() => "No se encontraron juegos"}
              isDisabled={loadingGames || submitting}
              className={`select-container ${errorGames ? 'error' : ''}`}
              classNamePrefix="select"
                    components={{
                      Option: CustomGameOption,
                      SingleValue: CustomGameSingleValue
                    }}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#374151',
                  borderColor: errors.juego_id ? '#EF4444' : '#4B5563',
                  color: 'white',
                  minHeight: '42px'
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'white'
                }),
                input: (provided) => ({
                  ...provided,
                  color: 'white'
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9CA3AF'
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563'
                })
              }}
            />
            {errorGames && (
              <p className="text-red-400 text-sm mt-1">{errorGames}</p>
            )}
            {loadingGames && (
              <p className="text-gray-400 text-sm mt-1">Sincronizando juego...</p>
            )}
            <small className="text-gray-400 text-sm mt-1 block">
              Busca y selecciona el juego para el cual es este mod
            </small>
            {errors.juego_id && <span className="text-red-400 text-sm mt-1 block">{errors.juego_id}</span>}
                </div>
                
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versión del juego necesaria *
              </label>
                  <input
                    type="text"
                    name="version_juego_necesaria"
                    value={formData.version_juego_necesaria}
                    onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.version_juego_necesaria ? 'border-red-500' : 'border-gray-600'
                }`}
                    disabled={submitting}
                placeholder="Ej: 1.20.4"
                  />
              {errors.version_juego_necesaria && <span className="text-red-400 text-sm mt-1 block">{errors.version_juego_necesaria}</span>}
                </div>
                
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versión del mod *
              </label>
                  <input
                    type="text"
                    name="version_actual"
                    value={formData.version_actual}
                    onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.version_actual ? 'border-red-500' : 'border-gray-600'
                }`}
                    disabled={submitting}
                placeholder="Ej: 1.0.0"
                  />
              {errors.version_actual && <span className="text-red-400 text-sm mt-1 block">{errors.version_actual}</span>}
            </div>
                </div>
                
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Edad recomendada
              </label>
              <select
                name="edad_recomendada"
                value={formData.edad_recomendada}
                    onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={submitting}
              >
                <option value={3}>3+ (Todos los públicos)</option>
                <option value={7}>7+ (Niños)</option>
                <option value={12}>12+ (Adolescentes)</option>
                <option value={16}>16+ (Jóvenes)</option>
                <option value={18}>18+ (Adultos)</option>
              </select>
              </div>
              
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado del mod
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={submitting}
              >
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
                        </div>
                    </div>
                  </div>
                </div>
    </div>
  );

  // Renderizar contenido de la pestaña Etiquetas
  const renderTabEtiquetas = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faTag} className="mr-2" />
          Etiquetas del Mod
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Seleccionar etiquetas *
            </label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
              defaultOptions={availableTags}
                    value={selectedTags}
                    onChange={handleTagChange}
                    loadOptions={loadTagOptions}
              placeholder="Buscar y seleccionar etiquetas..."
              loadingMessage={() => "Buscando etiquetas..."}
                    noOptionsMessage={() => "No se encontraron etiquetas"}
                    isDisabled={submitting}
                    components={{
                      Option: CustomTagOption,
                      MultiValue: CustomTagValue
                    }}
                    styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: '#374151',
                  borderColor: errors.etiquetas ? '#EF4444' : '#4B5563',
                  color: 'white',
                  minHeight: '45px'
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: '#7C3AED'
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: 'white'
                }),
                input: (provided) => ({
                  ...provided,
                  color: 'white'
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: '#9CA3AF'
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563'
                      })
                    }}
                  />
            {errors.etiquetas && <span className="text-red-400 text-sm mt-1 block">{errors.etiquetas}</span>}
                </div>

          {selectedTags.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Etiquetas seleccionadas ({selectedTags.length}):
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <span key={tag.value} className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
            <h5 className="text-blue-400 font-medium mb-2">Consejos para las etiquetas</h5>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Selecciona etiquetas que describan el contenido y características de tu mod</li>
              <li>• Las etiquetas ayudan a otros usuarios a encontrar tu mod más fácilmente</li>
              <li>• Puedes seleccionar múltiples etiquetas relevantes</li>
              <li>• Se requiere al menos una etiqueta para publicar el mod</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido de la pestaña Imágenes
  const renderTabImagenes = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faImage} className="mr-2" />
          Imágenes del Mod
        </h4>
        
        {/* Imagen principal */}
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h5 className="text-white font-medium mb-4">Imagen Principal *</h5>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subir imagen principal
              </label>
              <div className="flex items-center space-x-3">
                      <input
                  type="file"
                  id="imagen-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="imagen-upload"
                  className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
                >
                  <FontAwesomeIcon icon={faImage} className="mr-2" />
                  Seleccionar Imagen
                    </label>
                    
                {formData.imagenPreview && (
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-1" />
                    Eliminar
                  </button>
                )}
              </div>
              
              {formData.imagen && (
                <p className="text-green-400 text-sm mt-2">
                  ✓ {formData.imagen.name}
                </p>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Imagen principal que aparecerá en listas y detalles. Formatos: JPG, PNG, GIF. Máximo: 2MB
              </p>
              {errors.imagen && <span className="text-red-400 text-sm mt-1 block">{errors.imagen}</span>}
            </div>
            
            {/* Vista previa de imagen principal */}
            {formData.imagenPreview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vista Previa:
                </label>
                <div className="relative inline-block">
                  <img
                    src={formData.imagenPreview}
                    alt="Vista previa"
                    className="w-64 h-40 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Imágenes adicionales */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h5 className="text-white font-medium mb-4">Imágenes Adicionales (Opcional)</h5>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agregar más imágenes
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-3" />
                <p className="text-gray-300 mb-2">Arrastra múltiples imágenes aquí o haz clic para seleccionar</p>
                      <input
                  type="file"
                  id="imagenes-adicionales-upload"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesUpload}
                  className="hidden"
                />
                <label
                  htmlFor="imagenes-adicionales-upload"
                  className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
                >
                  <FontAwesomeIcon icon={faImage} className="mr-2" />
                  Seleccionar Imágenes
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Capturas de pantalla, galería de imágenes. Formatos: JPG, PNG, GIF. Máximo: 2MB cada una
                </p>
              </div>
            </div>
            
            {/* Previsualización de imágenes adicionales */}
            {formData.imagenesAdicionalesFiles.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Imágenes Adicionales ({formData.imagenesAdicionalesFiles.length}):
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.imagenesAdicionalesFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Imagen adicional ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información sobre imágenes */}
        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4 mt-6">
          <h5 className="text-blue-400 font-medium mb-2">Información sobre Imágenes</h5>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• <strong>Imagen Principal:</strong> Imagen principal que aparece en listas y páginas de detalle</li>
            <li>• <strong>Imágenes Adicionales:</strong> Galería de capturas de pantalla y contenido visual extra</li>
            <li>• Se recomienda usar una relación de aspecto 16:9 para la imagen principal (ej: 1920x1080px)</li>
            <li>• Formatos soportados: JPG, PNG, GIF</li>
            <li>• Tamaño máximo: 2MB por imagen</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Renderizar contenido de la pestaña Archivos
  const renderTabArchivos = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faFile} className="mr-2" />
          Archivos del Mod
        </h4>
        
        {/* Mensaje de requisito */}
        <div className="bg-purple-500 bg-opacity-20 border border-purple-500 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <FontAwesomeIcon icon={faFile} className="text-purple-400" />
            <h5 className="text-purple-400 font-medium">Requisito de Descarga</h5>
          </div>
          <p className="text-purple-300 text-sm">
            Debes proporcionar <strong>al menos una</strong> de las siguientes opciones para que los usuarios puedan descargar tu mod:
          </p>
          <ul className="text-purple-300 text-sm mt-2 space-y-1 ml-4">
            <li>• Subir el archivo del mod directamente</li>
            <li>• Proporcionar un enlace de descarga externo</li>
          </ul>
        </div>
        
        {/* Archivo principal */}
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-white font-medium">Opción 1: Subir Archivo Directamente</h5>
            {formData.archivoFile && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                ✓ Archivo seleccionado
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subir archivo del mod
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors file-upload-area">
                <FontAwesomeIcon icon={faFile} className="text-4xl text-gray-400 mb-3" />
                <p className="text-gray-300 mb-2">Arrastra el archivo del mod aquí o haz clic para seleccionar</p>
                <input
                  type="file"
                  id="archivo-principal-upload"
                  onChange={handleMainFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="archivo-principal-upload"
                  className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
                >
                  <FontAwesomeIcon icon={faFile} className="mr-2" />
                  Seleccionar Archivo
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Archivo .jar, .zip, .rar, .7z o el formato específico de tu mod. Máximo: 100MB
                </p>
              </div>
              
              {formData.archivoFile && (
                <div className="mt-4 bg-gray-600 rounded-lg p-4 file-item">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FontAwesomeIcon icon={faFile} className="text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{formData.archivoFile.name}</p>
                        <p className="text-gray-300 text-sm">{formatFileSize(formData.archivoFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.archivo && <span className="text-red-400 text-sm mt-1 block">{errors.archivo}</span>}
            </div>
          </div>
        </div>

        {/* URL de descarga alternativa */}
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-white font-medium">Opción 2: Enlace de Descarga Externo</h5>
            {formData.url && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                ✓ URL proporcionada
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enlace de descarga externo
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                        onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={submitting}
                placeholder="https://ejemplo.com/mi-mod.zip"
              />
              <p className="text-xs text-gray-400 mt-2">
                Si prefieres alojar tu mod en otro lugar (GitHub, MediaFire, etc.), puedes proporcionar el enlace aquí
              </p>
                  </div>
            
            {formData.url && (
              <div className="mt-3 p-3 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg url-indicator">
                <p className="text-blue-300 text-sm">
                  <FontAwesomeIcon icon={faFile} className="mr-2" />
                  Los usuarios serán redirigidos a: <span className="font-mono break-all">{formData.url}</span>
                </p>
                </div>
            )}
            
            {errors.url && <span className="text-red-400 text-sm mt-1 block">{errors.url}</span>}
              </div>
            </div>
            
        {/* Estado actual */}
        {(formData.archivoFile || formData.url) && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faFile} className="text-green-400" />
              <h5 className="text-green-400 font-medium">Requisito Cumplido</h5>
            </div>
            <p className="text-green-300 text-sm mt-1">
              {formData.archivoFile && formData.url 
                ? 'Has proporcionado tanto un archivo como un enlace. Los usuarios podrán elegir cómo descargar tu mod.'
                : formData.archivoFile 
                ? 'Archivo subido correctamente. Los usuarios podrán descargar tu mod directamente.'
                : 'Enlace de descarga proporcionado. Los usuarios serán redirigidos al enlace externo.'
              }
            </p>
          </div>
        )}

        {/* Información sobre archivos */}
        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
          <h5 className="text-blue-400 font-medium mb-2">Información sobre Archivos</h5>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• <strong>Archivo Directo:</strong> Subir el archivo aquí permite descarga inmediata desde nuestra plataforma</li>
            <li>• <strong>Enlace Externo:</strong> Redirige a usuarios a tu enlace de descarga preferido</li>
            <li>• <strong>Ambas opciones:</strong> Puedes proporcionar ambas para dar más opciones a los usuarios</li>
            <li>• Formatos recomendados: .jar, .zip, .rar, .7z, .txt, .pdf, .md</li>
            <li>• Tamaño máximo: 100MB para el archivo principal</li>
            <li>• Los archivos se almacenan de forma segura y se escanean automáticamente</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Renderizado del mensaje de éxito
  const renderSuccessMessage = () => (
    <div className="success-message">
      <div className="success-icon">✓</div>
      <h3>¡Mod creado con éxito!</h3>
      <p>Redirigiendo a tus mods...</p>
    </div>
  );

  // Renderizado del mensaje de error
  const renderErrorMessage = () => (
    <div className="error-banner">
      <p>{submitError}</p>
      <button onClick={() => setSubmitError(null)} className="error-close-btn">×</button>
    </div>
  );

  return (
    <div className="create-mod-container">
      {submitSuccess ? (
        renderSuccessMessage()
      ) : (
        <>
          {submitError && renderErrorMessage()}
          
          {/* Header */}
          <div className="create-mod-header">
            <div className="flex items-center justify-between">
              <div>
                <h1>Crear nuevo mod</h1>
                <p className="create-mod-subtitle">Completa la información para compartir tu mod con la comunidad</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/mis-mods')}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Volver a mis mods"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="create-mod-form">
            {/* Tabs */}
            <div className="border-b border-gray-600 mb-6">
              <div className="flex space-x-4 overflow-x-auto">
                {[
                  { id: 'basico', label: 'Información Básica', icon: faGamepad },
                  { id: 'etiquetas', label: 'Etiquetas', icon: faTag },
                  { id: 'imagenes', label: 'Imágenes', icon: faImage },
                  { id: 'archivos', label: 'Archivos', icon: faFile }
                ].map(tab => (
                  <button
                    key={tab.id}
                type="button" 
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido de tabs */}
            <div className="tab-content mb-8">
              {activeTab === 'basico' && renderTabBasico()}
              {activeTab === 'etiquetas' && renderTabEtiquetas()}
              {activeTab === 'imagenes' && renderTabImagenes()}
              {activeTab === 'archivos' && renderTabArchivos()}
            </div>

            {/* Acciones del formulario */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard/mis-mods')}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 ${submitting ? 'cursor-not-allowed' : ''}`}
                disabled={submitting}
              >
                <FontAwesomeIcon 
                  icon={faSave} 
                  className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} 
                />
                <span>{submitting ? 'Creando...' : 'Crear Mod'}</span>
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CrearMod;
