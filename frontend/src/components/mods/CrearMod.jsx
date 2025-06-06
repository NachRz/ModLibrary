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
import PageContainer from '../layout/PageContainer';

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
  const [errorGames, setErrorGames] = useState(null);
  const [initialGameOptions, setInitialGameOptions] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isSyncingGame, setIsSyncingGame] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen: null,
    imagenPreview: '',
    imagenesAdicionales: [],
    imagenesAdicionalesFiles: [],
    juego_id: null,
    edad_recomendada: 12,
    version_actual: '1.0.0',
    url: '',
    etiquetas: [],
    estado: 'borrador'
  });

  // Estado para los errores de validación
  const [errors, setErrors] = useState({});

  // Estado para las etiquetas
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [errorTags, setErrorTags] = useState(null);

  // Estados para manejo de imágenes adicionales (como en EditModAdmin)
  const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState([]);
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState([]);
  const [uploadingAdditionalImages, setUploadingAdditionalImages] = useState(false);

  // Efecto de limpieza para evitar memory leaks con las URLs de preview
  useEffect(() => {
    return () => {
      // Limpiar URLs de preview al desmontar el componente
      additionalPreviewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      // Limpiar URL de imagen principal si existe
      if (formData.imagenPreview && formData.imagenPreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.imagenPreview);
      }
    };
  }, [additionalPreviewUrls, formData.imagenPreview]);

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
      // No poner loading cuando se está buscando, solo cuando no hay input inicial
      if (inputValue && inputValue.trim()) {
        setErrorGames(null);
      }

      if (!inputValue || inputValue.trim() === '') {
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
    }
  };

  // Función para cargar opciones de etiquetas usando AsyncSelect (igual que EditModAdmin)
  const loadTagOptions = async (inputValue) => {
    try {
      const response = await etiquetasService.searchTags(inputValue);

      if (response.etiquetas) {
        return response.etiquetas.map(tag => ({
          value: tag.id, // Este es el rawg_id cuando viene de RAWG
          label: tag.name || tag.nombre,
          juegos_count: tag.juegos_count || 0
        }));
      }

      return [];
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
      return [];
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

  // Manejador para cambios en el select de juegos
  const handleGameChange = async (selectedOption) => {
    if (selectedOption) {
      // Inmediatamente actualizar el juego seleccionado en la UI
      setSelectedGame(selectedOption);

      // Sincronizar en segundo plano sin bloquear la interfaz
      syncGameInBackground(selectedOption);
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

  // Función para sincronizar juego en segundo plano
  const syncGameInBackground = async (selectedOption) => {
    try {
      setIsSyncingGame(true);
      setErrorGames(null);

      // Mostrar que se está sincronizando pero sin bloquear
      console.log('Sincronizando juego en segundo plano:', selectedOption.label);

      // Verificar y sincronizar el juego
      const syncedGame = await gameService.verifyAndSyncGame(selectedOption.value);

      // Actualizar el formData con el ID del juego sincronizado
      setFormData(prev => ({
        ...prev,
        juego_id: syncedGame.id // Usamos el ID de nuestra base de datos
      }));

      console.log('Juego sincronizado exitosamente:', syncedGame);
    } catch (error) {
      console.error('Error al sincronizar el juego:', error);
      setErrorGames(`Error al sincronizar ${selectedOption.label}: ${error.message || 'Error desconocido'}`);

      // En caso de error, mantener la selección visual pero sin ID
      setFormData(prev => ({
        ...prev,
        juego_id: null
      }));
    } finally {
      setIsSyncingGame(false);
    }
  };

  // Manejador para cambios en la selección de etiquetas (mejorado como EditModAdmin)
  const handleTagChange = async (selectedOptions) => {
    setSelectedTags(selectedOptions || []);

    // Sincronizar etiquetas con la base de datos local para obtener los IDs correctos
    if (selectedOptions && selectedOptions.length > 0) {
      try {
        const syncedTags = await Promise.all(
          selectedOptions.map(async (option) => {
            try {
              // Sincronizar la etiqueta para obtener el ID local
              const syncedTag = await etiquetasService.syncTag(option.value);
              return {
                id: syncedTag.id, // ID local de la base de datos
                nombre: syncedTag.nombre,
                rawg_id: syncedTag.rawg_id
              };
            } catch (error) {
              console.error(`Error al sincronizar etiqueta ${option.label}:`, error);
              // En caso de error, usar el valor original como fallback
              return {
                id: option.value,
                nombre: option.label,
                rawg_id: option.value
              };
            }
          })
        );

        setFormData(prev => ({
          ...prev,
          etiquetas: syncedTags.map(tag => tag.id) // Solo guardar los IDs para el formulario
        }));
      } catch (error) {
        console.error('Error al sincronizar etiquetas:', error);
        // En caso de error, usar los valores originales
        setFormData(prev => ({
          ...prev,
          etiquetas: selectedOptions ? selectedOptions.map(option => option.value) : []
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        etiquetas: []
      }));
    }

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

  // Función para limpiar la imagen principal
  const clearSelectedImage = () => {
    setFormData(prev => ({
      ...prev,
      imagen: null,
      imagenPreview: ''
    }));
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

    if (!formData.version_actual.trim()) {
      newErrors.version_actual = 'La versión del mod es obligatoria';
    }

    if (formData.etiquetas.length === 0) {
      newErrors.etiquetas = 'Debes seleccionar al menos una etiqueta';
    }

    if (!formData.imagen) {
      newErrors.imagen = 'Debes subir una imagen';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'Debes proporcionar una URL de descarga';
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

        // Preparar datos base del mod
        const modDataBase = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          edad_recomendada: parseInt(formData.edad_recomendada, 10),
          creador_id: user.id,
          version_actual: formData.version_actual,
          url: formData.url,
          estado: formData.estado,
          juego_id: formData.juego_id,
          etiquetas: formData.etiquetas // Ya contiene los IDs locales sincronizados
        };

        // Crear FormData si hay archivos para subir (solo imágenes)
        let dataToSubmit;

        if (formData.imagen || formData.imagenesAdicionalesFiles.length > 0) {
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

  // Función mejorada para manejo de imágenes adicionales (mejorada)
  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    console.log('=== SUBIR IMÁGENES ADICIONALES CREARMOD ===');
    console.log('Archivos seleccionados:', files.length);

    // Validar cada archivo
    const validFiles = [];
    const errors = [];

    files.forEach((file, index) => {
      console.log(`Procesando archivo ${index + 1}:`, file.name, file.type, file.size);

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        errors.push(`Archivo ${index + 1}: No es una imagen válida`);
        return;
      }

      // Validar tamaño (máximo 5MB como en EditModAdmin)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`Archivo ${index + 1}: Tamaño mayor a 5MB`);
        return;
      }

      validFiles.push(file);
    });

    console.log('Archivos válidos:', validFiles.length);
    console.log('Errores encontrados:', errors);

    // Mostrar errores si los hay
    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
    }

    // Si hay archivos válidos, procesarlos
    if (validFiles.length > 0) {
      // Agregar a los archivos seleccionados
      setSelectedAdditionalFiles(prev => [...prev, ...validFiles]);

      // También agregar al formData para compatibilidad con la lógica existente
      setFormData(prev => ({
        ...prev,
        imagenesAdicionalesFiles: [...prev.imagenesAdicionalesFiles, ...validFiles]
      }));

      // Crear previews para los nuevos archivos
      const newPreviews = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newPreviews).then(previews => {
        console.log('Previews creados:', previews.length);
        setAdditionalPreviewUrls(prev => [...prev, ...previews]);
      });

      // Limpiar errores si fue exitoso
      if (submitError) {
        setSubmitError(null);
      }

      console.log(`${validFiles.length} imagen(es) adicional(es) agregada(s) exitosamente`);
    }
  };

  // Función mejorada para eliminar imagen adicional
  const removeAdditionalImage = (index) => {
    console.log(`Eliminando imagen adicional en índice: ${index}`);

    // Eliminar del estado de archivos seleccionados
    setSelectedAdditionalFiles(prev => prev.filter((_, i) => i !== index));

    // Eliminar de las URLs de preview
    setAdditionalPreviewUrls(prev => prev.filter((_, i) => i !== index));

    // Mantener compatibilidad con la lógica existente
    setFormData(prev => ({
      ...prev,
      imagenesAdicionalesFiles: prev.imagenesAdicionalesFiles.filter((_, i) => i !== index)
    }));

    console.log(`Imagen adicional ${index + 1} eliminada correctamente`);
  };

  // Función para limpiar todas las imágenes adicionales seleccionadas
  const clearSelectedAdditionalImages = () => {
    console.log('Limpiando todas las imágenes adicionales seleccionadas');
    setSelectedAdditionalFiles([]);
    setAdditionalPreviewUrls([]);
    setFormData(prev => ({
      ...prev,
      imagenesAdicionalesFiles: []
    }));
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
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.titulo ? 'border-red-500' : 'border-gray-600'
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
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.descripcion ? 'border-red-500' : 'border-gray-600'
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
              isDisabled={submitting}
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
            {isSyncingGame && (
              <p className="text-blue-400 text-sm mt-1 flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent mr-2"></div>
                Sincronizando juego en segundo plano...
              </p>
            )}
            <small className="text-gray-400 text-sm mt-1 block">
              Busca y selecciona el juego para el cual es este mod
            </small>
            {errors.juego_id && <span className="text-red-400 text-sm mt-1 block">{errors.juego_id}</span>}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Versión del mod *
              </label>
              <input
                type="text"
                name="version_actual"
                value={formData.version_actual}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.version_actual ? 'border-red-500' : 'border-gray-600'
                  }`}
                disabled={submitting}
                placeholder="Ej: 1.0.0"
              />
              {errors.version_actual && <span className="text-red-400 text-sm mt-1 block">{errors.version_actual}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de descarga *
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.url ? 'border-red-500' : 'border-gray-600'
                  }`}
                disabled={submitting}
                placeholder="https://ejemplo.com/mi-mod.zip"
              />
              {errors.url && <span className="text-red-400 text-sm mt-1 block">{errors.url}</span>}
              <small className="text-gray-400 text-sm mt-1 block">
                Enlace directo donde los usuarios pueden descargar tu mod
              </small>
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
              defaultOptions={[]}
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

          {/* Mostrar imágenes seleccionadas si las hay */}
          {selectedAdditionalFiles && selectedAdditionalFiles.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Imágenes Seleccionadas ({selectedAdditionalFiles.length}):
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {additionalPreviewUrls.map((previewUrl, index) => {
                  console.log(`Renderizando preview imagen adicional ${index + 1}:`, previewUrl);

                  return (
                    <div key={index} className="relative">
                      <img
                        src={previewUrl}
                        alt={`Nueva imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-600"
                        onError={(e) => {
                          console.error(`Error cargando preview imagen ${index + 1}:`, previewUrl);
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.no-image-fallback');
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                        onLoad={(e) => {
                          console.log(`Preview imagen ${index + 1} cargada correctamente`);
                        }}
                      />
                      <div className="no-image-fallback w-full h-24 bg-gray-600 rounded-lg border border-gray-500 border-dashed items-center justify-center hidden">
                        <div className="text-center">
                          <FontAwesomeIcon icon={faImage} className="text-gray-400 text-lg mb-1" />
                          <p className="text-gray-400 text-xs">Error al cargar</p>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1">
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-all"
                        >
                          <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="absolute top-1 left-1">
                        <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                          {index + 1}
                        </span>
                      </div>
                      {selectedAdditionalFiles[index] && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-black/70 text-white text-xs p-1 rounded truncate">
                            {selectedAdditionalFiles[index].name}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón para limpiar selección */}
              <div className="flex items-center justify-end mt-3">
                <button
                  type="button"
                  onClick={clearSelectedAdditionalImages}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                  Limpiar Todas las Imágenes
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Agregar Imágenes Adicionales
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
                  disabled={uploadingAdditionalImages}
                />
                <label
                  htmlFor="imagenes-adicionales-upload"
                  className={`cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block ${uploadingAdditionalImages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <FontAwesomeIcon icon={faImage} className="mr-2" />
                  Seleccionar Imágenes
                </label>
                <p className="text-xs text-gray-400 mt-2">
                  Capturas de pantalla, galería de imágenes. Formatos: JPG, PNG, GIF. Máximo: 5MB cada una
                </p>
              </div>
            </div>

            {/* Eliminar la sección antigua de previsualización ya que ahora se muestra arriba */}
          </div>
        </div>

        {/* Información sobre imágenes */}
        <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4 mt-6">
          <div className="flex items-center space-x-2 mb-2">
            <FontAwesomeIcon icon={faImage} className="text-blue-400" />
            <h5 className="text-blue-400 font-medium">Información sobre Imágenes</h5>
          </div>
          <ul className="text-blue-300 text-sm space-y-1">
            <li>• <strong>Imagen Principal:</strong> Imagen principal que aparece en listas y páginas de detalle (Obligatoria)</li>
            <li>• <strong>Imágenes Adicionales:</strong> Galería de capturas de pantalla y contenido visual extra (Opcional)</li>
            <li>• Se recomienda usar una relación de aspecto 16:10 para la imagen principal (ej: 1600x1000px)</li>
            <li>• Formatos soportados: JPG, PNG, GIF</li>
            <li>• Tamaño máximo: 2MB imagen principal, 5MB imágenes adicionales</li>
            <li>• Las imágenes se optimizarán automáticamente para diferentes dispositivos</li>
            <li>• Puedes agregar hasta 10 imágenes adicionales</li>
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
    <PageContainer>
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
                    { id: 'imagenes', label: 'Imágenes', icon: faImage }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
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
    </PageContainer>
  );
};

export default CrearMod;
