import React from 'react';
import { Link } from 'react-router-dom';

const ModCard = ({ mod, isOwner = false, actions }) => {
  // Función para mostrar estrellas según la valoración
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
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

  // Determinar la URL del mod
  const modUrl = `/mods/${mod.id}`;

  return (
    <div className="bg-custom-card rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-custom-detail/10">
      {/* Imagen del mod */}
      <div className="relative">
        <img 
          src={mod.image} 
          alt={mod.title} 
          className="w-full h-48 object-cover brightness-90" 
          loading="lazy"
        />
        
        {/* Overlay sutil mejorado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
        
        {/* Categoría */}
        <div className="absolute top-3 left-3 bg-custom-primary/90 text-white text-xs font-medium py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm">
          {mod.category}
        </div>
        
        {/* Estado (si es propietario) */}
        {isOwner && mod.status && (
          <div className={`absolute top-3 right-3 text-xs font-medium py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm ${
            mod.status === 'publicado' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-yellow-500/90 text-white'
          }`}>
            {mod.status === 'publicado' ? 'Publicado' : 'Borrador'}
          </div>
        )}
        
        {/* Título sobre la imagen con mayor contraste */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg leading-tight line-clamp-1 drop-shadow-lg">{mod.title}</h3>
          <p className="text-sm text-white/95 mt-1 flex items-center drop-shadow-lg">
            <span className="bg-custom-card/50 px-2 py-0.5 rounded backdrop-blur-md">{mod.game}</span>
            <span className="mx-1.5">•</span>
            <span>por <span className="text-custom-secondary font-medium">{mod.author}</span></span>
          </p>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-5">
        {/* Descripción */}
        <p className="text-white/90 text-sm mb-4 line-clamp-2 mt-1">{mod.description}</p>
        
        {/* Estadísticas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-custom-bg/50 rounded-full px-3 py-1.5 text-white shadow-sm">
            <div className="flex items-center mr-1">
              {renderStars(mod.rating)}
            </div>
            <span className="ml-1 text-xs font-medium">{mod.rating.toFixed(1)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center text-white/90 bg-custom-bg/50 rounded-full px-3 py-1.5 shadow-sm">
              <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-xs font-medium">{mod.downloads >= 1000 ? `${(mod.downloads / 1000).toFixed(1)}k` : mod.downloads}</span>
            </div>
            
            {/* Acciones personalizadas o botón de guardar por defecto */}
            {actions || (
              <button className="text-white/90 hover:text-custom-secondary transition-colors duration-300 bg-custom-bg/50 p-2 rounded-full shadow-sm hover:shadow-md">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
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