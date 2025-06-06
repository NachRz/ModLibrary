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
  faGamepad,
  faEdit,
  faCog,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../../../../../context/NotificationContext';
import { useAuth } from '../../../../../context/AuthContext';
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
      <span className="game-single-title">{children}</span>
      <span className="game-single-rating" style={{ marginLeft: '8px', color: '#9CA3AF', fontSize: '0.875rem' }}>
        <span style={{ color: '#F59E0B' }}>★</span>
        {data.game?.rating ? data.game.rating.toFixed(1) : 'N/A'}
      </span>
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
  const { isAdmin } = useAuth();
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
  const [errorGames, setErrorGames] = useState(null);
  const [initialGameOptions, setInitialGameOptions] = useState([]);
  const [isSyncingGame, setIsSyncingGame] = useState(false);

  // Estados para manejo de imagen banner (copiado del modal de usuarios)
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [selectedBannerFile, setSelectedBannerFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState('');
  const [bannerImageTimestamp, setBannerImageTimestamp] = useState(Date.now());

  // Estados para manejo de imágenes adicionales
  const [uploadingAdditionalImages, setUploadingAdditionalImages] = useState(false);
  const [selectedAdditionalFiles, setSelectedAdditionalFiles] = useState([]);
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState([]);
  const [deletingImageIndex, setDeletingImageIndex] = useState(null);

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      // Resetear todos los estados cuando se cierra el modal
      setSelectedTags([]);
      setSelectedGame(null);
      setActiveTab('general');
      setLoading(false);
      setErrorGames(null);
      setIsSyncingGame(false);
      
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

      // Limpiar estados de banner
      setSelectedBannerFile(null);
      setBannerPreviewUrl('');
      setUploadingBanner(false);
      setBannerImageTimestamp(Date.now());

      // Limpiar estados de imágenes adicionales
      setSelectedAdditionalFiles([]);
      setAdditionalPreviewUrls([]);
      setUploadingAdditionalImages(false);
      setDeletingImageIndex(null);
    }
  }, [isOpen]);

  // Cambiar pestaña si el usuario no es administrador y está en "avanzado"
  useEffect(() => {
    if (!isAdmin && activeTab === 'avanzado') {
      setActiveTab('general');
    }
  }, [isAdmin, activeTab]);

  // Efecto para actualizar preview de banner cuando cambie imagen_banner desde la carga de datos
  useEffect(() => {
    if (formData.imagen_banner && !selectedBannerFile) {
      const timestamp = Date.now();
      setBannerImageTimestamp(timestamp);
      // Construir URL completa desde la ruta relativa
      let imageUrl = formData.imagen_banner;
      if (!imageUrl.startsWith('http')) {
        imageUrl = `http://localhost:8000/storage/${imageUrl}`;
      }
      setBannerPreviewUrl(`${imageUrl}?t=${timestamp}`);
      console.log('Preview URL establecida:', `${imageUrl}?t=${timestamp}`);
    } else if (!formData.imagen_banner && !selectedBannerFile) {
      setBannerPreviewUrl('');
      console.log('Preview URL limpiada');
    }
  }, [formData.imagen_banner, selectedBannerFile]);

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

      console.log('=== DEBUG IMAGEN BANNER ===');
      console.log('modCompleto completo:', modCompleto);
      console.log('modCompleto.imagen_banner:', modCompleto.imagen_banner);
      console.log('modCompleto.imagen:', modCompleto.imagen);
      console.log('============================');
      
      console.log('=== DEBUG IMÁGENES ADICIONALES ===');
      console.log('modCompleto.imagenes_adicionales:', modCompleto.imagenes_adicionales);
      console.log('Tipo:', typeof modCompleto.imagenes_adicionales);
      console.log('Es array:', Array.isArray(modCompleto.imagenes_adicionales));
      console.log('=====================================');

      // Procesar imágenes adicionales correctamente
      let imagenesAdicionalesProcesadas = [];
      if (modCompleto.imagenes_adicionales) {
        let imagenesRaw = modCompleto.imagenes_adicionales;
        
        // Si es string, parsearlo
        if (typeof imagenesRaw === 'string') {
          try {
            imagenesRaw = JSON.parse(imagenesRaw);
          } catch (e) {
            console.error('Error parsing imagenes_adicionales:', e);
            imagenesRaw = [];
          }
        }
        
        // Si es array, procesarlo
        if (Array.isArray(imagenesRaw)) {
          imagenesAdicionalesProcesadas = imagenesRaw.map(img => {
            // Si ya es una URL completa, devolverla tal como está
            if (typeof img === 'string' && img.startsWith('http')) {
              return img;
            }
            // Si es una ruta relativa, construir la URL completa
            const rutaLimpia = img.startsWith('storage/') ? img : `storage/${img}`;
            return `http://localhost:8000/${rutaLimpia}`;
          });
        }
      }

      console.log('Imágenes adicionales procesadas:', imagenesAdicionalesProcesadas);
        
      // Cargar datos del mod (desde backend o prop)
      const modData = {
        titulo: modCompleto.titulo || '',
        descripcion: modCompleto.descripcion || '',
        estado: modCompleto.estado || 'borrador',
        edad_recomendada: modCompleto.edad_recomendada || 0,
        version: modCompleto.version || modCompleto.version_actual || '1.0',
        etiquetas: modCompleto.etiquetas || [],
        // Guardar solo la ruta relativa, sin el dominio
        imagen_banner: modCompleto.imagen_banner || modCompleto.imagen || '',
        imagenes_adicionales: imagenesAdicionalesProcesadas,
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
      
      showNotification(`Error al sincronizar juego: ${error.message}`, 'error');
    } finally {
      setIsSyncingGame(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejador para la carga de imagen banner (mejorado copiando del modal de usuarios)
  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecciona un archivo de imagen válido', 'error');
        return;
      }
      
      // Validar tamaño (máximo 5MB como en el modal de usuarios)
      if (file.size > 5 * 1024 * 1024) {
        showNotification('La imagen es demasiado grande. Máximo 5MB', 'error');
        return;
      }

      setSelectedBannerFile(file);
      
      // Crear preview usando FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Limpiar error previo
      console.log('Banner file selected:', file.name);
    }
  };

  // Función para subir imagen banner (copiado del modal de usuarios)
  const uploadBannerImage = async () => {
    if (!selectedBannerFile) return null;
    
    try {
      setUploadingBanner(true);
      const uploadFormData = new FormData();
      uploadFormData.append('imagen_banner', selectedBannerFile);
      uploadFormData.append('mod_id', mod.id);
      
      // Usar el servicio de mods para subir la imagen
      const response = await modService.uploadBannerImage(uploadFormData);
      
      // Actualizar timestamp para forzar actualización de imagen
      setBannerImageTimestamp(Date.now());
      
      return response.data.url || response.data.imagen_banner;
    } catch (error) {
      console.error('Error uploading banner:', error);
      throw new Error('Error al subir la imagen banner: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploadingBanner(false);
    }
  };

  // Función para limpiar la imagen banner seleccionada (copiado del modal de usuarios)
  const clearBannerImage = () => {
    setSelectedBannerFile(null);
    setBannerPreviewUrl('');
    setBannerImageTimestamp(Date.now());
    setFormData(prev => ({
      ...prev,
      imagen_banner: ''
    }));
  };

  // Manejador para la carga de imagen (mantenido para compatibilidad)
  const handleImageUpload = (e) => {
    handleBannerFileChange(e);
  };

  // Función para limpiar la imagen seleccionada (mantenido para compatibilidad)
  const clearSelectedImage = () => {
    clearBannerImage();
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

  // Función para manejar selección de imágenes adicionales (mejorada con subida separada)
  const handleAdditionalImagesFileChange = (e) => {
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
      
      // Validar tamaño (máximo 5MB como el banner)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`Archivo ${index + 1}: Tamaño mayor a 5MB`);
        return;
      }
      
      validFiles.push(file);
    });
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
      showNotification(errors.join(', '), 'error');
    }
    
    // Si hay archivos válidos, procesarlos
    if (validFiles.length > 0) {
      setSelectedAdditionalFiles(prev => [...prev, ...validFiles]);
      
      // Crear previews para los nuevos archivos
      const newPreviews = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(newPreviews).then(previews => {
        setAdditionalPreviewUrls(prev => [...prev, ...previews]);
      });
      
      showNotification(`${validFiles.length} imagen(es) agregada(s) para subir`, 'success');
    }
  };

  // Función para subir imágenes adicionales
  const uploadAdditionalImages = async () => {
    if (!selectedAdditionalFiles || selectedAdditionalFiles.length === 0) return null;
    
    try {
      setUploadingAdditionalImages(true);
      const uploadFormData = new FormData();
      
      selectedAdditionalFiles.forEach((file, index) => {
        uploadFormData.append('imagenes_adicionales[]', file);
      });
      uploadFormData.append('mod_id', mod.id);
      
      const response = await modService.uploadAdditionalImages(uploadFormData);
      
      console.log('Imágenes adicionales subidas:', response);
      return response.data;
    } catch (error) {
      console.error('Error uploading additional images:', error);
      throw new Error('Error al subir las imágenes adicionales: ' + (error.message || 'Error desconocido'));
    } finally {
      setUploadingAdditionalImages(false);
    }
  };

  // Función para eliminar imagen adicional seleccionada (antes de subir)
  const removeSelectedAdditionalImage = (index) => {
    setSelectedAdditionalFiles(prev => prev.filter((_, i) => i !== index));
    setAdditionalPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Función para eliminar imagen adicional ya subida
  const deleteExistingAdditionalImage = async (imagePath, index) => {
    try {
      setDeletingImageIndex(index);
      
      console.log('=== ELIMINAR IMAGEN ADICIONAL ===');
      console.log('imagePath recibido:', imagePath);
      console.log('index:', index);
      console.log('formData.imagenes_adicionales:', formData.imagenes_adicionales);
      
      await modService.deleteAdditionalImage(mod.id, imagePath);
      
      // Actualizar el estado local - mejorar la lógica de filtrado
      const nuevasImagenes = formData.imagenes_adicionales.filter(img => {
        console.log('Comparando imagen:', img);
        
        // Obtener la ruta relativa de la imagen actual
        let rutaRelativaImg = img;
        if (img.includes('/storage/')) {
          rutaRelativaImg = img.split('/storage/')[1];
        } else if (img.includes('storage/')) {
          rutaRelativaImg = img.split('storage/')[1];
        }
        
        console.log('Ruta relativa de imagen:', rutaRelativaImg);
        console.log('Ruta a eliminar:', imagePath);
        console.log('¿Coincide?', rutaRelativaImg === imagePath);
        
        return rutaRelativaImg !== imagePath;
      });
      
      console.log('Imágenes después del filtro:', nuevasImagenes);
      
      setFormData(prev => ({
        ...prev,
        imagenes_adicionales: nuevasImagenes
      }));
      
      showNotification('Imagen eliminada correctamente', 'success');
    } catch (error) {
      console.error('Error deleting additional image:', error);
      showNotification('Error al eliminar la imagen: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setDeletingImageIndex(null);
    }
  };

  // Función para limpiar todas las imágenes adicionales seleccionadas
  const clearSelectedAdditionalImages = () => {
    setSelectedAdditionalFiles([]);
    setAdditionalPreviewUrls([]);
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
      console.log('Banner file selected:', selectedBannerFile);
      
      // Validaciones básicas
      if (!formData.titulo.trim()) {
        showNotification('El título es obligatorio', 'error');
        return;
      }
      
      if (!formData.descripcion.trim()) {
        showNotification('La descripción es obligatoria', 'error');
        return;
      }

      // Subir imagen banner si hay un archivo seleccionado
      let finalBannerUrl = formData.imagen_banner;
      if (selectedBannerFile) {
        try {
          finalBannerUrl = await uploadBannerImage();
          console.log('Banner uploaded successfully:', finalBannerUrl);
        } catch (uploadError) {
          console.error('Error uploading banner:', uploadError);
          showNotification('Error al subir la imagen banner: ' + uploadError.message, 'error');
          return;
        }
      }

      // Subir imágenes adicionales si hay archivos seleccionados
      if (selectedAdditionalFiles && selectedAdditionalFiles.length > 0) {
        try {
          const additionalImagesResult = await uploadAdditionalImages();
          console.log('Additional images uploaded successfully:', additionalImagesResult);
          
          // Actualizar el estado local con las nuevas imágenes
          if (additionalImagesResult && additionalImagesResult.todas_las_imagenes) {
            setFormData(prev => ({
              ...prev,
              imagenes_adicionales: additionalImagesResult.todas_las_imagenes.map(img => `${window.location.origin}/storage/${img}`)
            }));
          }
          
          // Limpiar archivos seleccionados después de subirlos
          clearSelectedAdditionalImages();
          
          showNotification(`${additionalImagesResult.total_imagenes_subidas} imagen(es) adicional(es) subida(s) correctamente`, 'success');
        } catch (uploadError) {
          console.error('Error uploading additional images:', uploadError);
          showNotification('Error al subir las imágenes adicionales: ' + uploadError.message, 'error');
          return;
        }
      }

      // Preparar datos para enviar al backend (ahora sin imágenes ya que se subieron por separado)
      console.log('Usando JSON - imágenes subidas por separado');
      const updateData = {
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
      
      // Agregar imagen banner URL si se subió o cambió
      if (finalBannerUrl) {
        updateData.imagen_banner = finalBannerUrl;
      }
      
      // Agregar juego_id si está seleccionado
      if (formData.juego_id) {
        updateData.juego_id = formData.juego_id;
      }
      
      console.log('Datos JSON a enviar:', updateData);

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
            creador: mod.creador?.nome || mod.creador?.nombre || 'Usuario', // Usar el nombre del creador
            juego: mod.juego?.titulo || mod.juego?.title || mod.juego?.nombre || 'Juego', // Usar el título del juego
            // Campos adicionales para que el modal funcione correctamente
            imagen_banner: finalBannerUrl || response.data?.imagen_banner || formData.imagen_banner,
            descripcion: formData.descripcion,
            edad_recomendada: formData.edad_recomendada,
            version_actual: formData.version || formData.version_actual,
            url: formData.url,
            es_destacado: formData.es_destacado,
            permitir_comentarios: formData.permitir_comentarios,
            visible_en_busqueda: formData.visible_en_busqueda,
            etiquetas: formData.etiquetas || [],
            // Pasar información sobre juegos eliminados
            juego_eliminado: response.juego_eliminado
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
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500/20 border-t-purple-500"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-purple-500/10"></div>
          </div>
          <span className="ml-3 text-gray-300">Cargando datos del mod...</span>
        </div>
      ) : (
        <>
          {/* Información básica */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-lg mr-2">
                <FontAwesomeIcon icon={faEye} className="text-blue-400" />
              </div>
              Información Básica
            </h4>
            
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
                    className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
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
                    className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    placeholder="1.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de descarga
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    placeholder="https://ejemplo.com/mi-mod.zip"
                  />
                  <small className="text-gray-400 text-sm mt-1 block">
                    Enlace directo donde los usuarios pueden descargar el mod
                  </small>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <FontAwesomeIcon icon={faGamepad} className="mr-2 text-green-400" />
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
                  {isSyncingGame && (
                    <p className="text-blue-400 text-sm mt-1 flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-400 border-t-transparent mr-2"></div>
                      Sincronizando juego en segundo plano...
                    </p>
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
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      minHeight: '45px'
                    }}
                  >
                    <option value="borrador" style={{ backgroundColor: '#374151', color: 'white' }}>Borrador</option>
                    <option value="publicado" style={{ backgroundColor: '#374151', color: 'white' }}>Publicado</option>
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
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                    style={{
                      backgroundColor: '#374151',
                      borderColor: '#4B5563',
                      minHeight: '45px'
                    }}
                  >
                    <option value={0} style={{ backgroundColor: '#374151', color: 'white' }}>Sin clasificar</option>
                    <option value={3} style={{ backgroundColor: '#374151', color: 'white' }}>3+ años</option>
                    <option value={7} style={{ backgroundColor: '#374151', color: 'white' }}>7+ años</option>
                    <option value={12} style={{ backgroundColor: '#374151', color: 'white' }}>12+ años</option>
                    <option value={16} style={{ backgroundColor: '#374151', color: 'white' }}>16+ años</option>
                    <option value={18} style={{ backgroundColor: '#374151', color: 'white' }}>18+ años</option>
                  </select>
                </div>

                <div className="bg-gradient-to-br from-gray-700/40 to-gray-600/30 rounded-lg p-4 border border-gray-600/30">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Configuraciones
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="es_destacado"
                        checked={formData.es_destacado}
                        onChange={handleInputChange}
                        className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 accent-purple-500"
                      />
                      <span className="text-sm text-gray-300">Marcar como destacado</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="permitir_comentarios"
                        checked={formData.permitir_comentarios}
                        onChange={handleInputChange}
                        className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 accent-purple-500"
                      />
                      <span className="text-sm text-gray-300">Permitir comentarios</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="visible_en_busqueda"
                        checked={formData.visible_en_busqueda}
                        onChange={handleInputChange}
                        className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500 accent-purple-500"
                      />
                      <span className="text-sm text-gray-300">Visible en búsquedas</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción completa */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-2">
                <FontAwesomeIcon icon={faComments} className="text-green-400" />
              </div>
              Descripción Completa
            </h4>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={6}
              className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
              placeholder="Descripción detallada del mod..."
            />
          </div>
        </>
      )}
    </div>
  );

  const renderTabEtiquetas = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-5 border border-gray-600/30">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
          <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg mr-2">
            <FontAwesomeIcon icon={faTag} className="text-green-400" />
          </div>
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
            className="select-container-tags"
            classNamePrefix="select"
            styles={{
              control: (provided) => ({
                ...provided,
                backgroundColor: '#374151',
                borderColor: '#4B5563',
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
          <small className="text-gray-400 text-sm mt-1 block">
            Las etiquetas ayudan a categorizar y encontrar tu mod más fácilmente
          </small>
        </div>

        {/* Mostrar etiquetas seleccionadas */}
        {selectedTags && selectedTags.length > 0 && (
          <div className="bg-gradient-to-br from-gray-700/40 to-gray-600/30 rounded-lg p-4 border border-gray-600/30">
            <h5 className="text-white font-medium mb-3 flex items-center">
              <FontAwesomeIcon icon={faTag} className="mr-2 text-green-400" />
              Etiquetas Seleccionadas ({selectedTags.length})
            </h5>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <div key={index} className="inline-flex items-center bg-gradient-to-r from-green-600/80 to-green-700/80 text-white text-sm rounded-full px-3 py-1 border border-green-500/30">
                  <span>{tag.label}</span>
                  <button
                    onClick={() => {
                      const newTags = selectedTags.filter((_, i) => i !== index);
                      setSelectedTags(newTags);
                      setFormData(prev => ({
                        ...prev,
                        etiquetas: newTags.map(t => t.value)
                      }));
                    }}
                    className="ml-2 text-green-200 hover:text-white focus:outline-none transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Información sobre etiquetas */}
      <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FontAwesomeIcon icon={faTag} className="text-blue-400" />
          <h5 className="text-blue-400 font-medium">Consejos sobre Etiquetas</h5>
        </div>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Usa etiquetas específicas y relevantes para tu mod</li>
          <li>• Las etiquetas populares ayudan a que tu mod sea más descubrible</li>
          <li>• Evita usar demasiadas etiquetas (5-10 es ideal)</li>
          <li>• Puedes crear nuevas etiquetas si no encuentras las que necesitas</li>
        </ul>
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
          <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FontAwesomeIcon icon={faStar} className="text-blue-400" />
              <h5 className="text-blue-400 font-medium">Información sobre las estadísticas</h5>
            </div>
            <ul className="text-blue-200 text-sm space-y-1">
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
        
        {/* Imagen Banner Actual y Nueva */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Banner:
          </label>
          
          {/* Mostrar imagen actual y/o nueva */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Banner actual (si existe y no hay archivo seleccionado) */}
            {formData.imagen_banner && !selectedBannerFile && (
              <div className="relative">
                <label className="block text-xs text-gray-400 mb-2">Banner Actual:</label>
                <div className="relative inline-block">
                  <img
                    src={bannerPreviewUrl || (() => {
                      let imageUrl = formData.imagen_banner;
                      if (!imageUrl.startsWith('http')) {
                        imageUrl = `http://localhost:8000/storage/${imageUrl}`;
                      }
                      return `${imageUrl}?t=${bannerImageTimestamp}`;
                    })()}
                    alt="Banner actual del mod"
                    className="w-full h-40 object-cover rounded-lg border border-gray-600"
                    onError={(e) => {
                      console.error('Error al cargar imagen banner:', e.target.src);
                      console.error('formData.imagen_banner:', formData.imagen_banner);
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.no-image-fallback').style.display = 'flex';
                    }}
                    onLoad={(e) => {
                      console.log('Imagen banner cargada correctamente:', e.target?.src || 'URL no disponible');
                    }}
                  />
                  <div className="no-image-fallback w-full h-40 bg-gray-600 rounded-lg border border-gray-500 border-dashed items-center justify-center hidden">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl mb-2" />
                      <p className="text-gray-400 text-sm">Error al cargar imagen</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      Actual
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Vista previa de nuevo banner */}
            {bannerPreviewUrl && selectedBannerFile && (
              <div className="relative">
                <label className="block text-xs text-gray-400 mb-2">Nuevo Banner:</label>
                <div className="relative inline-block">
                  <img
                    src={bannerPreviewUrl}
                    alt="Vista previa del nuevo banner"
                    className="w-full h-40 object-cover rounded-lg border border-gray-600"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      Nuevo
                    </span>
                  </div>
                  {uploadingBanner && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-white text-sm flex items-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        Subiendo...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Placeholder si no hay imagen */}
            {!formData.imagen_banner && !selectedBannerFile && (
              <div className="w-full h-40 bg-gray-600 rounded-lg border border-gray-500 border-dashed flex items-center justify-center">
                <div className="text-center">
                  <FontAwesomeIcon icon={faImage} className="text-gray-400 text-2xl mb-2" />
                  <p className="text-gray-400 text-sm">Sin imagen banner</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Controles de subida */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {formData.imagen_banner ? 'Cambiar Banner' : 'Subir Nuevo Banner'}
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                id="banner-upload"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="hidden"
                disabled={uploadingBanner}
              />
              <label
                htmlFor="banner-upload"
                className={`cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block ${
                  uploadingBanner ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FontAwesomeIcon icon={uploadingBanner ? faSpinner : faImage} className={`mr-2 ${uploadingBanner ? 'animate-spin' : ''}`} />
                {uploadingBanner ? 'Subiendo...' : 'Seleccionar Banner'}
              </label>
              
              {(selectedBannerFile || formData.imagen_banner) && !uploadingBanner && (
                <button
                  type="button"
                  onClick={clearBannerImage}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-1" />
                  Eliminar
                </button>
              )}
            </div>
            
            {selectedBannerFile && !uploadingBanner && (
              <p className="text-green-400 text-sm mt-2">
                ✓ {selectedBannerFile.name} ({(selectedBannerFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
              Imagen principal que aparecerá en listas y detalles. Formatos: JPG, PNG, GIF. Máximo: 5MB
            </p>
          </div>
        </div>
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
              {formData.imagenes_adicionales.map((imagen, index) => {
                console.log(`Renderizando imagen adicional ${index + 1}:`, imagen);
                
                // Obtener la ruta relativa para la eliminación
                let rutaRelativa = imagen;
                if (imagen.includes('/storage/')) {
                  rutaRelativa = imagen.split('/storage/')[1];
                } else if (imagen.includes('storage/')) {
                  rutaRelativa = imagen.split('storage/')[1];
                }
                
                console.log(`Ruta relativa calculada para imagen ${index + 1}:`, rutaRelativa);
                
                return (
                  <div key={index} className="relative">
                    <img
                      src={imagen}
                      alt={`Imagen adicional ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-600"
                      onError={(e) => {
                        console.error(`Error cargando imagen adicional ${index + 1}:`, imagen);
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.no-image-fallback');
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                      onLoad={(e) => {
                        console.log(`Imagen adicional ${index + 1} cargada correctamente:`, imagen);
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
                        onClick={() => deleteExistingAdditionalImage(rutaRelativa, index)}
                        disabled={deletingImageIndex === index}
                        className={`bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs transition-all ${
                          deletingImageIndex === index ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deletingImageIndex === index ? (
                          <FontAwesomeIcon icon={faSpinner} className="w-3 h-3 animate-spin" />
                        ) : (
                          <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="absolute top-1 left-1">
                      <span className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vista previa de nuevas imágenes seleccionadas */}
        {selectedAdditionalFiles && selectedAdditionalFiles.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Nuevas Imágenes Seleccionadas ({selectedAdditionalFiles.length}):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {additionalPreviewUrls.map((previewUrl, index) => (
                <div key={index} className="relative">
                  <img
                    src={previewUrl}
                    alt={`Nueva imagen ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-600"
                  />
                  <div className="absolute top-1 right-1">
                    <button
                      type="button"
                      onClick={() => removeSelectedAdditionalImage(index)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full text-xs"
                    >
                      <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute top-1 left-1">
                    <span className="bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                      Nuevo
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
              ))}
            </div>
            
            {/* Botones de control para nuevas imágenes */}
            <div className="flex items-center space-x-3 mt-3">
              <button
                type="button"
                onClick={clearSelectedAdditionalImages}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="mr-1" />
                Limpiar Selección
              </button>
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
              id="imagenes-adicionales-upload-new"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesFileChange}
              className="hidden"
              disabled={uploadingAdditionalImages}
            />
            <label
              htmlFor="imagenes-adicionales-upload-new"
              className={`cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block ${
                uploadingAdditionalImages ? 'opacity-50 cursor-not-allowed' : ''
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
      </div>
      
      {/* Información sobre imágenes */}
      <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FontAwesomeIcon icon={faImage} className="text-blue-400" />
          <h5 className="text-blue-400 font-medium">Información sobre Imágenes</h5>
        </div>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• <strong>Imagen Banner:</strong> Imagen principal que aparece en listas y páginas de detalle</li>
          <li>• <strong>Imágenes Adicionales:</strong> Galería de capturas de pantalla y contenido visual extra</li>
          <li>• Se recomienda usar una relación de aspecto 16:10 para el banner (ej: 1600x1000px)</li>
          <li>• Formatos soportados: JPG, PNG, GIF</li>
          <li>• Tamaño máximo: 5MB por imagen (igual que fotos de perfil)</li>
          <li>• Las imágenes se optimizarán automáticamente para diferentes dispositivos</li>
          <li>• El banner se sube por separado para mejor rendimiento</li>
        </ul>
      </div>

      {/* Información sobre imágenes mejorada */}
      <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <FontAwesomeIcon icon={faImage} className="text-blue-400" />
          <h5 className="text-blue-400 font-medium">Sistema de Gestión de Imágenes</h5>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h6 className="text-blue-300 font-medium mb-2">Características:</h6>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• <strong>Banner:</strong> Subida independiente con preview en tiempo real</li>
              <li>• <strong>Adicionales:</strong> Subida múltiple con vista previa inmediata</li>
              <li>• <strong>Eliminación:</strong> Individual con confirmación visual</li>
              <li>• <strong>Organización:</strong> Estructura de carpetas por mod</li>
            </ul>
          </div>
          <div>
            <h6 className="text-blue-300 font-medium mb-2">Especificaciones:</h6>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• <strong>Formatos:</strong> JPG, PNG, GIF</li>
              <li>• <strong>Tamaño máximo:</strong> 5MB por imagen</li>
              <li>• <strong>Banner recomendado:</strong> 1600x1000px (16:10)</li>
              <li>• <strong>Límite adicionales:</strong> 10 imágenes máximo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-4xl h-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-700/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center justify-between p-3 sm:p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-lg">
                <FontAwesomeIcon icon={faEdit} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Editar Mod: {mod?.titulo || 'Sin título'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  ID: {mod?.id} | Administración avanzada
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Tabs con mejor diseño */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex space-x-1 px-3 sm:px-5 overflow-x-auto custom-scrollbar-horizontal">
            {[
              { id: 'general', label: 'General', icon: faEye, color: 'blue' },
              { id: 'etiquetas', label: 'Etiquetas', icon: faTag, color: 'green' },
              { id: 'imagenes', label: 'Imágenes', icon: faImage, color: 'purple' },
              { id: 'estadisticas', label: 'Estadísticas', icon: faStar, color: 'yellow' },
              ...(isAdmin ? [{ id: 'avanzado', label: 'Avanzado', icon: faCog, color: 'red' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 sm:py-3 px-2 sm:px-4 text-sm font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-600/20 to-${tab.color}-700/30 text-${tab.color}-300 border-b-2 border-${tab.color}-500`
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.id === 'general' ? 'Gen' : 
                   tab.id === 'etiquetas' ? 'Tags' :
                   tab.id === 'imagenes' ? 'Img' :
                   tab.id === 'estadisticas' ? 'Est' :
                   tab.id === 'avanzado' ? 'Avz' : tab.label.slice(0, 3)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content - Área scrolleable */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar min-h-0">
          {activeTab === 'general' && renderTabGeneral()}
          {activeTab === 'etiquetas' && renderTabEtiquetas()}
          {activeTab === 'imagenes' && renderTabImagenes()}
          {activeTab === 'estadisticas' && renderTabEstadisticas()}
          {activeTab === 'avanzado' && isAdmin && renderTabAvanzado()}
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-3 sm:p-5 flex-shrink-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-3 sm:px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50 text-sm"
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
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default EditModAdmin; 