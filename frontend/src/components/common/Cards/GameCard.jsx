import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game, showStats = true }) => {
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

  // Determinar la URL del juego
  const gameUrl = `/juegos/${game.id}`;

  return (
    <div className="bg-custom-card rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-custom-detail/10">
      {/* Imagen del juego */}
      <div className="relative">
        <img 
          src={game.image} 
          alt={game.title} 
          className="w-full h-56 object-cover brightness-90" 
          loading="lazy"
        />
        
        {/* Overlay sutil mejorado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none"></div>
        
        {/* Año de lanzamiento */}
        <div className="absolute top-3 left-3 bg-custom-primary/90 text-white text-xs font-medium py-1.5 px-3 rounded-full shadow-lg backdrop-blur-sm">
          {game.releaseYear}
        </div>
        
        {/* Plataformas */}
        {game.platforms && (
          <div className="absolute top-3 right-3 flex space-x-1">
            {game.platforms.map((platform, index) => (
              <div key={index} className="bg-custom-bg/60 text-white text-xs font-medium py-1 px-2 rounded-md shadow-lg backdrop-blur-sm">
                {platform}
              </div>
            ))}
          </div>
        )}
        
        {/* Título sobre la imagen con mayor contraste */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-xl leading-tight line-clamp-1 drop-shadow-lg">{game.title}</h3>
          <p className="text-sm text-white/95 mt-1 flex items-center drop-shadow-lg">
            <span className="bg-custom-card/50 px-2 py-0.5 rounded backdrop-blur-md">{game.developer}</span>
            {game.genres && (
              <>
                <span className="mx-1.5">•</span>
                <span className="bg-custom-card/50 px-2 py-0.5 rounded backdrop-blur-md">
                  {game.genres.join(', ')}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-5">
        {/* Descripción */}
        <p className="text-white/90 text-sm mb-4 line-clamp-2 mt-1">{game.description}</p>
        
        {showStats && (
          <>
            {/* Estadísticas */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center bg-custom-bg/50 rounded-full px-3 py-1.5 text-white shadow-sm">
                <div className="flex items-center mr-1">
                  {renderStars(game.rating)}
                </div>
                <span className="ml-1 text-xs font-medium">{game.rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-white/90 bg-custom-bg/50 rounded-full px-3 py-1.5 shadow-sm">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-medium">{game.totalMods} mods</span>
                </div>
                
                {game.trending && (
                  <div className="flex items-center text-white/90 bg-custom-tertiary/50 rounded-full px-3 py-1.5 shadow-sm">
                    <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-medium">Trending</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Botones de acción */}
        <div className="flex space-x-3">
          <Link 
            to={`${gameUrl}/mods`} 
            className="flex-1 text-center py-2.5 font-medium rounded-lg text-white bg-custom-primary hover:bg-custom-primary-hover transition-colors duration-300 text-sm shadow-sm hover:shadow-md"
          >
            Ver mods
          </Link>
          
          <Link 
            to={gameUrl} 
            className="flex-1 text-center py-2.5 font-medium rounded-lg text-white bg-custom-primary/10 hover:bg-custom-primary/20 transition-colors duration-300 text-sm shadow-sm hover:shadow-md"
          >
            Detalles
          </Link>
          
          <button className="bg-custom-bg/50 hover:bg-custom-bg/70 p-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
            <svg className="h-5 w-5 text-white hover:text-custom-tertiary transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard; 