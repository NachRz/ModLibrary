import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import modService from '../../services/api/modService';
import useSavedStatus from '../../hooks/useSavedStatus';
import useRating from '../../hooks/useRating';
import Breadcrumb from '../common/Breadcrumb/Breadcrumb';
import ModDeleteConfirmationModal from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import { useNotification } from '../../context/NotificationContext';
import '../../assets/styles/components/mods/ModDetails.css';
import authService from '../../services/api/authService';

const ModDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [ultimaVersion, setUltimaVersion] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [showSaveMsg, setShowSaveMsg] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  
  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Estados para el carrusel de imágenes
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Array dinámico de imágenes que incluye la imagen principal del mod
  const imagenesCarrusel = useMemo(() => {
    const imagenesPorDefecto = [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80',
      'https://images.unsplash.com/photo-1585504198199-20277593b94f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2079&q=80',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
    ];

    // Si el mod tiene imagen principal, la incluimos al principio
    if (mod?.imagen_principal) {
      return [mod.imagen_principal, ...imagenesPorDefecto];
    }
    
    return imagenesPorDefecto;
  }, [mod?.imagen_principal]);
  
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
    // Verificar si el usuario está autenticado y obtener su información
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
    setCurrentUser(user);
  }, []);

  // Verificar si el usuario actual es el propietario del mod
  useEffect(() => {
    if (currentUser && mod) {
      setIsOwner(currentUser.id === mod.creador?.id);
    }
  }, [currentUser, mod]);

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

  // Manejar eliminación del mod
  const handleDeleteMod = () => {
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDeleteMod = async () => {
    try {
      setDeleting(true);
      const response = await modService.deleteMod(mod.id);
      
      if (response.status === 'success') {
        showNotification(`Mod "${mod.titulo}" eliminado exitosamente`, 'success');
        navigate('/dashboard/mis-mods');
      } else {
        throw new Error(response.message || 'Error al eliminar el mod');
      }
    } catch (err) {
      showNotification(err.message || 'Error al eliminar el mod', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Cancelar eliminación
  const cancelDeleteMod = () => {
    setShowDeleteModal(false);
  };

  // Editar mod
  const handleEditMod = () => {
    navigate(`/mods/editar/${mod.id}`);
  };

  // Calcular las imágenes visibles (siempre 5)
  const getVisibleImages = () => {
    const visibleImages = [];
    for (let i = 0; i < 5; i++) {
      const index = currentImageIndex + i;
      if (index < imagenesCarrusel.length) {
        visibleImages.push({
          src: imagenesCarrusel[index],
          originalIndex: index
        });
      }
    }
    return visibleImages;
  };

  // Verificar si se puede navegar
  const canGoPrev = currentImageIndex > 0;
  const canGoNext = currentImageIndex < imagenesCarrusel.length - 5;

  // Funciones de navegación no infinitas
  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

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
      {/* Sección de navegación */}
      <div className="mod-navigation">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Banner Hero Section */}
      <div className="mod-header-banner">
        <div className="mod-header-content">
          <div className="mod-header-main">
            <h1 className="mod-title-main">{mod.titulo}</h1>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mod-main-content">
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
            {/* Botones que solo aparecen si NO es el propietario */}
            {!isOwner && (
              <>
                <button className="mod-action-btn track" title="Seguir">
                  <i className="fas fa-bell"></i>
                  <span>Seguir</span>
                </button>
                
                <button 
                  className={`mod-action-btn endorse ${isGuardado ? 'active' : ''}`}
                  onClick={handleGuardarClick}
                  disabled={isSaving || !isAuthenticated}
                  title={isGuardado ? 'Guardado' : 'Guardar'}
                >
                  <i className={isGuardado ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                  <span>{isGuardado ? 'Guardado' : 'Guardar'}</span>
                </button>
                
                <button className="mod-action-btn vote" title="Votar">
                  <i className="fas fa-thumbs-up"></i>
                  <span>Votar</span>
                </button>
              </>
            )}
            
            {/* Botones para el propietario del mod */}
            {isOwner && (
              <>
                <button 
                  className="mod-action-btn edit"
                  onClick={handleEditMod}
                  title="Editar mod"
                >
                  <i className="fas fa-edit"></i>
                  <span>Editar</span>
                </button>
                
                <button 
                  className="mod-action-btn delete"
                  onClick={handleDeleteMod}
                  disabled={deleting}
                  title={deleting ? 'Eliminando...' : 'Eliminar mod'}
                >
                  <i className={`fas ${deleting ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i>
                  <span>{deleting ? 'Eliminando...' : 'Eliminar'}</span>
                </button>
              </>
            )}
            
            <button className="mod-action-btn download-main" title="Descargar">
              <i className="fas fa-download"></i>
              <span>Descargar</span>
            </button>
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

        {/* Galería y detalles del mod - Solo mostrar si hay 5 o más imágenes */}
        {imagenesCarrusel.length >= 5 && (
          <div className="mod-gallery-section">
            <div className="mod-gallery-carousel">
              <div className="carousel-container">
                {/* Botón anterior */}
                <button 
                  className="carousel-nav-btn prev" 
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Galería horizontal */}
                <div className="gallery-horizontal">
                  <div className="gallery-images-container">
                    {getVisibleImages().map((image, index) => (
                      <div 
                        key={index}
                        className={`gallery-image-item`}
                      >
                        <img src={image.src} alt={`Imagen ${index + 1}`} />
                        {/* Solo mostrar el contador en la imagen del centro (índice 2) */}
                        {index === 2 && (
                          <div className="image-counter-overlay">
                            {imagenesCarrusel.length} imágenes
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón siguiente */}
                <button 
                  className="carousel-nav-btn next" 
                  onClick={handleNext}
                  disabled={!canGoNext}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
        
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

      {/* Modal de eliminación */}
      <ModDeleteConfirmationModal
        modTitle={mod?.titulo || ''}
        onConfirm={confirmDeleteMod}
        onCancel={cancelDeleteMod}
        isOpen={showDeleteModal}
      />
    </div>
  );
};

export default ModDetails; 