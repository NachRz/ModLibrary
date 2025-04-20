import React from 'react';
import GameCard from '../../common/Cards/GameCard';

const JuegosFavoritos = () => {
  // Datos de ejemplo para juegos favoritos
  const favoriteGames = [
    
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Juegos Favoritos</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar juegos..."
            className="py-2 pl-10 pr-4 bg-custom-card border border-custom-detail/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-primary/50"
          />
          <svg className="h-5 w-5 text-custom-detail absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
      
      {favoriteGames.length === 0 && (
        <div className="bg-custom-card rounded-xl p-8 text-center">
          <svg className="h-16 w-16 mx-auto text-custom-detail/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h4 className="text-lg font-medium text-white mt-4">No tienes juegos favoritos</h4>
          <p className="text-custom-detail mt-2 max-w-md mx-auto">Explora nuestro catálogo de juegos y añade a favoritos aquellos que más te interesen para acceder rápidamente a sus mods.</p>
          <button className="mt-6 bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
            Explorar juegos
          </button>
        </div>
      )}
    </div>
  );
};

export default JuegosFavoritos; 