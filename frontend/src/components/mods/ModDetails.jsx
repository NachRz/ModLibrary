import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import modService from '../../services/api/modService';
import '../../assets/styles/components/mods/ModDetails.css';

const ModDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('descripcion');
  const [ultimaVersion, setUltimaVersion] = useState(null);
  const [isGuardado, setIsGuardado] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showRatingMsg, setShowRatingMsg] = useState(false);

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
            // Ordenar las versiones por fecha (de más reciente a más antigua)
            const versionesOrdenadas = [...response.data.versiones].sort((a, b) => 
              new Date(b.fecha) - new Date(a.fecha)
            );
            setUltimaVersion(versionesOrdenadas[0]);
          }

          // Comprobar si el mod está guardado (esto debe implementarse según la lógica de tu app)
          // Por ahora, simulamos que no está guardado inicialmente
          setIsGuardado(false);
          
          // Comprobar si el usuario ya ha valorado este mod (simulado)
          setHasRated(false);
          setUserRating(0);
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

  const handleGuardarClick = () => {
    // Aquí iría la lógica para guardar/desguardar el mod en tu backend
    // Por ahora, simplemente cambiamos el estado local
    setIsGuardado(!isGuardado);
    
    // Ejemplo de mensaje para visualizar el cambio (opcional)
    const mensaje = !isGuardado ? 'Mod guardado' : 'Mod eliminado de guardados';
    console.log(mensaje);
  };

  const handleRatingClick = (rating) => {
    // Actualizamos el estado local
    setUserRating(rating);
    setHasRated(true);
    
    // Mostrar mensaje de confirmación
    setShowRatingMsg(true);
    setTimeout(() => {
      setShowRatingMsg(false);
    }, 3000);
    
    // Aquí iría la lógica para enviar la valoración al backend
    console.log(`Valoración enviada: ${rating} estrellas`);
    
    // Idealmente habría que actualizar el promedio de valoraciones
    // Esto requeriría una llamada a la API y actualizar el estado del mod
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

  if (loading) {
    return (
      <div className="mod-details-loading">
        <div className="loading-spinner"></div>
        <p>Cargando detalles del mod...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mod-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="action-button">
          <i className="fas fa-arrow-left"></i>
          Volver atrás
        </button>
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="mod-details-not-found">
        <h2>Mod no encontrado</h2>
        <button onClick={() => navigate(-1)} className="action-button">
          <i className="fas fa-arrow-left"></i>
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="mod-details-container">
      {/* Banner de mensaje de valoración */}
      {showRatingMsg && (
        <div className="rating-message-banner">
          <i className="fas fa-check-circle"></i>
          <span>¡Gracias por tu valoración!</span>
        </div>
      )}
      
      {/* Banner del juego */}
      {mod.juego && (
        <div className="game-banner">
          <div className="game-banner-content">
            <div className="game-logo">
              <img 
                src={mod.imagen || '/images/mod-placeholder.jpg'} 
                alt={mod.titulo} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/mod-placeholder.jpg';
                }} 
              />
            </div>
            <div className="game-info">
              <h2>Mod para {mod.juego.titulo}</h2>
              <div className="mod-title-container">
                <h1>{mod.titulo}</h1>
                <button 
                  className={`icon-button favorite ${isGuardado ? 'active' : ''}`}
                  onClick={handleGuardarClick}
                  title={isGuardado ? 'Guardado' : 'Guardar mod'}
                >
                  <i className={isGuardado ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
                </button>
              </div>
              <div className="mod-creator-info">
                <img src={mod.creador?.foto_perfil || '/images/user-placeholder.jpg'} alt={mod.creador?.nome} />
                <div className="creator-details">
                  <span className="creator-label">Creado por</span>
                  <span className="creator-name">{mod.creador?.nome || 'Anónimo'}</span>
                </div>
              </div>
              <div className="mod-banner-stats">
                <div className="stats-group">
                  <span className="banner-stat">
                    <i className="fas fa-download"></i>
                    {mod.estadisticas?.total_descargas || 0} descargas
                  </span>
                  <span className="banner-stat">
                    <i className="fas fa-star"></i>
                    {mod.estadisticas?.valoracion_media || 0}
                    <small>({mod.estadisticas?.total_valoraciones || 0})</small>
                  </span>
                  <span className="banner-stat">
                    <i className="fas fa-code-branch"></i>
                    v{ultimaVersion ? ultimaVersion.version : mod.version}
                  </span>
                </div>
                <div className="action-buttons">
                  <button 
                    className="icon-button download"
                    title={`Descargar v${ultimaVersion ? ultimaVersion.version : mod.version}`}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mod-details-content">
        <div className="mod-description-section">
          <h3><i className="fas fa-info-circle"></i> Descripción</h3>
          <p>{mod.descripcion}</p>
          <div className="mod-tags">
            {mod.etiquetas?.map(tag => (
              <span key={tag.id} className="mod-tag">
                <i className="fas fa-tag"></i> {tag.nombre}
              </span>
            ))}
          </div>
        </div>

        <div className="mod-user-rating">
          <h3>Tu valoración</h3>
          <div className="rating-stars-container">
            <div className="rating-stars">
              {renderStars()}
            </div>
            {hasRated && (
              <span className="rating-success">
                <i className="fas fa-check-circle"></i>
              </span>
            )}
          </div>
        </div>

        <div className="mod-tabs">
          <button 
            className={activeTab === 'versiones' ? 'active' : ''} 
            onClick={() => setActiveTab('versiones')}
          >
            <i className="fas fa-code-branch"></i> Versiones
          </button>
          <button 
            className={activeTab === 'comentarios' ? 'active' : ''} 
            onClick={() => setActiveTab('comentarios')}
          >
            <i className="fas fa-comments"></i> Comentarios
          </button>
        </div>

        <div className="mod-tab-content">
          {activeTab === 'versiones' && (
            <div className="mod-versions">
              {mod.versiones?.length > 0 ? (
                mod.versiones.map(version => (
                  <div key={version.id} className="version-item">
                    <div className="version-info">
                      <h3>v{version.version}</h3>
                      <span className="version-date">
                        <i className="fas fa-calendar-alt"></i> {new Date(version.fecha).toLocaleDateString()}
                      </span>
                      {ultimaVersion && ultimaVersion.id === version.id && (
                        <span className="latest-tag">
                          <i className="fas fa-certificate"></i> Última versión
                        </span>
                      )}
                    </div>
                    <div className="version-notes">
                      {version.notas && <p>{version.notas}</p>}
                    </div>
                    <div className="version-actions">
                      <button className="btn-download-version">
                        <i className="fas fa-download"></i>
                        Descargar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-versions">
                  <i className="fas fa-exclamation-circle"></i>
                  <p>No hay versiones disponibles para este mod</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comentarios' && (
            <div className="mod-comments">
              <div className="comments-header">
                <h3><i className="fas fa-comment-dots"></i> Comentarios</h3>
                <button className="btn-add-comment">
                  <i className="fas fa-plus"></i> Añadir comentario
                </button>
              </div>
              <div className="comments-list">
                <div className="comment-empty">
                  <i className="fas fa-comments"></i>
                  <p>Sé el primero en comentar sobre este mod</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModDetails; 