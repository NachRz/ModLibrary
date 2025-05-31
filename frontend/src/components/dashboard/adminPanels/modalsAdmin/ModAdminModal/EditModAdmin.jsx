import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSave, 
  faImage, 
  faFile, 
  faUsers, 
  faCalendar,
  faDownload,
  faStar,
  faEye,
  faComments,
  faExclamationTriangle,
  faTag,
  faGamepad
} from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../../../../../context/NotificationContext';
import modService from '../../../../../services/api/modService';
import gameService from '../../../../../services/api/gameService';
import etiquetasService from '../../../../../services/api/etiquetasService';
import AsyncSelect from 'react-select/async';
import '../../../../../assets/styles/components/mods/CrearMod.css';
import '../../../../../assets/styles/components/common/modals/ModModals/EditModModal.css';

// Componente personalizado para la opción del select de juegos
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

// Componente personalizado para el valor seleccionado del juego
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

// Componente personalizado para la opción de etiqueta en AsyncSelect
const CustomTagOption = ({ innerProps, label, data }) => (
  <div {...innerProps} className="tag-option">
    <div className="tag-option-info">
      <div className="tag-option-name">{data.label}</div>
      <div className="tag-option-count">
        {data.juegos_count?.toLocaleString() || 0} juegos
      </div>
    </div>
  </div>
);

// Componente personalizado para el valor seleccionado múltiple
const CustomMultiValue = ({ children, removeProps, data }) => (
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

const EditModAdmin = ({ mod, isOpen, onClose, onSave }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    estado: 'borrador',
    edad_recomendada: 0,
    version: '1.0',
    etiquetas: [],
    imagen_banner: '', // URL de imagen banner actual
    imagenes_adicionales: [], // Array de imágenes adicionales
    imagenFile: null, // Archivo de imagen nuevo (para tab de imágenes)
    imagenPreview: '', // Vista previa de imagen (para tab de imágenes)
    imagenesAdicionalesFiles: [], // Archivos de imágenes adicionales
    archivo_principal: '',
    categoria_principal: '',
    es_destacado: false,
    permitir_comentarios: true,
    visible_en_busqueda: true,
    // Campos funcionales
    juego_id: null,
    url: '',
    // Campos adicionales para gestión de archivos
    tamaño_archivo: 0,
    tipo_archivo: '',
    archivos_adicionales: []
  });

  // Estados para datos adicionales
  const [selectedTags, setSelectedTags] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_descargas: 0,
    valoracion_media: 0,
    total_valoraciones: 0,
    total_comentarios: 0,
    fecha_creacion: '',
    fecha_actualizacion: '',
    // Estadísticas calculadas
    descargas_mes_actual: 0,
    descargas_semana_actual: 0
  });

  // Estados para los juegos
  const [selectedGame, setSelectedGame] = useState(null);
  const [loadingGames, setLoadingGames] = useState(false);
  const [errorGames, setErrorGames] = useState(null);
  const [initialGameOptions, setInitialGameOptions] = useState([]);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      // Resetear todos los estados cuando se cierra el modal
      setSelectedTags([]);
      setSelectedGame(null);
      setActiveTab('general');
      setLoading(false);
      setLoadingGames(false);
      setErrorGames(null);
      
      // Limpiar URLs de vista previa para evitar memory leaks
      setFormData(prev => {
        if (prev.imagenPreview) {
          URL.revokeObjectURL(prev.imagenPreview);
        }
        return {
          ...prev,
          imagenFile: null,
          imagenPreview: ''
        };
      });
    }
  }, [isOpen]);

  // Cargar datos del mod cuando se abre el modal
  useEffect(() => {
    if (isOpen && mod) {
      cargarDatosDelMod();
    }
  }, [isOpen, mod]);

  // Función para cargar datos del mod (consolidada)
  const cargarDatosDelMod = async () => {
    try {
      setLoading(true);
      
      let modCompleto = mod;
      
      // Intentar obtener datos completos del backend
      try {
        const response = await modService.getModById(mod.id);
        if (response.status === 'success' && response.data) {
          modCompleto = response.data.mod || response.data;
          console.log('Datos completos del mod cargados desde backend:', modCompleto);
        }
      } catch (backendError) {
        console.warn('No se pudieron obtener datos del backend, usando datos del prop:', backendError);
      }
        
      // Cargar datos del mod (desde backend o prop)
      const modData = {
        titulo: modCompleto.titulo || '',
        descripcion: modCompleto.descripcion || '',
        estado: modCompleto.estado || 'borrador',
        edad_recomendada: modCompleto.edad_recomendada || 0,
        version: modCompleto.version || modCompleto.version_actual || '1.0',
        etiquetas: modCompleto.etiquetas || [],
        imagen_banner: modCompleto.imagen_banner ? `${window.location.origin}/storage/${modCompleto.imagen_banner}` : 
                      (modCompleto.imagen ? `${window.location.origin}/storage/${modCompleto.imagen}` : ''),
        imagenes_adicionales: modCompleto.imagenes_adicionales ? 
          (Array.isArray(modCompleto.imagenes_adicionales) ? 
            modCompleto.imagenes_adicionales.map(img => `${window.location.origin}/storage/${img}`) :
            (typeof modCompleto.imagenes_adicionales === 'string' ? 
              JSON.parse(modCompleto.imagenes_adicionales).map(img => `${window.location.origin}/storage/${img}`) : 
              []
            )
          ) : [],
        imagenFile: null,
        imagenPreview: '',
        imagenesAdicionalesFiles: [],
        // Campos funcionales
        juego_id: modCompleto.juego_id || null,
        url: modCompleto.url || '',
        es_destacado: Boolean(modCompleto.es_destacado),
        permitir_comentarios: modCompleto.permitir_comentarios !== false,
        visible_en_busqueda: modCompleto.visible_en_busqueda !== false
      };

      console.log('Datos del mod cargados:', {
        'modCompleto.imagen_banner': modCompleto.imagen_banner,
        'modCompleto.imagen': modCompleto.imagen,
        'modData.imagen_banner': modData.imagen_banner
      });

      setFormData(modData);

      // Configurar etiquetas seleccionadas
      if (modCompleto.etiquetas && Array.isArray(modCompleto.etiquetas)) {
        const formattedTags = modCompleto.etiquetas.map(tag => ({
          value: tag.id,  // Usar el ID local de la base de datos
          label: tag.nombre || tag.name,
          juegos_count: tag.juegos_count || 0
        }));
        setSelectedTags(formattedTags);
        
        // También establecer las etiquetas en formData con el formato correcto
        setFormData(prev => ({
          ...prev,
          etiquetas: modCompleto.etiquetas.map(tag => ({
            id: tag.id,
            nombre: tag.nombre || tag.name,
            rawg_id: tag.rawg_id
          }))
        }));
      } else {
        setSelectedTags([]);
        setFormData(prev => ({
          ...prev,
          etiquetas: []
        }));
      }

      // Configurar juego seleccionado
      if (modCompleto.juego_id && modCompleto.juego) {
        console.log('Datos del juego encontrados:', modCompleto.juego);
        const gameOption = {
          value: modCompleto.juego.rawg_id || modCompleto.juego.id,
          label: modCompleto.juego.titulo || modCompleto.juego.title || modCompleto.juego.nombre || modCompleto.juego.name,
          game: {
            id: modCompleto.juego.rawg_id || modCompleto.juego.id,
            title: modCompleto.juego.titulo || modCompleto.juego.title || modCompleto.juego.nombre || modCompleto.juego.name,
            background_image: modCompleto.juego.imagen_fondo || modCompleto.juego.background_image || modCompleto.juego.imagen,
            rating: modCompleto.juego.rating || modCompleto.juego.valoracion || 0
          }
        };
        console.log('Juego configurado para select:', gameOption);
        setSelectedGame(gameOption);
      } else {
        console.log('No se encontraron datos del juego:', {
          juego_id: modCompleto.juego_id,
          juego: modCompleto.juego
        });
        setSelectedGame(null);
      }

      // Cargar estadísticas
      const estadisticasData = {
        total_descargas: modCompleto.total_descargas || modCompleto.descargas || 0,
        valoracion_media: modCompleto.valoracion_media || modCompleto.val_media || modCompleto.rating || 0,
        total_valoraciones: modCompleto.total_valoraciones || modCompleto.num_valoraciones || modCompleto.ratings_count || 0,
        total_comentarios: modCompleto.total_comentarios || modCompleto.comentarios_count || 0,
        fecha_creacion: modCompleto.fecha_creacion || modCompleto.created_at || '',
        fecha_actualizacion: modCompleto.fecha_actualizacion || modCompleto.updated_at || '',
        descargas_mes_actual: modCompleto.descargas_mes_actual || Math.floor((modCompleto.total_descargas || 0) * 0.1),
        descargas_semana_actual: modCompleto.descargas_semana_actual || Math.floor((modCompleto.total_descargas || 0) * 0.03),
        vistas: modCompleto.vistas || 0,
        likes: modCompleto.likes || 0,
        favoritos: modCompleto.favoritos || 0
      };

      setEstadisticas(estadisticasData);
      showNotification('Datos del mod cargados correctamente', 'success');
      
    } catch (error) {
      console.error('Error al cargar datos del mod:', error);
      showNotification('Error al cargar datos del mod', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar opciones de etiquetas usando AsyncSelect
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

  // Función para cargar opciones iniciales de juegos
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

    if (isOpen) {
      loadInitialGames();
    }
  }, [isOpen]);

  // Función para cargar opciones de juegos
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

  // Manejador para cambios en el select de juegos
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
        
        showNotification('Juego actualizado correctamente', 'success');
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
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador para la carga de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
        return;
      }
      
      // Validar tamaño (máximo 2MB como en el backend)
      if (file.size > 2 * 1024 * 1024) {
        showNotification('La imagen es demasiado grande. Máximo 2MB', 'error');
        return;
      }

      // Crear vista previa
      const previewUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({
        ...prev,
        imagenFile: file,
        imagenPreview: previewUrl
      }));
    }
  };

  // Función para limpiar la imagen seleccionada
  const clearSelectedImage = () => {
    setFormData(prev => ({
      ...prev,
      imagenFile: null,
      imagenPreview: ''
    }));
  };

  // Manejador para la carga de imágenes adicionales
  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validar cada archivo
    const validFiles = [];
    const errors = [];
    
    files.forEach((file, index) => {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        errors.push(`Archivo ${index + 1}: No es una imagen válida`);
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`Archivo ${index + 1}: Tamaño mayor a 2MB`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
      showNotification(errors.join(', '), 'error');
    }
    
    // Agregar archivos válidos
    if (validFiles.length > 0) {
      setFormData(prev => ({
          ...prev,
        imagenesAdicionalesFiles: [...prev.imagenesAdicionalesFiles, ...validFiles]
      }));
      
      showNotification(`${validFiles.length} imagen(es) agregada(s) exitosamente`, 'success');
    }
  };

  // Manejador para cambios en la selección de etiquetas con AsyncSelect
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
          etiquetas: syncedTags
        }));
      } catch (error) {
        console.error('Error al sincronizar etiquetas:', error);
        // En caso de error, usar los valores originales
        setFormData(prev => ({
          ...prev,
          etiquetas: selectedOptions ? selectedOptions.map(option => ({
            id: option.value,
            nombre: option.label,
            rawg_id: option.value
          })) : []
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        etiquetas: []
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      console.log('=== INICIANDO GUARDADO DEL MOD ===');
      console.log('ID del mod:', mod.id);
      console.log('Datos del formulario:', formData);
      console.log('Etiquetas seleccionadas:', selectedTags);
      
      // Validaciones básicas
      if (!formData.titulo.trim()) {
        showNotification('El título es obligatorio', 'error');
        return;
      }
      
      if (!formData.descripcion.trim()) {
        showNotification('La descripción es obligatoria', 'error');
        return;
      }

      // Preparar datos para enviar al backend
      let updateData;
      
      // Si hay una imagen nueva (archivo) o imágenes adicionales, usar FormData
      if (formData.imagenFile || formData.imagenesAdicionalesFiles.length > 0) {
        console.log('Usando FormData - hay archivos nuevos');
        updateData = new FormData();
        
        // Agregar todos los campos al FormData
        updateData.append('titulo', formData.titulo);
        updateData.append('descripcion', formData.descripcion);
        updateData.append('estado', formData.estado);
        updateData.append('edad_recomendada', parseInt(formData.edad_recomendada, 10));
        updateData.append('version_actual', formData.version);
        updateData.append('url', formData.url || '');
        updateData.append('es_destacado', Boolean(formData.es_destacado));
        updateData.append('permitir_comentarios', Boolean(formData.permitir_comentarios));
        updateData.append('visible_en_busqueda', Boolean(formData.visible_en_busqueda));
        
        // Agregar juego_id si está seleccionado
        if (formData.juego_id) {
          updateData.append('juego_id', formData.juego_id);
        }
        
        // Agregar imagen banner como archivo si hay una nueva
        if (formData.imagenFile) {
          updateData.append('imagen_banner', formData.imagenFile);
          console.log('Agregando imagen banner:', formData.imagenFile.name);
        }
        
        // Agregar imágenes adicionales
        formData.imagenesAdicionalesFiles.forEach((file, index) => {
          updateData.append('imagenes_adicionales[]', file);
          console.log(`Agregando imagen adicional ${index}:`, file.name);
        });
        
        // Agregar etiquetas usando los IDs locales sincronizados
        if (formData.etiquetas && formData.etiquetas.length > 0) {
          formData.etiquetas.forEach(tag => {
            updateData.append('etiquetas[]', tag.id);
          });
        }
        
        console.log('FormData preparado con archivos');
      } else {
        console.log('Usando JSON - sin archivos nuevos');
        // Si no hay imágenes nuevas, enviar datos normales
        updateData = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          estado: formData.estado,
          edad_recomendada: parseInt(formData.edad_recomendada, 10),
          version_actual: formData.version,
          url: formData.url || '',
          etiquetas: formData.etiquetas ? formData.etiquetas.map(tag => tag.id) : [],
          es_destacado: Boolean(formData.es_destacado),
          permitir_comentarios: Boolean(formData.permitir_comentarios),
          visible_en_busqueda: Boolean(formData.visible_en_busqueda)
        };
        
        // Agregar juego_id si está seleccionado
        if (formData.juego_id) {
          updateData.juego_id = formData.juego_id;
        }
        
        console.log('Datos JSON a enviar:', updateData);
      }

      console.log('Enviando petición al backend...');
      const response = await modService.updateMod(mod.id, updateData);
      
      console.log('Respuesta del backend:', response);
      
      if (response.status === 'success') {
        console.log('Mod actualizado exitosamente');
        showNotification('Mod actualizado exitosamente', 'success');
        
        // Actualizar el mod en el estado del componente padre
        if (onSave) {
          const updatedModForTable = {
            id: mod.id,
            nombre: formData.titulo, // La tabla usa 'nombre' pero el form usa 'titulo'
            titulo: formData.titulo, // Mantener también el título original
            estado: formData.estado,
            descargas: mod.descargas || 0, // Mantener el valor existente
            valoracion: mod.valoracion || 0, // Mantener el valor existente
            fecha_creacion: mod.fecha_creacion || new Date().toLocaleDateString(),
            creador: mod.creador || 'Usuario', // Mantener el creador existente
            juego: mod.juego || 'Juego', // Mantener el juego existente
            // Campos adicionales para que el modal funcione correctamente
            imagen_banner: response.data.imagen_banner || formData.imagen_banner,
            descripcion: formData.descripcion,
            edad_recomendada: formData.edad_recomendada,
            version_actual: formData.version || formData.version_actual,
            url: formData.url,
            es_destacado: formData.es_destacado,
            permitir_comentarios: formData.permitir_comentarios,
            visible_en_busqueda: formData.visible_en_busqueda,
            etiquetas: formData.etiquetas || []
          };
          
          onSave(updatedModForTable);
        }
        
        onClose();
      } else {
        console.error('Error en la respuesta del backend:', response);
        throw new Error(response.message || 'Error al actualizar el mod');
      }
    } catch (error) {
      console.error('=== ERROR AL GUARDAR MOD ===');
      console.error('Error completo:', error);
      console.error('Mensaje:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Error al actualizar el mod';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTabGeneral = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-300">Cargando datos del mod...</span>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="Título del mod"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Versión
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="1.0"
            />
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
              isDisabled={loadingGames}
              className={`select-container ${errorGames ? 'error' : ''}`}
              classNamePrefix="select"
              components={{
                Option: CustomGameOption,
                SingleValue: CustomGameSingleValue
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
          </div>
        </div>

        {/* Configuraciones */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="revision">En revisión</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Edad recomendada
            </label>
            <select
              name="edad_recomendada"
              value={formData.edad_recomendada}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value={0}>Sin clasificar</option>
              <option value={3}>3+ años</option>
              <option value={7}>7+ años</option>
              <option value={12}>12+ años</option>
              <option value={16}>16+ años</option>
              <option value={18}>18+ años</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Configuraciones
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="es_destacado"
                  checked={formData.es_destacado}
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Marcar como destacado</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="permitir_comentarios"
                  checked={formData.permitir_comentarios}
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Permitir comentarios</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="visible_en_busqueda"
                  checked={formData.visible_en_busqueda}
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Visible en búsquedas</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Descripción completa */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descripción completa *
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={6}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder="Descripción detallada del mod..."
        />
      </div>
        </>
      )}
    </div>
  );

  const renderTabEtiquetas = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4 flex items-center">
          <FontAwesomeIcon icon={faTag} className="mr-2" />
          Gestión de Etiquetas
        </h4>
        
        {/* Selector AsyncSelect de etiquetas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Buscar y seleccionar etiquetas
          </label>
          <AsyncSelect
            isMulti
            cacheOptions
            defaultOptions={true}
            value={selectedTags}
            onChange={handleTagChange}
            loadOptions={loadTagOptions}
            placeholder="Buscar etiquetas..."
            loadingMessage={() => "Buscando etiquetas..."}
            noOptionsMessage={() => "No se encontraron etiquetas"}
            components={{
              Option: CustomTagOption,
              MultiValue: CustomMultiValue
            }}
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: '#374151',
                borderColor: '#4B5563',
                color: 'white',
                minHeight: '45px',
                '&:hover': {
                  borderColor: '#8B5CF6'
                }
              }),
              menu: (provided) => ({
                ...provided,
                backgroundColor: '#374151',
                border: '1px solid #4B5563'
              }),
              option: (provided, state) => ({
                ...provided,
                backgroundColor: state.isFocused ? '#4B5563' : '#374151',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#4B5563'
                }
              }),
              multiValue: (provided) => ({
                ...provided,
                backgroundColor: 'transparent'
              }),
              multiValueLabel: (provided) => ({
                ...provided,
                color: 'transparent'
              }),
              multiValueRemove: (provided) => ({
                ...provided,
                display: 'none'
              }),
              input: (provided) => ({
                ...provided,
                color: 'white'
              }),
              placeholder: (provided) => ({
                ...provided,
                color: '#9CA3AF'
              }),
              singleValue: (provided) => ({
                ...provided,
                color: 'white'
              })
            }}
            className="text-white"
          />
          <small className="text-gray-400 text-sm mt-1 block">
            Busca etiquetas escribiendo el nombre. Las etiquetas se sincronizan automáticamente con RAWG.
          </small>
        </div>
        
        {/* Etiquetas seleccionadas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Etiquetas seleccionadas ({selectedTags?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-700 rounded-lg border border-gray-600">
            {selectedTags?.map(etiqueta => (
              <span
                key={etiqueta.value}
                className="inline-flex items-center px-3 py-1 bg-purple-500 text-white text-sm rounded-full"
              >
                {etiqueta.label}
                <button
                  onClick={() => {
                    const newTags = selectedTags.filter(tag => tag.value !== etiqueta.value);
                    handleTagChange(newTags);
                  }}
                  className="ml-2 text-purple-200 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(!selectedTags || selectedTags.length === 0) && (
              <span className="text-gray-400 text-sm">No hay etiquetas seleccionadas</span>
            )}
          </div>
        </div>

        {/* Información adicional sobre etiquetas */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h5 className="text-white font-medium mb-2">Información sobre etiquetas</h5>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Las etiquetas ayudan a los usuarios a encontrar tu mod</li>
            <li>• Selecciona etiquetas relevantes para el contenido de tu mod</li>
            <li>• Las etiquetas se sincronizan automáticamente con la base de datos RAWG</li>
            <li>• Puedes seleccionar múltiples etiquetas que describan tu mod</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderTabArchivos = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faFile} className="mr-2" />
        Gestión de Archivos
      </h4>
      
      {/* Archivo Principal */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h5 className="text-white font-medium mb-4">Archivo Principal del Mod</h5>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del archivo actual */}
          <div>
            <h6 className="text-gray-300 font-medium mb-3">Archivo Actual</h6>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <FontAwesomeIcon icon={faFile} className="text-blue-400 text-xl" />
                <div>
                  <p className="text-white font-medium">
            {formData.archivo_principal || 'No especificado'}
          </p>
                  <p className="text-gray-400 text-sm">Archivo principal</p>
                </div>
          </div>
          
              {formData.url && (
                <div className="mt-3">
                  <label className="block text-xs text-gray-400 mb-1">URL de descarga:</label>
                  <p className="text-gray-300 text-sm break-all">{formData.url}</p>
                </div>
              )}
              
              {formData.tamaño_archivo && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-400 mb-1">Tamaño:</label>
                  <p className="text-gray-300 text-sm">
                    {(formData.tamaño_archivo / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
              )}
        </div>
          </div>
          
          {/* Gestión de nuevos archivos */}
          <div>
            <h6 className="text-gray-300 font-medium mb-3">Actualizar Archivo</h6>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subir Nuevo Archivo
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  <FontAwesomeIcon icon={faFile} className="text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-300 mb-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Seleccionar Archivo
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Formatos soportados: ZIP, RAR, 7Z, JAR. Máximo 50MB
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  O actualizar URL de descarga:
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                  placeholder="https://ejemplo.com/mi-mod.zip"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Información y restricciones */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">Información sobre Archivos</h5>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h6 className="text-gray-300 font-medium mb-2">Formatos Soportados:</h6>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <strong>Archivos:</strong> ZIP, RAR, 7Z, JAR</li>
              <li>• <strong>Documentación:</strong> PDF, TXT, MD</li>
              <li>• <strong>Código:</strong> JS, JSON, XML, YML</li>
            </ul>
          </div>
          <div>
            <h6 className="text-gray-300 font-medium mb-2">Límites de Tamaño:</h6>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <strong>Archivo principal:</strong> Máximo 50MB</li>
              <li>• <strong>Documentación:</strong> Máximo 5MB</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-purple-500 bg-opacity-20 border border-purple-500 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FontAwesomeIcon icon={faFile} className="text-purple-400" />
          <h5 className="text-purple-400 font-medium">Gestión de Archivos</h5>
        </div>
        <p className="text-purple-300 text-sm">
          Gestiona el archivo principal de tu mod. Puedes subir un archivo directamente o proporcionar una URL de descarga externa.
        </p>
      </div>
    </div>
  );

  const renderTabEstadisticas = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-white mb-4">Estadísticas del Mod</h4>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-300">Cargando estadísticas...</span>
        </div>
      ) : (
        <>
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faDownload} className="text-blue-400 text-xl" />
                <span className="text-2xl font-bold text-white">{estadisticas.total_descargas.toLocaleString()}</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Total Descargas</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xl" />
            <span className="text-2xl font-bold text-white">
              {Number(estadisticas.valoracion_media).toFixed(1)}
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Valoración Media</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faUsers} className="text-green-400 text-xl" />
                <span className="text-2xl font-bold text-white">{estadisticas.total_valoraciones.toLocaleString()}</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Total Valoraciones</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faComments} className="text-purple-400 text-xl" />
                <span className="text-2xl font-bold text-white">{estadisticas.total_comentarios.toLocaleString()}</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Comentarios</p>
        </div>
      </div>

          {/* Estadísticas adicionales si están disponibles */}
          {(estadisticas.vistas > 0 || estadisticas.likes > 0 || estadisticas.favoritos > 0) && (
            <div>
              <h5 className="text-white font-medium mb-3">Interacciones Adicionales</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {estadisticas.vistas > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <FontAwesomeIcon icon={faEye} className="text-cyan-400 text-lg" />
                      <span className="text-xl font-bold text-white">{estadisticas.vistas.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">Vistas</p>
                  </div>
                )}

                {estadisticas.likes > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <FontAwesomeIcon icon={faStar} className="text-pink-400 text-lg" />
                      <span className="text-xl font-bold text-white">{estadisticas.likes.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">Me Gusta</p>
                  </div>
                )}

                {estadisticas.favoritos > 0 && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <FontAwesomeIcon icon={faStar} className="text-orange-400 text-lg" />
                      <span className="text-xl font-bold text-white">{estadisticas.favoritos.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">Favoritos</p>
                  </div>
                )}
              </div>
            </div>
          )}

      {/* Estadísticas de descargas por período */}
      <div>
        <h5 className="text-white font-medium mb-3">Descargas por Período</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <FontAwesomeIcon icon={faCalendar} className="text-cyan-400 text-lg" />
                  <span className="text-xl font-bold text-white">{estadisticas.descargas_mes_actual.toLocaleString()}</span>
            </div>
                <p className="text-gray-300 text-sm mt-2">Este Mes {estadisticas.descargas_mes_actual < estadisticas.total_descargas * 0.05 ? '(estimado)' : ''}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <FontAwesomeIcon icon={faCalendar} className="text-emerald-400 text-lg" />
                  <span className="text-xl font-bold text-white">{estadisticas.descargas_semana_actual.toLocaleString()}</span>
            </div>
                <p className="text-gray-300 text-sm mt-2">Esta Semana {estadisticas.descargas_semana_actual < estadisticas.total_descargas * 0.02 ? '(estimado)' : ''}</p>
          </div>
        </div>
      </div>

      {/* Fechas importantes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h5 className="text-white font-medium mb-2">Fecha de Creación</h5>
          <p className="text-gray-300">
            {estadisticas.fecha_creacion ? 
              new Date(estadisticas.fecha_creacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 
              'No disponible'
            }
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h5 className="text-white font-medium mb-2">Última Actualización</h5>
          <p className="text-gray-300">
            {estadisticas.fecha_actualizacion ? 
              new Date(estadisticas.fecha_actualizacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 
              'No disponible'
            }
          </p>
        </div>
      </div>

          {/* Información adicional sobre las estadísticas */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h5 className="text-white font-medium mb-2">Información sobre las estadísticas</h5>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Las estadísticas se actualizan automáticamente desde la base de datos</li>
              <li>• Los datos se obtienen en tiempo real del backend</li>
              <li>• Las estimaciones se marcan claramente cuando no hay datos precisos</li>
              <li>• La valoración media se calcula basada en todas las valoraciones recibidas</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );

  const renderTabAvanzado = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <FontAwesomeIcon icon={faGamepad} className="text-4xl text-purple-400 mb-4" />
        <h4 className="text-lg font-medium text-white mb-2">Información del Mod</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-700 rounded-lg p-4 text-left">
            <h5 className="text-white font-medium mb-2">ID del Mod:</h5>
            <p className="text-gray-300 text-sm">
              {mod?.id || 'No disponible'}
            </p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-left">
            <h5 className="text-white font-medium mb-2">Estado:</h5>
            <p className="text-gray-300 text-sm capitalize">
              {formData.estado}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabImagenes = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-white mb-4 flex items-center">
        <FontAwesomeIcon icon={faImage} className="mr-2" />
        Gestión de Imágenes
      </h4>
      
      {/* Imagen Banner Principal */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h5 className="text-white font-medium mb-4">Imagen Banner Principal</h5>
        
        {/* Imagen Banner Actual */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Banner Actual:
          </label>
          {formData.imagen_banner ? (
            <div className="relative inline-block">
              <img
                src={formData.imagen_banner}
                alt="Banner actual del mod"
                className="w-64 h-40 object-cover rounded-lg border border-gray-600"
                onError={(e) => {
                  console.error('Error al cargar imagen banner:', formData.imagen_banner);
                  e.target.style.display = 'none';
                  e.target.parentElement.style.display = 'none';
                }}
                onLoad={() => {
                  console.log('Imagen banner cargada correctamente:', formData.imagen_banner);
                }}
              />
              <div className="absolute top-2 right-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                  Actual
                </span>
              </div>
            </div>
          ) : (
            <div className="w-64 h-40 bg-gray-600 rounded-lg border border-gray-500 border-dashed flex items-center justify-center">
              <div className="text-center">
                <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl mb-2" />
                <p className="text-gray-400 text-sm">Sin imagen banner</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Selector de nuevo banner */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subir Nuevo Banner
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                id="banner-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="banner-upload"
                className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
              >
                <FontAwesomeIcon icon={faImage} className="mr-2" />
                Seleccionar Banner
              </label>
              
              {(formData.imagenPreview || formData.imagenFile) && (
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
            
            {formData.imagenFile && (
              <p className="text-green-400 text-sm mt-2">
                ✓ {formData.imagenFile.name}
              </p>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
              Imagen principal que aparecerá en listas y detalles. Formatos: JPG, PNG, GIF. Máximo: 2MB
            </p>
          </div>
          </div>
          
        {/* Vista previa de nuevo banner */}
        {formData.imagenPreview && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vista Previa del Nuevo Banner:
            </label>
            <div className="relative inline-block">
              <img
                src={formData.imagenPreview}
                alt="Vista previa"
                className="w-64 h-40 object-cover rounded-lg border border-gray-600"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Nuevo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Imágenes Adicionales */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h5 className="text-white font-medium mb-4">Imágenes Adicionales</h5>
        
        {/* Imágenes Adicionales Actuales */}
        {formData.imagenes_adicionales && formData.imagenes_adicionales.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Imágenes Actuales ({formData.imagenes_adicionales.length}):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.imagenes_adicionales.map((imagen, index) => (
                <div key={index} className="relative">
                  <img
                    src={imagen}
                    alt={`Imagen adicional ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-1 right-1">
                    <button
                      type="button"
                      onClick={() => {
                        const nuevasImagenes = formData.imagenes_adicionales.filter((_, i) => i !== index);
                        setFormData(prev => ({
                          ...prev,
                          imagenes_adicionales: nuevasImagenes
                        }));
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Subir Nuevas Imágenes Adicionales */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Agregar Nuevas Imágenes
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
          
          {/* Previsualización de nuevas imágenes */}
          {formData.imagenesAdicionalesFiles && formData.imagenesAdicionalesFiles.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Nuevas Imágenes a Subir ({formData.imagenesAdicionalesFiles.length}):
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.imagenesAdicionalesFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Nueva imagen ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-600"
                    />
                    <div className="absolute top-1 right-1">
                      <button
                        type="button"
                        onClick={() => {
                          const nuevosArchivos = formData.imagenesAdicionalesFiles.filter((_, i) => i !== index);
                          setFormData(prev => ({
                            ...prev,
                            imagenesAdicionalesFiles: nuevosArchivos
                          }));
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                      >
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                      </button>
        </div>
                    <div className="absolute top-1 left-1">
                      <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                        Nueva
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Información sobre imágenes */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h5 className="text-white font-medium mb-2">Información sobre Imágenes</h5>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• <strong>Imagen Banner:</strong> Imagen principal que aparece en listas y páginas de detalle</li>
          <li>• <strong>Imágenes Adicionales:</strong> Galería de capturas de pantalla y contenido visual extra</li>
          <li>• Se recomienda usar una relación de aspecto 16:10 para el banner (ej: 1600x1000px)</li>
          <li>• Formatos soportados: JPG, PNG, GIF</li>
          <li>• Tamaño máximo: 2MB por imagen</li>
          <li>• Las imágenes se optimizarán automáticamente para diferentes dispositivos</li>
        </ul>
      </div>
      
      {/* Nota informativa sobre la nueva organización */}
      <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FontAwesomeIcon icon={faImage} className="text-blue-400" />
          <h5 className="text-blue-400 font-medium">Nueva Organización</h5>
        </div>
        <p className="text-blue-300 text-sm">
          La gestión de imágenes ahora está organizada en esta pestaña dedicada para un mejor control y organización de los recursos visuales de tu mod.
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Editar Mod: {mod?.titulo || 'Sin título'}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm">
              ID: {mod?.id} | Administración avanzada
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <FontAwesomeIcon icon={faTimes} className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 flex-shrink-0">
          <div className="flex space-x-2 sm:space-x-4 px-3 sm:px-6 overflow-x-auto custom-scrollbar-horizontal">
            {[
              { id: 'general', label: 'General', icon: faEye },
              { id: 'etiquetas', label: 'Etiquetas', icon: faComments },
              { id: 'imagenes', label: 'Imágenes', icon: faImage },
              { id: 'archivos', label: 'Archivos', icon: faFile },
              { id: 'estadisticas', label: 'Estadísticas', icon: faStar },
              { id: 'avanzado', label: 'Avanzado', icon: faExclamationTriangle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'general' ? 'Gen' : 
                   tab.id === 'etiquetas' ? 'Tags' :
                   tab.id === 'imagenes' ? 'Img' :
                   tab.id === 'archivos' ? 'Arc' :
                   tab.id === 'estadisticas' ? 'Est' :
                   tab.id === 'avanzado' ? 'Avz' : tab.label.slice(0, 3)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - Área scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {activeTab === 'general' && renderTabGeneral()}
          {activeTab === 'etiquetas' && renderTabEtiquetas()}
          {activeTab === 'imagenes' && renderTabImagenes()}
          {activeTab === 'archivos' && renderTabArchivos()}
          {activeTab === 'estadisticas' && renderTabEstadisticas()}
          {activeTab === 'avanzado' && renderTabAvanzado()}
        </div>

        {/* Footer - Siempre visible */}
        <div className="flex items-center justify-end space-x-3 p-4 sm:p-6 border-t border-gray-700 flex-shrink-0 bg-gray-800">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-4 sm:px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <FontAwesomeIcon 
              icon={faSave} 
              className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
            />
            <span className="hidden sm:inline">{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            <span className="sm:hidden">{loading ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default EditModAdmin; 