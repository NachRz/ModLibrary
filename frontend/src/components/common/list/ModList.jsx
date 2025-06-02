import React from 'react';
import { Link } from 'react-router-dom';
import useUserModsStatus from '../../../hooks/useUserModsStatus';
import { useNotification } from '../../../context/NotificationContext';
import '../../../assets/styles/components/common/list/ModList.css';

const ModListItem = ({ mod, showSaveButton = true, onSavedChange, onEdit, onDelete }) => {
  const { 
    isAuthenticated, 
    isSaved, 
    toggleSavedStatus, 
    loading: userLoading 
  } = useUserModsStatus();
  const { showNotification } = useNotification();

  // Usar la propiedad isOwner que se pasa desde el componente padre (optimizada)
  const isCreator = mod.isOwner || false;
  const isModSaved = isSaved(mod?.id);

  // Función para mostrar estrellas según la valoración
  const renderStars = (valoracion) => {
    if (!valoracion || valoracion === 0) {
      return <span className="text-gray-400 text-sm">Sin valorar</span>;
    }

    const fullStars = Math.floor(valoracion);
    const hasHalfStar = valoracion % 1 >= 0.5;
    const stars = [];

    // Añadir estrellas completas
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    // Añadir media estrella si corresponde
    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfGradient">
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    // Añadir estrellas vacías
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-star-${i}`} className="h-4 w-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return (
      <div className="flex items-center">
        <div className="flex items-center mr-1">{stars}</div>
        <span className="text-sm font-medium text-yellow-400">
          {parseFloat(valoracion).toFixed(1)}
        </span>
        <span className="text-xs text-gray-400 ml-1">
          ({mod.numValoraciones || 0})
        </span>
      </div>
    );
  };

  // Manejar el clic en el botón de guardar/eliminar
  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }
    
    const prevStatus = isModSaved;
    try {
      await toggleSavedStatus(mod.id);
      if (onSavedChange && typeof onSavedChange === 'function') {
        onSavedChange(!prevStatus);
      }
      showNotification(
        !prevStatus ? '¡Mod guardado!' : 'Mod eliminado de guardados',
        'success'
      );
    } catch (err) {
      showNotification('Error al guardar/eliminar el mod', 'error');
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Formatear número de descargas
  const formatDownloads = (downloads) => {
    if (downloads >= 1000000) {
      return `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}K`;
    }
    return downloads.toString();
  };

  const modUrl = `/mods/${mod.id}`;

  return (
    <div className="mod-list-item">
      {/* Imagen */}
      <div className="mod-list-image">
        <img 
          src={mod.imagen} 
          alt={mod.titulo}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        
        {/* Categoría sobre la imagen */}
        <div className="absolute top-3 left-3 bg-custom-primary/90 text-white text-xs font-medium py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm">
          {mod.categoria}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mod-list-content">
        <div className="mod-list-header">
          <div className="mod-list-title-section">
            <Link 
              to={modUrl}
              className="mod-list-title"
            >
              {mod.titulo}
            </Link>
            <div className="mod-list-meta">
              <span className="mod-list-game">{mod.juego?.titulo || 'Juego no especificado'}</span>
              <span className="mod-list-separator">•</span>
              <span className="mod-list-author">por <span className="font-medium text-custom-secondary">{mod.autor}</span></span>
              <span className="mod-list-separator">•</span>
              <span className="mod-list-date">{formatDate(mod.fecha)}</span>
            </div>
          </div>
        </div>

        <div className="mod-list-description">
          {mod.descripcion}
        </div>

        <div className="mod-list-tags">
          {mod.etiquetas && mod.etiquetas.slice(0, 3).map((etiqueta, index) => (
            <span key={index} className="mod-list-tag">
              {etiqueta.nombre}
            </span>
          ))}
          {mod.etiquetas && mod.etiquetas.length > 3 && (
            <span className="mod-list-tag-more">
              +{mod.etiquetas.length - 3} más
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas y acciones */}
      <div className="mod-list-stats">
        <div className="mod-list-rating">
          {renderStars(mod.valoracion)}
        </div>

        <div className="mod-list-downloads">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{formatDownloads(mod.descargas)} descargas</span>
        </div>

        <div className="mod-list-actions">
          {isAuthenticated && showSaveButton && !isCreator && (
            <button 
              onClick={handleSaveToggle}
              disabled={userLoading}
              className={`mod-list-save-button ${isModSaved ? 'active' : ''}`}
              title={isModSaved ? 'Guardado' : 'Guardar mod'}
            >
              <i className={`${isModSaved ? 'fas' : 'far'} fa-bookmark`}></i>
            </button>
          )}

          {/* Botones de editar y eliminar (solo para el creador) */}
          {isCreator && (
            <>
              {onEdit && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(mod);
                  }}
                  className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 hover:text-green-300 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center backdrop-blur-sm"
                  title="Editar mod"
                >
                  <i className="fas fa-edit mr-1"></i>
                  Editar
                </button>
              )}
              {onDelete && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(mod);
                  }}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center backdrop-blur-sm"
                  title="Eliminar mod"
                >
                  <i className="fas fa-trash mr-1"></i>
                  Eliminar
                </button>
              )}
            </>
          )}

          <Link 
            to={modUrl}
            className="mod-list-view-button"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

const ModList = ({ mods, showSaveButton = true, onSavedChange, onEdit, onDelete }) => {
  if (!mods || mods.length === 0) {
    return (
      <div className="mod-list-empty">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-custom-text">No se encontraron mods</h3>
        <p className="mt-1 text-custom-detail">Prueba a cambiar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="mod-list">
      {mods.map((mod) => (
        <ModListItem 
          key={mod.id}
          mod={mod}
          showSaveButton={showSaveButton}
          onSavedChange={onSavedChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ModList; 