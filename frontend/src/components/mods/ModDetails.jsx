import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import modService from '../../services/api/modService';
import useSavedStatus from '../../hooks/useSavedStatus';
import useRating from '../../hooks/useRating';
import Breadcrumb from '../common/Breadcrumb/Breadcrumb';
import '../../assets/styles/components/mods/ModDetails.css';
import authService from '../../services/api/authService';

const ModDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [ultimaVersion, setUltimaVersion] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [showSaveMsg, setShowSaveMsg] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Usar el hook personalizado para manejar el estado de guardado
  const [isGuardado, toggleSavedStatus, isSaving, savedError] = useSavedStatus(id);

  // Usar el hook personalizado para manejar las valoraciones
  const [
    userRating, 
    hasRated, 
    rateMod, 
    deleteRating, 
    ratingLoading, 
    ratingError, 
    ratingMessage
  ] = useRating(id);

  // Nuevo estado para saber la última acción
  const [lastSaveAction, setLastSaveAction] = useState(null); // 'guardado' | 'eliminado' | null

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
  }, []);

  useEffect(() => {
    const fetchModDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await modService.getModById(id);
        if (response.status === 'success') {
          setMod(response.data);
          
          // Obtener la última versión del mod si tiene versiones
          if (response.data.versiones && response.data.versiones.length > 0) {
            const versionesOrdenadas = [...response.data.versiones].sort((a, b) => 
              new Date(b.fecha) - new Date(a.fecha)
            );
            setUltimaVersion(versionesOrdenadas[0]);
          }
        } else {
          throw new Error(response.message || 'Error al cargar los detalles del mod');
        }
      } catch (err) {
        setError(err.message || 'Error al cargar los detalles del mod');
      } finally {
        setLoading(false);
      }
    };

    fetchModDetails();
  }, [id]);

  // Función para manejar el clic en el botón de guardar
  const handleGuardarClick = async () => {
    setSaveError(null);
    let action;
    try {
      if (isGuardado) {
        action = 'eliminado';
        await toggleSavedStatus();
      } else {
        action = 'guardado';
        await toggleSavedStatus();
      }
      setLastSaveAction(action);
      setShowSaveMsg(true);
      setTimeout(() => {
        setShowSaveMsg(false);
        setLastSaveAction(null);
      }, 3000);
    } catch (error) {
      setSaveError(error?.message || 'Error al guardar/eliminar el mod');
      setShowSaveMsg(false);
      setLastSaveAction(null);
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  // Manejador para valorar un mod
  const handleRatingClick = async (rating) => {
    const success = await rateMod(rating);
    if (success) {
      refreshModStats();
    }
  };
  
  // Manejador para eliminar una valoración
  const handleDeleteRating = async () => {
    const success = await deleteRating();
    if (success) {
      refreshModStats();
    }
  };
  
  // Actualizar las estadísticas del mod después de valorar
  const refreshModStats = async () => {
    try {
      const response = await modService.getModById(id);
      if (response.status === 'success') {
        // Actualizar solo las estadísticas sin recargar todo el mod
        setMod(prevMod => ({
          ...prevMod,
          estadisticas: response.data.estadisticas
        }));
      }
    } catch (err) {
      console.error('Error al actualizar las estadísticas del mod:', err);
    }
  };

  const renderStars = () => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <i 
          key={i}
          className={`${i <= (hoverRating || userRating) ? 'fas' : 'far'} fa-star`} 
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        />
      );
    }
    
    return stars;
  };

  // Función para renderizar estrellas estáticas basadas en una valoración
  const renderStaticStars = (rating) => {
    const stars = [];
    const maxStars = 5;
    
    for (let i = 1; i <= maxStars; i++) {
      stars.push(
        <i 
          key={i}
          className={`${i <= rating ? 'fas' : 'far'} fa-star`} 
        />
      );
    }
    
    return stars;
  };

  // Configuración del breadcrumb
  const breadcrumbItems = [
    { label: 'Mods', path: '/mods' },
    { label: mod?.titulo || 'Detalles del Mod', path: `/mods/${id}` }
  ];

  if (loading) {
    return (
      <div className="mod-details-container">
      <div className="mod-details-loading">
        <div className="loading-spinner"></div>
        <p>Cargando detalles del mod...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mod-details-container">
      <div className="mod-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="action-button">
          <i className="fas fa-arrow-left"></i>
          Volver atrás
        </button>
        </div>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="mod-details-container">
      <div className="mod-details-not-found">
        <h2>Mod no encontrado</h2>
        <button onClick={() => navigate(-1)} className="action-button">
          <i className="fas fa-arrow-left"></i>
          Volver atrás
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mod-details-container">
      {/* Breadcrumb */}
      <div className="mod-navigation">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Mensajes de estado */}
      {ratingMessage && (
        <div className="rating-message-banner">
          <i className="fas fa-check-circle"></i>
          <span>{ratingMessage}</span>
        </div>
      )}
      
      {ratingError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i>
          <span>{ratingError}</span>
        </div>
      )}
      
      {showSaveMsg && !saveError && lastSaveAction && (
        <div className="save-message-banner">
          <i className="fas fa-check-circle"></i>
          <span>{lastSaveAction === 'guardado' ? '¡Mod guardado!' : 'Mod eliminado de guardados'}</span>
        </div>
      )}

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i>
          <span>{saveError}</span>
        </div>
      )}
      
      {/* Header con título principal */}
      <div className="mod-header-main">
        <h1 className="mod-title-main">{mod.titulo}</h1>
      </div>
      
      {/* Estadísticas y botones de acción */}
      <div className="mod-stats-actions">
        <div className="mod-stats-group">
          <div className="mod-stat-box">
            <div className="stat-icon"><i className="fas fa-thumbs-up"></i></div>
            <div className="stat-content">
              <div className="stat-label">Valoraciones</div>
              <div className="stat-value">{mod.estadisticas?.total_valoraciones || 0}</div>
            </div>
              </div>
          
          <div className="mod-stat-box">
            <div className="stat-icon"><i className="fas fa-download"></i></div>
            <div className="stat-content">
              <div className="stat-label">Descargas</div>
              <div className="stat-value">{mod.estadisticas?.total_descargas || 0}</div>
                </div>
              </div>
          
          <div className="mod-stat-box">
            <div className="stat-icon"><i className="fas fa-eye"></i></div>
            <div className="stat-content">
              <div className="stat-label">Visitas</div>
              <div className="stat-value">Próximamente</div>
            </div>
          </div>
          
          <div className="mod-stat-box">
            <div className="stat-icon"><i className="fas fa-code-branch"></i></div>
            <div className="stat-content">
              <div className="stat-label">Versión</div>
              <div className="stat-value">v{ultimaVersion ? ultimaVersion.version : mod.version}</div>
        </div>
          </div>
        </div>

        <div className="mod-actions-group">
          <button className="mod-action-btn track">
            <i className="fas fa-bell"></i> Seguir
          </button>
          
          <button 
            className={`mod-action-btn endorse ${isGuardado ? 'active' : ''}`}
            onClick={handleGuardarClick}
            disabled={isSaving || !isAuthenticated}
          >
            <i className={isGuardado ? 'fas fa-bookmark' : 'far fa-bookmark'}></i> 
            {isGuardado ? 'Guardado' : 'Guardar'}
          </button>
          
          <button className="mod-action-btn vote">
            <i className="fas fa-thumbs-up"></i> Votar
          </button>
          
          <button className="mod-action-btn download-main">
            <i className="fas fa-download"></i> Descargar
          </button>
        </div>
                    </div>

      {/* Galería y detalles del mod */}
      <div className="mod-gallery-section">
        <div className="mod-gallery">
          <div className="gallery-placeholder">
            <i className="fas fa-images"></i>
            <p>Imágenes próximamente</p>
                  </div>
                  </div>
                </div>
      
      {/* Información del mod */}
      <div className="mod-info-section">
        <div className="mod-info-left">
          <div className="mod-dates">
            <div className="mod-date-box">
              <div className="date-label">Última actualización</div>
              <div className="date-value">
                {mod.fecha_actualizacion ? new Date(mod.fecha_actualizacion).toLocaleDateString() : 'No disponible'}
                </div>
            </div>
            
            <div className="mod-date-box">
              <div className="date-label">Subido originalmente</div>
              <div className="date-value">
                {mod.fecha_creacion ? new Date(mod.fecha_creacion).toLocaleDateString() : 'No disponible'}
              </div>
            </div>
          </div>
          
          <div className="mod-creator-box">
            <div className="creator-header">Creado por</div>
            <div className="creator-content">
              <img src={mod.creador?.foto_perfil || '/images/user-placeholder.jpg'} alt={mod.creador?.nome} />
              <span className="creator-name">{mod.creador?.nome || 'Anónimo'}</span>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Etiquetas del mod */}
      <div className="mod-tags-section">
        <h3>Etiquetas para este mod</h3>
        <div className="mod-tags-list">
          {mod.etiquetas?.length > 0 ? 
            mod.etiquetas.map(tag => (
              <span key={tag.id} className="mod-tag-item">
                {tag.nombre}
              </span>
            )) : 
            <span className="no-tags">Sin etiquetas</span>
          }
          <button className="add-tag-btn">+ Añadir etiqueta</button>
                </div>
              </div>
      
      {/* Pestañas de navegación */}
      <div className="mod-content-tabs">
        <button className="tab-btn active">
          Descripción
        </button>
        <button className="tab-btn">
          Archivos <span className="tab-count">1</span>
        </button>
        <button className="tab-btn">
          Imágenes <span className="tab-count">0</span>
        </button>
        <button className="tab-btn">
          Videos <span className="tab-count">0</span>
        </button>
        <button className="tab-btn">
          Artículos <span className="tab-count">0</span>
        </button>
        <button className="tab-btn">
          Comentarios <span className="tab-count">0</span>
        </button>
        <button className="tab-btn">
          Estadísticas
        </button>
      </div>
      
      {/* Contenido de la pestaña activa */}
      <div className="mod-tab-content active">
        <div className="mod-description">
          <h2>Sobre este mod</h2>
          
          {isAuthenticated && (
            <div className="user-download-info">
              <i className="fas fa-download"></i> Última descarga: {new Date().toLocaleDateString()}
            </div>
          )}
          
          <div className="description-content">
            <p>{mod.descripcion}</p>
          </div>
          
          <div className="mod-action-buttons">
            <button className="report-btn">
              <i className="fas fa-flag"></i> Reportar
            </button>
            
            <button className="share-btn">
              <i className="fas fa-share-alt"></i> Compartir
            </button>
          </div>
        </div>
      </div>
      
      {!isAuthenticated && (
        <div className="login-needed-card">
          <i className="fas fa-info-circle"></i>
          <span>Inicia sesión para valorar y descargar este mod</span>
        </div>
      )}
    </div>
  );
};

export default ModDetails; 