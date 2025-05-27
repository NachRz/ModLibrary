import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/components/mods/CrearMod.css';
import modService from '../../services/api/modService';
import gameService from '../../services/api/gameService';
import etiquetasService from '../../services/api/etiquetasService';
import AsyncSelect from 'react-select/async';

// Componente personalizado para la opción del select
const CustomOption = ({ innerProps, label, data }) => (
  <div {...innerProps} className="game-option">
    <div className="game-option-image">
      {data.game.background_image ? (
        <img src={data.game.background_image} alt={label} />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}
    </div>
    <div className="game-option-info">
      <div className="game-option-title">{label}</div>
      <div className="game-option-rating">
        <span className="rating-star">★</span>
        {data.game.rating ? data.game.rating.toFixed(1) : 'N/A'}
      </div>
    </div>
  </div>
);

// Componente personalizado para el valor seleccionado
const CustomSingleValue = ({ children, data }) => (
  <div className="game-single-value">
    <div className="game-single-image">
      {data.game.background_image ? (
        <img src={data.game.background_image} alt={children} />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}
    </div>
    <div className="game-single-info">
      <div className="game-single-title">{children}</div>
      <div className="game-single-rating">
        <span className="rating-star">★</span>
        {data.game.rating ? data.game.rating.toFixed(1) : 'N/A'}
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

// Componente personalizado para el valor seleccionado de etiqueta
const CustomTagValue = ({ children, data }) => (
  <div className="tag-single-value">
    <div className="tag-single-name">{data.label}</div>
    <div className="tag-single-count">
      {data.juegos_count.toLocaleString()} juegos
    </div>
  </div>
);

const CrearMod = () => {
  const navigate = useNavigate();
  
  // Estado para controlar el envío del formulario
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // Estado para la lista de juegos
  const [loadingJuegos, setLoadingJuegos] = useState(false);
  const [errorJuegos, setErrorJuegos] = useState(null);
  const [initialOptions, setInitialOptions] = useState([]);
  
  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen: null,
    imagenPreview: '',
    juego_id: null,
    edad_recomendada: 12,
    version_juego_necesaria: '',
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
  
  // Lista hardcoded de etiquetas disponibles
  const etiquetasDisponibles = [
    { id: 1, nombre: 'Gameplay' },
    { id: 2, nombre: 'Gráficos' },
    { id: 3, nombre: 'Calidad de vida' },
    { id: 4, nombre: 'Inmersión' },
    { id: 5, nombre: 'Nuevos contenidos' },
    { id: 6, nombre: 'Herramientas' },
    { id: 7, nombre: 'Sonido' },
    { id: 8, nombre: 'Personajes' }
  ];
  
  // Cargar opciones iniciales cuando se monta el componente
  useEffect(() => {
    const loadInitialGames = async () => {
      try {
        const games = await gameService.getInitialGames();
        const options = games.map(game => ({
          value: game.id,
          label: game.title,
          game: game
        }));
        setInitialOptions(options);
      } catch (error) {
        setErrorJuegos(error.message);
      }
    };

    loadInitialGames();
  }, []);
  
  // Función para cargar opciones de juegos
  const loadGameOptions = async (inputValue) => {
    try {
      setLoadingJuegos(true);
      
      if (!inputValue) {
        return initialOptions;
      }
      
      const games = await gameService.searchRawgGames(inputValue);
      return games.map(game => ({
        value: game.id,
        label: game.title,
        game: game
      }));
    } catch (error) {
      setErrorJuegos(error.message);
      return [];
    } finally {
      setLoadingJuegos(false);
    }
  };
  
  // Manejador para cambios en el select de juegos
  const handleGameChange = async (selectedOption) => {
    if (selectedOption) {
      try {
        // Mostrar estado de carga
        setLoadingJuegos(true);
        setErrorJuegos(null);

        // Verificar y sincronizar el juego
        const syncedGame = await gameService.verifyAndSyncGame(selectedOption.value);

        // Actualizar el formData con el ID del juego sincronizado
        setFormData(prev => ({
          ...prev,
          juego_id: syncedGame.id // Usamos el ID de nuestra base de datos, no el RAWG ID
        }));
        
        // Limpiar el error para este campo
        if (errors.juego_id) {
          setErrors(prev => ({ ...prev, juego_id: '' }));
        }
      } catch (error) {
        console.error('Error al sincronizar el juego:', error);
        setErrorJuegos(error.message || 'Error al sincronizar el juego con la base de datos');
        
        // Limpiar la selección en caso de error
        setFormData(prev => ({
          ...prev,
          juego_id: null
        }));
      } finally {
        setLoadingJuegos(false);
      }
    }
  };
  
  // Manejador para cambios en los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'juego_id') {
      // Asegurarnos de que juego_id sea un número
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Limpiar el error para este campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Función para cargar opciones de etiquetas
  const loadTagOptions = async (inputValue) => {
    try {
      setLoadingTags(true);
      setErrorTags(null);

      const response = await etiquetasService.searchTags(inputValue);
      
      return response.etiquetas.map(tag => ({
        value: tag.id,
        label: tag.name,
        juegos_count: tag.juegos_count
      }));
    } catch (error) {
      setErrorTags(error.message);
      return [];
    } finally {
      setLoadingTags(false);
    }
  };
  
  // Manejador para cambios en la selección de etiquetas
  const handleTagChange = (selectedOptions) => {
    setSelectedTags(selectedOptions || []);
    setFormData(prev => ({
      ...prev,
      etiquetas: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));

    // Limpiar error de etiquetas si se selecciona al menos una
    if (selectedOptions?.length > 0 && errors.etiquetas) {
      setErrors(prev => ({ ...prev, etiquetas: '' }));
    }
  };
  
  // Manejador para la carga de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFormData({
        ...formData,
        imagen: file,
        imagenPreview: URL.createObjectURL(file)
      });
      
      if (errors.imagen) {
        setErrors({ ...errors, imagen: '' });
      }
    }
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
        
        // Sincronizar etiquetas seleccionadas
        const syncedTags = await etiquetasService.syncMultipleTags(formData.etiquetas);
        
        // Preparar datos para enviar al backend
        const modDataToSubmit = {
          ...formData,
          edad_recomendada: parseInt(formData.edad_recomendada, 10),
          creador_id: user.id,
          version: formData.version_actual,
          etiquetas: syncedTags.map(tag => tag.id) // Usar IDs locales de las etiquetas sincronizadas
        };
        
        const response = await modService.createMod(modDataToSubmit);
        
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
  
  // Renderizar el componente
  return (
    <div className="create-mod-container">
      {submitSuccess ? (
        renderSuccessMessage()
      ) : (
        <>
          {submitError && renderErrorMessage()}
          
          <div className="create-mod-header">
            <h1>Crear nuevo mod</h1>
            <p className="create-mod-subtitle">Completa el formulario para compartir tu mod con la comunidad</p>
          </div>
          
          <form onSubmit={handleSubmit} className="create-mod-form">
            <div className="form-sections-container">
              {/* Sección de información básica */}
              <div className="form-section">
                <h2>Información Básica</h2>
                
                <div className="form-group">
                  <label htmlFor="titulo">Título del mod *</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    className={errors.titulo ? 'error' : ''}
                    disabled={submitting}
                  />
                  {errors.titulo && <span className="error-message">{errors.titulo}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción *</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows="5"
                    className={errors.descripcion ? 'error' : ''}
                    disabled={submitting}
                  ></textarea>
                  {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="edad_recomendada">Edad recomendada</label>
                  <select
                    id="edad_recomendada"
                    name="edad_recomendada"
                    value={formData.edad_recomendada}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value={3}>3+</option>
                    <option value={7}>7+</option>
                    <option value={12}>12+</option>
                    <option value={16}>16+</option>
                    <option value={18}>18+</option>
                  </select>
                </div>
              </div>
              
              {/* Sección de Detalles del Juego */}
              <div className="form-section">
                <h2>Detalles del Juego</h2>
                
                <div className="form-group">
                  <label htmlFor="juego_id">Juego *</label>
                  <AsyncSelect
                    id="juego_id"
                    name="juego_id"
                    className={`select-container ${errors.juego_id || errorJuegos ? 'error' : ''}`}
                    classNamePrefix="select"
                    loadOptions={loadGameOptions}
                    defaultOptions={initialOptions}
                    onChange={handleGameChange}
                    isDisabled={submitting || loadingJuegos}
                    placeholder="Buscar juego..."
                    noOptionsMessage={() => "No se encontraron juegos"}
                    loadingMessage={() => "Cargando juegos..."}
                    cacheOptions
                    components={{
                      Option: CustomOption,
                      SingleValue: CustomSingleValue
                    }}
                  />
                  {errors.juego_id && <span className="error-message">{errors.juego_id}</span>}
                  {errorJuegos && <span className="error-message">{errorJuegos}</span>}
                  {loadingJuegos && <span className="loading-message">Sincronizando juego...</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="version_juego_necesaria">Versión del juego requerida *</label>
                  <input
                    type="text"
                    id="version_juego_necesaria"
                    name="version_juego_necesaria"
                    value={formData.version_juego_necesaria}
                    onChange={handleChange}
                    placeholder="Ej: 1.4.2"
                    className={errors.version_juego_necesaria ? 'error' : ''}
                    disabled={submitting}
                  />
                  {errors.version_juego_necesaria && <span className="error-message">{errors.version_juego_necesaria}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="version_actual">Versión del mod *</label>
                  <input
                    type="text"
                    id="version_actual"
                    name="version_actual"
                    value={formData.version_actual}
                    onChange={handleChange}
                    placeholder="Ej: 1.0.0"
                    className={errors.version_actual ? 'error' : ''}
                    disabled={submitting}
                  />
                  {errors.version_actual && <span className="error-message">{errors.version_actual}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="url">URL de descarga</label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://ejemplo.com/tu-mod"
                    disabled={submitting}
                  />
                </div>
              </div>
              
              {/* Sección de Imagen y Etiquetas */}
              <div className="form-section">
                <h2>Imagen y Etiquetas</h2>
                
                <div className="form-group image-upload-group">
                  <label>Imagen del mod *</label>
                  <div className="image-upload-container">
                    <div 
                      className={`image-upload-area ${errors.imagen ? 'error' : ''}`}
                      onClick={() => !submitting && document.getElementById('imagen').click()}
                    >
                      {formData.imagenPreview ? (
                        <img src={formData.imagenPreview} alt="Vista previa" className="image-preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="upload-icon">📁</i>
                          <span>Haz clic para subir una imagen</span>
                        </div>
                      )}
                      <input
                        type="file"
                        id="imagen"
                        name="imagen"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden-input"
                        disabled={submitting}
                      />
                    </div>
                    {errors.imagen && <span className="error-message">{errors.imagen}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Etiquetas *</label>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    value={selectedTags}
                    onChange={handleTagChange}
                    loadOptions={loadTagOptions}
                    className={`tag-select-container ${errors.etiquetas ? 'error' : ''}`}
                    classNamePrefix="tag-select"
                    placeholder="Buscar etiquetas..."
                    loadingMessage={() => "Cargando etiquetas..."}
                    noOptionsMessage={() => "No se encontraron etiquetas"}
                    isDisabled={submitting}
                    components={{
                      Option: CustomTagOption,
                      MultiValue: CustomTagValue
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: '#1E293B',
                        borderColor: errors.etiquetas ? '#EF4444' : '#334155',
                        '&:hover': {
                          borderColor: '#475569'
                        }
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: '#1E293B',
                        border: '1px solid #334155'
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? '#334155' : '#1E293B',
                        color: '#FFFFFF',
                        '&:active': {
                          backgroundColor: '#3B82F6'
                        }
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: '#334155'
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: '#FFFFFF'
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        color: '#FFFFFF',
                        '&:hover': {
                          backgroundColor: '#EF4444',
                          color: '#FFFFFF'
                        }
                      }),
                      input: (base) => ({
                        ...base,
                        color: '#FFFFFF'
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: '#FFFFFF'
                      })
                    }}
                  />
                  {errors.etiquetas && <span className="error-message">{errors.etiquetas}</span>}
                  {errorTags && <span className="error-message">{errorTags}</span>}
                  <small className="form-help-text">Selecciona las etiquetas que mejor describan tu mod</small>
                </div>
              </div>
              
              {/* Sección de Publicación */}
              <div className="form-section">
                <h2>Publicación</h2>
                
                <div className="form-group">
                  <label>Estado del mod</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="estado"
                        value="borrador"
                        checked={formData.estado === 'borrador'}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                      <span className="radio-label">Borrador</span>
                      <small>Solo tú podrás ver este mod</small>
                    </label>
                    
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="estado"
                        value="publicado"
                        checked={formData.estado === 'publicado'}
                        onChange={handleChange}
                        disabled={submitting}
                      />
                      <span className="radio-label">Publicado</span>
                      <small>Visible para toda la comunidad</small>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/dashboard/mis-mods')}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={`btn-primary ${submitting ? 'submitting' : ''}`}
                disabled={submitting}
              >
                {submitting ? 'Creando...' : 'Crear Mod'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CrearMod;
