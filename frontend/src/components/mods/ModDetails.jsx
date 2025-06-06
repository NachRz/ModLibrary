import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import modService from '../../services/api/modService';
import comentarioService from '../../services/api/comentarioService';
import useUserModsStatus from '../../hooks/useUserModsStatus';
import useRating from '../../hooks/useRating';
import Breadcrumb from '../common/Breadcrumb/Breadcrumb';
import ImageCarousel from '../common/ImageCarousel/ImageCarousel';
import ModDeleteConfirmationModal from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import EditModAdmin from '../dashboard/adminPanels/modalsAdmin/ModAdminModal/EditModAdmin';
import ShareModal from '../common/ShareModal/ShareModal';
import ComentariosMod from './ComentariosMod';
import { useNotification } from '../../context/NotificationContext';
import '../../assets/styles/components/mods/ModDetails.css';

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
  const [creatorImageUrl, setCreatorImageUrl] = useState('');

  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);

  // Estados para información de descargas del usuario
  const [descargaUsuario, setDescargaUsuario] = useState(null);
  const [loadingDescarga, setLoadingDescarga] = useState(false);

  // Estado para el modal de compartir
  const [showShareModal, setShowShareModal] = useState(false);

  // Estado para comentarios
  const [comentariosStats, setComentariosStats] = useState({
    total_comentarios: 0,
    permite_comentarios: true
  });

  // Referencia al ImageCarousel para control externo
  const imageCarouselRef = useRef(null);

  // Hook unificado para usuario y mods guardados
  const {
    isAuthenticated,
    currentUserId,
    isOwner: checkIsOwner,
    isSaved,
    toggleSavedStatus,
    loading: userLoading
  } = useUserModsStatus();

  // Array dinámico de imágenes que incluye la imagen banner y las imágenes adicionales del mod
  const imagenesCarrusel = useMemo(() => {
    const imagenes = [];

    // Agregar la imagen del banner si existe
    if (mod?.imagen_banner) {
      const bannerUrl = `http://localhost:8000/storage/${mod.imagen_banner}`;
      imagenes.push(bannerUrl);
    }

    // Agregar las imágenes adicionales si existen
    if (mod?.imagenes_adicionales) {
      try {
        // Las imágenes adicionales pueden venir como string JSON o como array
        const imagenesAdicionales = typeof mod.imagenes_adicionales === 'string'
          ? JSON.parse(mod.imagenes_adicionales)
          : mod.imagenes_adicionales;

        if (Array.isArray(imagenesAdicionales)) {
          imagenesAdicionales.forEach(imagen => {
            const imageUrl = `http://localhost:8000/storage/${imagen}`;
            imagenes.push(imageUrl);
          });
        }
      } catch (error) {
        console.error('Error al procesar imágenes adicionales:', error);
      }
    }

    return imagenes;
  }, [mod?.imagen_banner, mod?.imagenes_adicionales]);

  // Verificar si el mod está guardado y si es propietario
  const isGuardado = isSaved(id);
  const isOwner = checkIsOwner(mod);

  // Construir URL de la imagen del banner con cache-busting
  const bannerImageUrl = useMemo(() => {
    if (mod?.imagen_banner) {
      const timestamp = Date.now();
      return `http://localhost:8000/storage/${mod.imagen_banner}?t=${timestamp}`;
    }
    return null;
  }, [mod?.imagen_banner]);

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

  // Actualizar URL de imagen del creador con cache-busting
  useEffect(() => {
    if (mod?.creador?.foto_perfil) {
      const timestamp = Date.now();
      setCreatorImageUrl(`http://localhost:8000/storage/${mod.creador.foto_perfil}?t=${timestamp}`);
    } else {
      setCreatorImageUrl('');
    }
  }, [mod?.creador?.foto_perfil]);

  // Obtener información de descargas del usuario
  useEffect(() => {
    const fetchDescargaUsuario = async () => {
      if (isAuthenticated && mod?.id && !userLoading) {
        try {
          setLoadingDescarga(true);
          const response = await modService.getDescargaUsuario(mod.id);
          if (response.status === 'success') {
            setDescargaUsuario(response.data);
          }
        } catch (error) {
          console.error('Error al obtener información de descargas:', error);
          setDescargaUsuario(null);
        } finally {
          setLoadingDescarga(false);
        }
      } else {
        setDescargaUsuario(null);
      }
    };

    fetchDescargaUsuario();
  }, [isAuthenticated, mod?.id, userLoading]);

  // Cargar estadísticas de comentarios
  useEffect(() => {
    const fetchComentariosStats = async () => {
      if (mod?.id) {
        try {
          const response = await comentarioService.getEstadisticas(mod.id);
          if (response.status === 'success') {
            setComentariosStats(response.data);
          }
        } catch (error) {
          console.error('Error al obtener estadísticas de comentarios:', error);
        }
      }
    };

    fetchComentariosStats();
  }, [mod?.id]);

  // Función para manejar el clic en el botón de guardar
  const handleGuardarClick = async () => {
    setSaveError(null);
    let action;
    try {
      if (isGuardado) {
        action = 'eliminado';
        await toggleSavedStatus(id);
      } else {
        action = 'guardado';
        await toggleSavedStatus(id);
      }

      // Refrescar las estadísticas del mod después de cambiar el estado de guardado
      await refreshModStats();

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
    { label: mod?.juego?.titulo || 'Juego', path: mod?.juego?.id ? `/juegos/${mod.juego.id}` : '/juegos' },
    { label: mod?.titulo || 'Mod', path: `/mods/${id}` }
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
    setShowEditModal(true);
  };

  // Manejar el cierre del modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Manejar el guardado desde el modal de edición
  const handleSaveModFromModal = (updatedMod) => {
    console.log('Mod actualizado desde modal:', updatedMod);

    // Actualizar el mod con los nuevos datos, preservando campos importantes
    setMod(prevMod => {
      const newMod = {
        ...prevMod,
        ...updatedMod,
        // Mantener campos que no se editan en el modal pero son necesarios para la visualización
        creador: prevMod.creador,
        juego: updatedMod.juego || prevMod.juego, // Usar el juego actualizado si existe
        estadisticas: prevMod.estadisticas,
        total_descargas: prevMod.total_descargas,
        fecha_creacion: prevMod.fecha_creacion,
        fecha_actualizacion: new Date().toISOString(), // Actualizar la fecha de modificación

        // Manejar campos específicos que pueden venir con nombres diferentes
        titulo: updatedMod.titulo || updatedMod.nombre || prevMod.titulo,
        nombre: updatedMod.titulo || updatedMod.nombre || prevMod.nombre,
        imagen_banner: updatedMod.imagen_banner || prevMod.imagen_banner,
        imagenes_adicionales: updatedMod.imagenes_adicionales || prevMod.imagenes_adicionales,
        etiquetas: updatedMod.etiquetas || prevMod.etiquetas,
        version: updatedMod.version || updatedMod.version_actual || prevMod.version || prevMod.version_actual
      };

      console.log('Mod actualizado en estado local:', newMod);
      return newMod;
    });

    // Cerrar el modal
    setShowEditModal(false);

    // Mostrar notificación de éxito
    showNotification(`Mod "${updatedMod.titulo || updatedMod.nombre}" actualizado exitosamente`, 'success');

    // Refrescar los datos del mod desde el servidor para asegurar sincronización
    setTimeout(() => {
      refreshModDetails();
    }, 1500);
  };

  // Función para refrescar los detalles del mod desde el servidor
  const refreshModDetails = async () => {
    try {
      const response = await modService.getModById(id);
      if (response.status === 'success') {
        setMod(response.data);

        // Actualizar URL de la imagen del creador con cache-busting si es necesario
        if (response.data?.creador?.foto_perfil) {
          const timestamp = Date.now();
          setCreatorImageUrl(`http://localhost:8000/storage/${response.data.creador.foto_perfil}?t=${timestamp}`);
        }

        console.log('Detalles del mod refrescados desde el servidor');
      }
    } catch (err) {
      console.error('Error al refrescar los detalles del mod:', err);
      // No mostrar error al usuario ya que es una actualización en segundo plano
    }
  };

  // Función para cambiar tab
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // Función para manejar la descarga del mod
  const handleDownload = async () => {
    if (mod.url) {
      try {
        console.log('Iniciando descarga para mod:', mod.id);

        // Incrementar contador de descargas
        const response = await modService.incrementDownload(mod.id);
        console.log('Respuesta del incremento de descarga:', response);

        // Actualizar el contador de descargas localmente
        setMod(prevMod => ({
          ...prevMod,
          total_descargas: (prevMod.total_descargas || 0) + 1,
          estadisticas: {
            ...prevMod.estadisticas,
            total_descargas: (prevMod.estadisticas?.total_descargas || 0) + 1
          }
        }));

        // Si el usuario está autenticado, actualizar información de descarga
        if (isAuthenticated) {
          try {
            console.log('Usuario autenticado, obteniendo información de descarga...');
            const descargaResponse = await modService.getDescargaUsuario(mod.id);
            console.log('Respuesta de descarga usuario:', descargaResponse);

            if (descargaResponse.status === 'success') {
              setDescargaUsuario(descargaResponse.data);
            }
          } catch (descargaError) {
            console.error('Error al obtener info de descarga:', descargaError);
          }
        }

        // Abrir enlace en nueva pestaña
        window.open(mod.url, '_blank', 'noopener,noreferrer');

        // Mostrar notificación de éxito
        showNotification('Descarga registrada exitosamente', 'success');
      } catch (error) {
        console.error('Error al registrar la descarga:', error);
        // Aún permitir la descarga aunque falle el registro
        window.open(mod.url, '_blank', 'noopener,noreferrer');
        showNotification('Descarga iniciada (no se pudo registrar)', 'warning');
      }
    } else {
      showNotification('El enlace de descarga no está disponible', 'error');
    }
  };

  // Función para manejar el modal de compartir
  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  // Función para actualizar estadísticas de comentarios
  const actualizarComentariosStats = useCallback((nuevoTotal) => {
    setComentariosStats(prev => ({
      ...prev,
      total_comentarios: nuevoTotal
    }));
  }, []);

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
      {/* Banner Hero Section */}
      <div
        className="mod-header-banner"
        style={{
          backgroundImage: bannerImageUrl ? `url(${bannerImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="mod-header-content">

          {/* Breadcrumb dentro del banner */}
          <div className="mod-navigation-banner">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Título y estadísticas juntos en la parte inferior */}
          <div className="mod-stats-actions overlay">

            <div className="mod-stats-and-actions">
              <div className="mod-stats-section">
                <h1
                  className="mod-title-main"
                  data-mod-name={mod.titulo}
                  data-game-name={mod.juego?.titulo}
                  data-game-id={mod.juego?.id}
                >
                  {mod.titulo}
                </h1>
                <div className="mod-stats-group">
                  <div className="mod-stat-box">
                    <div className="stat-icon"><i className="fas fa-star"></i></div>
                    <div className="stat-content">
                      <div className="stat-label">Valoración</div>
                      <div className="stat-value">
                        {mod.estadisticas?.valoracion_media ?
                          `${mod.estadisticas.valoracion_media}/5` :
                          'Sin valorar'
                        }
                        ({mod.estadisticas?.total_valoraciones || 0})
                      </div>
                    </div>
                  </div>

                  <div className="mod-stat-box">
                    <div className="stat-icon"><i className="fas fa-download"></i></div>
                    <div className="stat-content">
                      <div className="stat-label">Descargas</div>
                      <div className="stat-value">{mod.total_descargas || 0}</div>
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
              </div>

              <div className="mod-actions-group">
                {/* Botones que solo aparecen si NO es el propietario */}
                {!isOwner && (
                  <>
                    <button
                      className={`mod-action-btn endorse ${isGuardado ? 'active' : ''}`}
                      onClick={handleGuardarClick}
                      disabled={userLoading || !isAuthenticated}
                      title={isGuardado ? 'Guardado' : 'Guardar'}
                    >
                      <i className={isGuardado ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                      <span>{isGuardado ? 'Guardado' : 'Guardar'}</span>
                    </button>

                    {/* Sistema de valoración con estrellas */}
                    {isAuthenticated && (
                      <div className="mod-rating-container">
                        <div className="rating-stars" title="Valorar mod">
                          {renderStars()}
                        </div>
                        {hasRated && (
                          <button
                            className="delete-rating-btn"
                            onClick={handleDeleteRating}
                            disabled={ratingLoading}
                            title="Eliminar valoración"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        )}
                      </div>
                    )}
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

                <button
                  className="mod-action-btn download-main"
                  title="Descargar"
                  onClick={handleDownload}
                  disabled={!mod.url}
                >
                  <i className="fas fa-download"></i>
                  <span>Descargar</span>
                </button>
              </div>
            </div>
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

        {/* Información del mod */}
        <div className="mod-info-section">
          <div className="mod-info-left">
            {/* Creador - Ahora va primero */}
            <div className="mod-creator-box">
              <div className="creator-header">Creado por</div>
              <div
                className="creator-content clickable"
                onClick={() => {
                  // Si es tu propio perfil, ir a /perfil, sino a /usuarios/{id}/perfil
                  if (currentUserId && mod.creador?.id === currentUserId) {
                    navigate('/perfil');
                  } else {
                    navigate(`/usuarios/${mod.creador?.id}/perfil`);
                  }
                }}
                style={{ cursor: 'pointer' }}
                title={`Ver perfil de ${mod.creador?.nome || 'Usuario'}`}
              >
                {mod.creador?.foto_perfil && creatorImageUrl ? (
                  <img
                    src={creatorImageUrl}
                    alt={mod.creador?.nome || 'Creador'}
                  />
                ) : (
                  <div className="creator-avatar-fallback">
                    <span>
                      {(mod.creador?.nome || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="creator-name">{mod.creador?.nome || 'Anónimo'}</span>
              </div>
            </div>

            {/* Campo "De juego" - Nuevo campo añadido */}
            <div className="mod-game-box">
              <div className="game-header">De juego</div>
              <div className="game-content">
                {mod.juego?.imagen_fondo ? (
                  <img
                    src={mod.juego?.imagen_fondo}
                    alt={mod.juego?.titulo || 'Juego'}
                    className="game-image"
                  />
                ) : (
                  <div className="game-image-fallback">
                    <i className="fas fa-gamepad"></i>
                  </div>
                )}
                <span className="game-name">{mod.juego?.titulo || 'Juego desconocido'}</span>
              </div>
            </div>

            <div className="mod-dates">
              <div className="mod-date-box">
                <div className="date-label">Última actualización</div>
                <div className="date-value">
                  {mod.fecha_actualizacion ?
                    new Date(mod.fecha_actualizacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) :
                    'No disponible'
                  }
                </div>
              </div>

              <div className="mod-date-box">
                <div className="date-label">Subido originalmente</div>
                <div className="date-value">
                  {mod.fecha_creacion ?
                    new Date(mod.fecha_creacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) :
                    'No disponible'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Galería y detalles del mod - Mostrar si hay al menos 1 imagen */}
        {imagenesCarrusel.length >= 1 && (
          <div className="mod-gallery-section">
            <ImageCarousel
              images={imagenesCarrusel}
              className="mod-image-carousel"
              ref={imageCarouselRef}
            />
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
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="mod-content-tabs">
          <button
            className={`tab-btn ${activeTab === 'descripcion' ? 'active' : ''}`}
            onClick={() => handleTabChange('descripcion')}
          >
            Descripción
          </button>
          <button
            className={`tab-btn ${activeTab === 'imagenes' ? 'active' : ''}`}
            onClick={() => handleTabChange('imagenes')}
          >
            Imágenes <span className="tab-count">{imagenesCarrusel.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'comentarios' ? 'active' : ''}`}
            onClick={() => handleTabChange('comentarios')}
          >
            Comentarios <span className="tab-count">{comentariosStats.total_comentarios}</span>
          </button>
          {/* Tab Detalles - Solo visible para el propietario */}
          {isOwner && (
            <button
              className={`tab-btn ${activeTab === 'detalles' ? 'active' : ''}`}
              onClick={() => handleTabChange('detalles')}
            >
              <i className="fas fa-chart-line"></i> Detalles
            </button>
          )}
        </div>

        {/* Contenido de la pestaña activa */}
        {activeTab === 'descripcion' && (
          <div className="mod-tab-content active">
            <div className="mod-description">
              <h2>Sobre este mod</h2>

              {isAuthenticated && descargaUsuario && descargaUsuario.ha_descargado && (
                <div className="user-download-info">
                  <i className="fas fa-download"></i>
                  Última descarga: {new Date(descargaUsuario.ultima_descarga).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {descargaUsuario.total_descargas_usuario > 1 && (
                    <span className="download-count">
                      ({descargaUsuario.total_descargas_usuario} {descargaUsuario.total_descargas_usuario === 1 ? 'descarga' : 'descargas'})
                    </span>
                  )}
                </div>
              )}

              {isAuthenticated && loadingDescarga && (
                <div className="user-download-info loading">
                  <i className="fas fa-spinner fa-spin"></i> Cargando información de descarga...
                </div>
              )}

              {isAuthenticated && descargaUsuario && !descargaUsuario.ha_descargado && !loadingDescarga && (
                <div className="user-download-info no-download">
                  <i className="fas fa-info-circle"></i> Aún no has descargado este mod
                </div>
              )}

              <div className="description-content">
                <p>{mod.descripcion}</p>
              </div>

              <div className="mod-action-buttons">
                <button className="report-btn">
                  <i className="fas fa-flag"></i> Reportar
                </button>

                <button className="share-btn" onClick={handleShareClick}>
                  <i className="fas fa-share-alt"></i> Compartir
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'imagenes' && (
          <div className="mod-tab-content active">
            <div className="mod-images-gallery">
              <h2>Galería de imágenes ({imagenesCarrusel.length})</h2>

              {imagenesCarrusel.length > 0 ? (
                <div className="tab-image-grid-container">
                  <div className="images-grid">
                    {imagenesCarrusel.map((imagen, index) => (
                      <div
                        key={index}
                        className="grid-image-item"
                        onClick={() => {
                          if (imageCarouselRef.current) {
                            imageCarouselRef.current.openLightbox(index);
                          }
                        }}
                      >
                        <img
                          src={imagen}
                          alt={`Imagen ${index + 1} de ${mod.titulo}`}
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <i className="fas fa-search-plus"></i>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="gallery-description">
                    <p>
                      Todas las imágenes de <strong>{mod.titulo}</strong>.
                    </p>
                    <div className="gallery-stats">
                      <span className="stat-item">
                        <i className="fas fa-images"></i>
                        {imagenesCarrusel.length} {imagenesCarrusel.length === 1 ? 'imagen' : 'imágenes'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-images-placeholder">
                  <i className="fas fa-images"></i>
                  <h3>Sin imágenes disponibles</h3>
                  <p>Este mod no tiene imágenes adicionales para mostrar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'comentarios' && (
          <div className="mod-tab-content active">
            <ComentariosMod
              modId={id}
              isAuthenticated={isAuthenticated}
              permitirComentarios={comentariosStats.permite_comentarios}
              onStatsUpdate={actualizarComentariosStats}
            />
          </div>
        )}

        {/* Tab Detalles - Solo para el propietario */}
        {activeTab === 'detalles' && isOwner && (
          <div className="mod-tab-content active">
            <div className="mod-details-owner">
              <h2>
                <i className="fas fa-chart-line"></i>
                Estadísticas y Rendimiento
              </h2>

              {/* Estadísticas principales */}
              <div className="stats-grid">
                <div className="stat-card downloads">
                  <div className="stat-icon">
                    <i className="fas fa-download"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {mod.estadisticas?.total_descargas || mod.total_descargas || 0}
                    </div>
                    <div className="stat-label">Total Descargas</div>
                  </div>
                </div>

                <div className="stat-card rating">
                  <div className="stat-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {mod.estadisticas?.valoracion_media ?
                        Number(mod.estadisticas.valoracion_media).toFixed(1) :
                        '0.0'
                      }
                    </div>
                    <div className="stat-label">Valoración Media</div>
                  </div>
                </div>

                <div className="stat-card reviews">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {mod.estadisticas?.total_valoraciones || 0}
                    </div>
                    <div className="stat-label">Total Valoraciones</div>
                  </div>
                </div>

                <div className="stat-card comments">
                  <div className="stat-icon">
                    <i className="fas fa-comments"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{comentariosStats.total_comentarios}</div>
                    <div className="stat-label">Comentarios</div>
                  </div>
                </div>

                <div className="stat-card views">
                  <div className="stat-icon">
                    <i className="fas fa-eye"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">N/A</div>
                    <div className="stat-label">Visitas</div>
                  </div>
                </div>

                <div className="stat-card favorites">
                  <div className="stat-icon">
                    <i className="fas fa-heart"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {mod.estadisticas?.total_favoritos || 0}
                    </div>
                    <div className="stat-label">Favoritos</div>
                  </div>
                </div>
              </div>

              {/* Información detallada del mod */}
              <div className="mod-info-detailed">
                {/* Enlaces y archivos */}
                <div className="info-section">
                  <h3>
                    <i className="fas fa-link"></i>
                    Enlaces y Archivos
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">URL de descarga:</span>
                      <span className="info-value">
                        {mod.url ? (
                          <a href={mod.url} target="_blank" rel="noopener noreferrer" className="download-link">
                            <i className="fas fa-external-link-alt"></i> Ver enlace
                          </a>
                        ) : (
                          'No configurado'
                        )}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Imagen banner:</span>
                      <span className="info-value">
                        {mod.imagen_banner ? (
                          <span className="file-status available">
                            <i className="fas fa-check-circle"></i> Configurado
                          </span>
                        ) : (
                          <span className="file-status missing">
                            <i className="fas fa-times-circle"></i> No configurado
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Imágenes adicionales:</span>
                      <span className="info-value">
                        {imagenesCarrusel.length > 1 ? (
                          <span className="file-status available">
                            <i className="fas fa-check-circle"></i> {imagenesCarrusel.length - 1} imágenes
                          </span>
                        ) : (
                          <span className="file-status missing">
                            <i className="fas fa-times-circle"></i> No configuradas
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Modal de compartir */}
      <ShareModal
        isOpen={showShareModal}
        onClose={handleCloseShareModal}
        modTitle={mod?.titulo || ''}
        modUrl={`/mods/${id}`}
        modDescription={mod?.descripcion || ''}
      />

      {/* Modal de edición */}
      <EditModAdmin
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        mod={mod}
        onSave={handleSaveModFromModal}
      />
    </div>
  );
};

export default ModDetails; 