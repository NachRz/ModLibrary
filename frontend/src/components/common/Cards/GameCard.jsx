import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';

const GameCard = ({ game, showStats = true }) => {
  // Estados para favoritos
  const [esFavorito, setEsFavorito] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);
  const { showNotification } = useNotification();

  // Función para manejar favoritos
  const toggleFavorito = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cargandoFavorito) return;
    
    try {
      setCargandoFavorito(true);
      
      // Aquí iría la lógica para añadir/quitar de favoritos usando el servicio
      // await favoritosService.toggleFavorito(game.id);
      
      setEsFavorito(!esFavorito);
      showNotification(
        esFavorito ? 'Juego eliminado de favoritos' : 'Juego añadido a favoritos',
        'success'
      );
    } catch (err) {
      console.error('Error al actualizar favoritos:', err);
      showNotification('Error al actualizar favoritos', 'error');
    } finally {
      setCargandoFavorito(false);
    }
  };

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
    <div className="relative group">
      {/* Card Container */}
      <div className="bg-custom-card rounded-lg shadow-xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl">
        {/* Imagen del juego con overlay */}
        <div className="relative aspect-[2/3]">
          <img 
            src={game.image} 
            alt={game.title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          
          {/* Botón de favoritos */}
          <button 
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm z-20 ${
              esFavorito 
                ? 'bg-red-500/80 hover:bg-red-600/80' 
                : 'bg-black/40 hover:bg-red-500/80'
            } ${cargandoFavorito ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            onClick={toggleFavorito}
            disabled={cargandoFavorito}
          >
            {cargandoFavorito ? (
              <div className="animate-spin h-4 w-4">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            ) : (
              <svg 
                className="h-4 w-4 text-white transition-all duration-300" 
                fill={esFavorito ? "currentColor" : "none"} 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={esFavorito ? 0 : 2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            )}
          </button>

          {/* Información del juego */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">{game.title}</h3>
            
            {/* Estadísticas */}
            <div className="flex items-center space-x-4 text-sm">
              {/* Total de mods */}
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{game.totalMods || 0}</span>
              </div>

              {/* Descargas únicas por usuario */}
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span>Próximamente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlace que cubre toda la tarjeta */}
      <Link 
        to={`/juegos/${game.id}`} 
        className="absolute inset-0 z-10"
        aria-label={`Ver detalles de ${game.title}`}
      />
    </div>
  );
};

export default GameCard; 