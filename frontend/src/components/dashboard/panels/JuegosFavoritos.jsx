import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GameCard from '../../common/Cards/GameCard';
import { useFavorites, useSearchFavorites } from '../../../hooks/useFavorites';

const JuegosFavoritos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteGames, loading, error, refreshFavorites] = useFavorites();
  const [filteredGames] = useSearchFavorites(searchTerm);

  // Manejar cambios en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Juegos Favoritos</h3>
          <p className="text-custom-detail text-sm mt-1">
            {loading ? 'Cargando...' : `${favoriteGames.length} ${favoriteGames.length === 1 ? 'juego favorito' : 'juegos favoritos'}`}
          </p>
        </div>

        {favoriteGames.length > 0 && (
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar juegos..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="py-2 pl-10 pr-10 bg-custom-card border border-custom-detail/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-custom-primary/50 w-64"
            />
            <svg className="h-5 w-5 text-custom-detail absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-custom-detail hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Mostrar estado de carga */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-custom-primary mb-4"></div>
            <p className="text-custom-detail">Cargando juegos favoritos...</p>
          </div>
        </div>
      )}

      {/* Mostrar error */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <svg className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h4 className="text-lg font-medium text-white mb-2">Error al cargar favoritos</h4>
          <p className="text-custom-detail mb-4">{error}</p>
          <button
            onClick={refreshFavorites}
            className="bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-4 rounded-lg transition-all duration-300"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Mostrar lista de juegos favoritos */}
      {!loading && !error && (
        <>
          {searchTerm && (
            <div className="flex items-center justify-between bg-custom-card/50 rounded-lg p-3 border border-custom-detail/20">
              <span className="text-custom-detail">
                Mostrando {filteredGames.length} de {favoriteGames.length} juegos para "{searchTerm}"
              </span>
              {filteredGames.length === 0 && (
                <button
                  onClick={clearSearch}
                  className="text-custom-primary hover:text-custom-primary-hover text-sm"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(searchTerm ? filteredGames : favoriteGames).map(game => (
              <GameCard
                key={game.id}
                game={game}
                showFavoriteButton={true}
                onFavoriteChange={refreshFavorites}
              />
            ))}
          </div>
        </>
      )}

      {/* Estado vacío */}
      {!loading && !error && favoriteGames.length === 0 && (
        <div className="bg-custom-card rounded-xl p-8 text-center">
          <svg className="h-16 w-16 mx-auto text-custom-detail/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h4 className="text-lg font-medium text-white mt-4">No tienes juegos favoritos</h4>
          <p className="text-custom-detail mt-2 max-w-md mx-auto">
            Explora nuestro catálogo de juegos y añade a favoritos aquellos que más te interesen para acceder rápidamente a sus mods.
          </p>
          <Link
            to="/juegos"
            className="inline-block mt-6 bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Explorar juegos
          </Link>
        </div>
      )}

      {/* Estado de búsqueda sin resultados */}
      {!loading && !error && searchTerm && filteredGames.length === 0 && favoriteGames.length > 0 && (
        <div className="bg-custom-card rounded-xl p-8 text-center">
          <svg className="h-16 w-16 mx-auto text-custom-detail/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h4 className="text-lg font-medium text-white mt-4">No se encontraron juegos</h4>
          <p className="text-custom-detail mt-2 max-w-md mx-auto">
            No hay juegos favoritos que coincidan con "{searchTerm}". Prueba con otro término de búsqueda.
          </p>
          <button
            onClick={clearSearch}
            className="mt-6 bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-6 rounded-lg transition-all duration-300"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}
    </div>
  );
};

export default JuegosFavoritos; 