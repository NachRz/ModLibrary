import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../../../services/api/authService';
import useSavedStatus from '../../../hooks/useSavedStatus';
import { useNotification } from '../../../context/NotificationContext';
import '../../../assets/styles/components/Cards/ModCard.css';

const ModCard = ({ mod, isOwner = false, actions, showSaveButton = true, onSavedChange }) => {
  const isAuthenticated = authService.isAuthenticated();
  const [isGuardado, toggleSavedStatus, isSaving] = useSavedStatus(mod?.id);
  const { showNotification } = useNotification();

  // Función para mostrar estrellas según la valoración
  const renderStars = (valoracion) => {
    // Si no hay valoraciones, mostramos estrellas vacías
    if (!valoracion || valoracion === 0) {
      const stars = [];
      for (let i = 0; i < 5; i++) {
        stars.push(
          <svg key={`empty-star-${i}`} className="h-4 w-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      }
      return stars;
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

    return stars;
  };

  // Manejar el clic en el botón de guardar/eliminar
  const handleSaveToggle = async (e) => {
    e.preventDefault(); // Evitar que se navegue al detalle del mod
    e.stopPropagation(); // Evitar propagación del evento
    
    if (!isAuthenticated) {
      return; // Si no está autenticado, no hacemos nada (podríamos redirigir al login)
    }
    
    const prevStatus = isGuardado;
    try {
      await toggleSavedStatus();
      // Notificar el cambio al componente padre si es necesario
      if (onSavedChange && typeof onSavedChange === 'function') {
        onSavedChange(!prevStatus);
      }
      // Mostrar notificación global
      showNotification(
        !prevStatus ? '¡Mod guardado!' : 'Mod eliminado de guardados',
        'success'
      );
    } catch (err) {
      showNotification('Error al guardar/eliminar el mod', 'error');
    }
  };

  // Determinar la URL del mod
  const modUrl = `/mods/${mod.id}`;

  return (
    <div className="bg-custom-card rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-custom-detail/10">
      {/* Imagen del mod */}
      <div className="relative">
        <img 
          src={mod.imagen} 
          alt={mod.titulo} 
          className="w-full h-48 object-cover brightness-90" 
          loading="lazy"
        />
        
        {/* Overlay sutil mejorado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
        
        {/* Categoría */}
        <div className="absolute top-3 left-3 bg-custom-primary/90 text-white text-xs font-medium py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm">
          {mod.categoria}
        </div>
        
        {/* Estado (si es propietario) */}
        {isOwner && mod.estado && (
          <div className={`absolute top-3 right-3 text-xs font-medium py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm ${
            mod.estado === 'publicado' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-yellow-500/90 text-white'
          }`}>
            {mod.estado === 'publicado' ? 'Publicado' : 'Borrador'}
          </div>
        )}
        
        {/* Título sobre la imagen con mayor contraste */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 drop-shadow-lg">{mod.titulo}</h3>
          <p className="text-sm text-white/95 mt-1 flex items-center drop-shadow-lg">
            <span className="bg-custom-card/50 px-2 py-0.5 rounded backdrop-blur-md">
              {mod.juego?.titulo || 'Juego no especificado'}
            </span>
            <span className="mx-1.5">•</span>
            <span>por <span className="text-custom-secondary font-medium">{mod.autor}</span></span>
          </p>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-5">
        {/* Descripción */}
        <p className="text-white/90 text-sm mb-4 line-clamp-2 mt-1">{mod.descripcion}</p>
        
        {/* Estadísticas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-custom-bg/50 rounded-full px-3 py-1.5 text-white shadow-sm">
            <div className="flex items-center mr-1">
              {renderStars(mod.valoracion)}
            </div>
            <span className="ml-1 text-xs font-medium">
              {mod.valoracion ? parseFloat(mod.valoracion).toFixed(1) : '0.0'}
            </span>
            <span className="ml-1 text-xs text-white/70">
              ({mod.numValoraciones || 0})
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-white/90 bg-custom-bg/50 rounded-full px-3 py-1.5 shadow-sm">
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-xs font-medium">{mod.descargas >= 1000 ? `${(mod.descargas / 1000).toFixed(1)}k` : mod.descargas}</span>
            </div>
            
            {/* Botón de guardar (si está autenticado) */}
            {isAuthenticated && showSaveButton && (
              <button 
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`mod-card-save-button ${isGuardado ? 'active' : ''}`}
                title={isGuardado ? 'Guardado' : 'Guardar mod'}
              >
                <i className={`${isGuardado ? 'fas' : 'far'} fa-bookmark`}></i>
              </button>
            )}
            
            {/* Solo mostrar acciones personalizadas si existen */}
            {actions && actions}
          </div>
        </div>
        
        {/* Botón inferior */}
        <Link 
          to={modUrl} 
          className="mt-5 block w-full text-center py-2.5 font-medium rounded-lg text-white bg-custom-primary/10 hover:bg-custom-primary/20 transition-colors duration-300 text-sm shadow-sm hover:shadow-md"
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
};

export default ModCard; 