import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gameService from '../../services/api/gameService';
import modService from '../../services/api/modService';
import userService from '../../services/api/userService';
import ModCardCompact from './Cards/ModCardCompact';
import GameCard from './Cards/GameCard';
import UserCard from './Cards/UserCard';
import PageContainer from '../layout/PageContainer';
import '../../assets/styles/components/common/SearchResults.css';

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [gameResults, setGameResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('todos');
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer query de la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q') || '';
    setSearchQuery(query);
    
    if (query.trim()) {
      performSearch(query.trim());
    } else {
      // Si no hay query, limpiar resultados
      setSearchResults([]);
      setGameResults([]);
      setUserResults([]);
    }
  }, [location.search]);

  // Función para buscar en todas las categorías
  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setGameResults([]);
      setUserResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar en paralelo en todas las categorías
      const [modsResponse, gamesResponse, usersResponse] = await Promise.allSettled([
        modService.searchModsByName(query.trim()),
        gameService.searchGames(query.trim()).catch(async () => {
          // Fallback para juegos
          const allGames = await gameService.getAllGames();
          return allGames.filter(game => {
            const title = game.titulo || game.title || game.name || '';
            return title.toLowerCase().includes(query.trim().toLowerCase());
          });
        }),
        userService.searchUsers(query.trim())
      ]);

      // Procesar resultados de mods
      if (modsResponse.status === 'fulfilled' && modsResponse.value?.status === 'success') {
        const formattedMods = modsResponse.value.data.map(mod => ({
          ...mod,
          autor: mod.creador?.nome || 'Autor desconocido',
          juego: mod.juego || { titulo: 'Juego no especificado' }
        }));
        setSearchResults(formattedMods);
      } else {
        setSearchResults([]);
      }

      // Procesar resultados de juegos
      if (gamesResponse.status === 'fulfilled' && Array.isArray(gamesResponse.value)) {
        const formattedGames = gamesResponse.value.map(game => ({
          ...game,
          titulo: game.titulo || game.title || game.name,
          imagen_fondo: game.imagen_fondo || game.background_image || game.image,
          mods_totales: game.mods_totales || game.total_mods || game.totalMods || 0
        }));
        setGameResults(formattedGames);
      } else {
        setGameResults([]);
      }

      // Procesar resultados de usuarios
      if (usersResponse.status === 'fulfilled' && usersResponse.value?.status === 'success') {
        setUserResults(usersResponse.value.data);
      } else {
        setUserResults([]);
      }

    } catch (error) {
      console.error('Error searching:', error);
      setError(error.message || 'Error al realizar la búsqueda');
      setSearchResults([]);
      setGameResults([]);
      setUserResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalResults = searchResults.length + gameResults.length + userResults.length;

  // Filtrar resultados según la pestaña activa
  const getVisibleResults = () => {
    switch (activeTab) {
      case 'mods':
        return { mods: searchResults, games: [], users: [] };
      case 'juegos':
        return { mods: [], games: gameResults, users: [] };
      case 'usuarios':
        return { mods: [], games: [], users: userResults };
      default:
        return { mods: searchResults, games: gameResults, users: userResults };
    }
  };

  const { mods, games, users } = getVisibleResults();

  return (
    <PageContainer>
      <div className="search-results-page">
        {/* Header con nueva búsqueda */}
        <div className="search-header">
          <h1 className="search-title">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Resultados de búsqueda'}
          </h1>

          {/* Información de resultados */}
          {!loading && searchQuery && (
            <div className="results-info">
              <p className="results-count">
                {totalResults > 0 
                  ? `${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
                  : 'No se encontraron resultados'
                }
              </p>
            </div>
          )}
        </div>

        {/* Pestañas de filtrado */}
        {!loading && totalResults > 0 && (
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'todos' ? 'active' : ''}`}
                onClick={() => setActiveTab('todos')}
              >
                Todos ({totalResults})
              </button>
              {searchResults.length > 0 && (
                <button
                  className={`tab ${activeTab === 'mods' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mods')}
                >
                  Mods ({searchResults.length})
                </button>
              )}
              {gameResults.length > 0 && (
                <button
                  className={`tab ${activeTab === 'juegos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('juegos')}
                >
                  Juegos ({gameResults.length})
                </button>
              )}
              {userResults.length > 0 && (
                <button
                  className={`tab ${activeTab === 'usuarios' ? 'active' : ''}`}
                  onClick={() => setActiveTab('usuarios')}
                >
                  Usuarios ({userResults.length})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="search-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p className="loading-text">Buscando...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-text">Error al realizar la búsqueda</p>
              <p className="error-subtext">{error}</p>
              <button 
                className="retry-button"
                onClick={() => performSearch(searchQuery)}
              >
                Intentar de nuevo
              </button>
            </div>
          ) : !searchQuery ? (
            <div className="empty-state">
              <p className="empty-text">Ingresa un término de búsqueda</p>
              <p className="empty-subtext">Busca mods, juegos o usuarios</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No se encontraron resultados</p>
              <p className="empty-subtext">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="results-container">
              {/* Mostrar resultados por categorías cuando activeTab es 'todos' */}
              {activeTab === 'todos' ? (
                <div className="all-results-sections">
                  {/* Sección de Mods */}
                  {mods.length > 0 && (
                    <div className="results-section">
                      <h2 className="section-title">Mods ({mods.length})</h2>
                      <div className="mods-grid">
                        {mods.map((mod) => (
                          <div key={mod.id} className="mod-card-wrapper">
                            <ModCardCompact 
                              mod={mod}
                              onClick={() => navigate(`/mods/${mod.id}`)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Juegos */}
                  {games.length > 0 && (
                    <div className="results-section">
                      <h2 className="section-title">Juegos ({games.length})</h2>
                      <div className="games-grid">
                        {games.map((game) => (
                          <div key={game.id} className="game-card-wrapper">
                            <GameCard 
                              game={game}
                              showStats={true}
                              showFavoriteButton={false}
                              onClick={() => navigate(`/juegos/${game.id}`)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Usuarios */}
                  {users.length > 0 && (
                    <div className="results-section">
                      <h2 className="section-title">Usuarios ({users.length})</h2>
                      <div className="users-grid">
                        {users.map((user) => (
                          <div key={user.id} className="user-card-wrapper">
                            <UserCard 
                              user={user}
                              onClick={() => navigate(`/usuarios/${user.id}/perfil`)}
                              showLink={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Mostrar solo la categoría seleccionada
                <div className="single-category-results">
                  {/* Sección de Mods */}
                  {mods.length > 0 && (
                    <div className="results-section">
                      <div className="mods-grid">
                        {mods.map((mod) => (
                          <div key={mod.id} className="mod-card-wrapper">
                            <ModCardCompact 
                              mod={mod}
                              onClick={() => navigate(`/mods/${mod.id}`)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Juegos */}
                  {games.length > 0 && (
                    <div className="results-section">
                      <div className="games-grid">
                        {games.map((game) => (
                          <div key={game.id} className="game-card-wrapper">
                            <GameCard 
                              game={game}
                              showStats={true}
                              showFavoriteButton={false}
                              onClick={() => navigate(`/juegos/${game.id}`)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Usuarios */}
                  {users.length > 0 && (
                    <div className="results-section">
                      <div className="users-grid">
                        {users.map((user) => (
                          <div key={user.id} className="user-card-wrapper">
                            <UserCard 
                              user={user}
                              onClick={() => navigate(`/usuarios/${user.id}/perfil`)}
                              showLink={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SearchResults; 