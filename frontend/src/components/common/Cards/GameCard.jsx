import React from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../../context/NotificationContext';
import { useFavorite } from '../../../hooks/useFavorites';

const GameCard = ({ game, showStats = true, showFavoriteButton = false, onFavoriteChange }) => {
  const { showNotification } = useNotification();
  
  // Hook para manejar favoritos (solo si showFavoriteButton es true)
  const [esFavorito, toggleFavorito, cargandoFavorito, errorFavorito, mensaje] = useFavorite(
    showFavoriteButton ? game.id : null
  );

  // Manejar el toggle de favoritos
  const handleToggleFavorito = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cargandoFavorito) return;
    
    const success = await toggleFavorito();
    
    // Llamar al callback si se proporciona y la operación fue exitosa
    if (success && onFavoriteChange) {
      onFavoriteChange(game.id, !esFavorito);
    }
  };

  return (
    <div className="relative group">
      {/* Card Container */}
      <div className="bg-custom-card rounded-lg shadow-xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl">
        {/* Imagen del juego con overlay */}
        <div className="relative aspect-[2/3]">
          <img 
            src={game.imagen_fondo || game.background_image || game.image} 
            alt={game.titulo || game.title || game.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
          
          {/* Botón de favoritos - solo mostrar si showFavoriteButton es true */}
          {showFavoriteButton && (
            <button 
              className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg backdrop-blur-sm z-20 ${
                esFavorito 
                  ? 'bg-red-500/80 hover:bg-red-600/80' 
                  : 'bg-black/40 hover:bg-red-500/80'
              } ${cargandoFavorito ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              onClick={handleToggleFavorito}
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
          )}

          {/* Información del juego */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {game.titulo || game.title || game.name}
            </h3>
            
            {/* Estadísticas - solo mostrar si showStats es true */}
            {showStats && (
              <div className="flex items-center text-sm">
                {/* Total de mods */}
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{game.mods_totales || game.total_mods || game.totalMods || 0} mods</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enlace que cubre toda la tarjeta */}
      <Link 
        to={`/juegos/${game.id}`} 
        className="absolute inset-0 z-10"
        aria-label={`Ver detalles de ${game.titulo || game.title || game.name}`}
      />
    </div>
  );
};

export default GameCard; 