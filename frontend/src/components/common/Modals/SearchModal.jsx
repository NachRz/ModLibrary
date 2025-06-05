import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gameService from '../../../services/api/gameService';
import modService from '../../../services/api/modService';
import userService from '../../../services/api/userService';
import ModCardCompact from '../Cards/ModCardCompact';
import GameCard from '../Cards/GameCard';
import UserCard from '../Cards/UserCard';
import '../../../assets/styles/components/common/modals/SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('todos');
  const [recentSearches, setRecentSearches] = useState([]);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [errorFavorites, setErrorFavorites] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [gameResults, setGameResults] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Cargar búsquedas recientes desde localStorage
  useEffect(() => {
    const savedRecentSearches = localStorage.getItem('recentSearches');
    if (savedRecentSearches) {
      setRecentSearches(JSON.parse(savedRecentSearches));
    }
  }, []);

  // Función para buscar mods por nombre
  const searchMods = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    setHasSearched(true);

    try {
      const response = await modService.searchModsByName(query.trim());
      
      if (response.status === 'success') {
        // Mapear los datos para que sean compatibles con ModCard
        const formattedMods = response.data.map(mod => ({
          ...mod,
          autor: mod.creador?.nome || 'Autor desconocido',
          juego: mod.juego || { titulo: 'Juego no especificado' }
        }));
        setSearchResults(formattedMods);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching mods:', error);
      setErrorSearch(error.message || 'Error al buscar mods');
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Función para buscar juegos por nombre
  const searchGames = async (query) => {
    if (!query || query.trim().length < 2) {
      setGameResults([]);
      setHasSearched(false);
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    setHasSearched(true);

    try {
      const games = await gameService.searchGames(query.trim());
      
      // Si games es un array, continuar con el mapeo
      if (Array.isArray(games)) {
        // Mapear los datos para que sean compatibles con GameCard
        const formattedGames = games.map(game => ({
          ...game,
          titulo: game.titulo || game.title || game.name,
          imagen_fondo: game.imagen_fondo || game.background_image || game.image,
          mods_totales: game.mods_totales || game.total_mods || game.totalMods || 0
        }));
        
        setGameResults(formattedGames);
      } else {
        // Si no es un array, establecer array vacío
        setGameResults([]);
      }
    } catch (error) {
      console.error('Error searching games:', error);
      
      // Intentar usar datos mock como fallback
      try {
        const allGames = await gameService.getAllGames();
        const filteredGames = allGames.filter(game => {
          const title = game.titulo || game.title || game.name || '';
          return title.toLowerCase().includes(query.trim().toLowerCase());
        });
        
        const formattedGames = filteredGames.map(game => ({
          ...game,
          titulo: game.titulo || game.title || game.name,
          imagen_fondo: game.imagen_fondo || game.background_image || game.image,
          mods_totales: game.mods_totales || game.total_mods || game.totalMods || 0
        }));
        
        setGameResults(formattedGames);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        setErrorSearch('Error al buscar juegos');
        setGameResults([]);
      }
    } finally {
      setLoadingSearch(false);
    }
  };

  // Función para buscar usuarios por nombre
  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setUserResults([]);
      setHasSearched(false);
      return;
    }

    setLoadingSearch(true);
    setErrorSearch(null);
    setHasSearched(true);

    try {
      const response = await userService.searchUsers(query.trim());
      
      if (response.status === 'success') {
        // Los datos ya vienen formateados desde el backend
        setUserResults(response.data);
      } else {
        setUserResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setErrorSearch(error.message || 'Error al buscar usuarios');
      setUserResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  // Función para cargar juegos favoritos desde la API
  const fetchFavoriteGames = async () => {
    setLoadingFavorites(true);
    setErrorFavorites(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFavoriteGames([]);
        setLoadingFavorites(false);
        return;
      }

      const juegosFavoritos = await gameService.getFavoriteGames();
      
      // Mapear los datos de la API al formato esperado
      const formattedGames = juegosFavoritos.map(juego => ({
        id: juego.id,
        name: juego.titulo,
        image: juego.imagen_fondo,
        slug: juego.slug || juego.titulo.toLowerCase().replace(/\s+/g, '-'),
        totalMods: juego.total_mods,
        rating: juego.rating,
        fechaAgregado: juego.fecha_agregado
      }));

      setFavoriteGames(formattedGames);
    } catch (error) {
      console.error('Error fetching favorite games:', error);
      setErrorFavorites(error.message || 'Error al cargar juegos favoritos');
      setFavoriteGames([]);
    } finally {
      setLoadingFavorites(false);
    }
  };



  // Cargar juegos favoritos desde la API
  useEffect(() => {
    if (isOpen) {
      fetchFavoriteGames();
    }
  }, [isOpen]);

  // Buscar mods, juegos o usuarios cuando se escribe en el campo (con debounce)
  useEffect(() => {
    if (searchType === 'mods' && searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchMods(searchQuery);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    } else if (searchType === 'juegos' && searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchGames(searchQuery);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    } else if (searchType === 'usuarios' && searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timer);
    } else if (searchType === 'mods') {
      setSearchResults([]);
      setHasSearched(false);
    } else if (searchType === 'juegos') {
      setGameResults([]);
      setHasSearched(false);
    } else if (searchType === 'usuarios') {
      setUserResults([]);
      setHasSearched(false);
    }
  }, [searchQuery, searchType]);

  // Enfocar el input cuando se abre el modal
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Manejar ESC para cerrar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  // Añadir búsqueda a recientes
  const addToRecentSearches = (query) => {
    if (!query.trim()) return;
    
    const updatedRecentSearches = [
      query.trim(),
      ...recentSearches.filter(search => search !== query.trim())
    ].slice(0, 5); // Mantener solo los últimos 5

    setRecentSearches(updatedRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
  };

  // Realizar búsqueda
  const performSearch = (query) => {
    const encodedQuery = encodeURIComponent(query);
    let searchPath = '';

    switch (searchType) {
      case 'todos':
        searchPath = `/search?q=${encodedQuery}`;
        break;
      case 'mods':
        searchPath = `/mods?search=${encodedQuery}`;
        break;
      case 'juegos':
        searchPath = `/juegos?search=${encodedQuery}`;
        break;
      case 'usuarios':
        searchPath = `/usuarios?search=${encodedQuery}`;
        break;
      default:
        searchPath = `/search?q=${encodedQuery}`;
    }

    // Añadir a búsquedas recientes
    addToRecentSearches(query);

    navigate(searchPath);
    onClose();
    setSearchQuery('');
  };

  // Eliminar búsqueda reciente
  const removeRecentSearch = (queryToRemove) => {
    const updatedRecentSearches = recentSearches.filter(search => search !== queryToRemove);
    setRecentSearches(updatedRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecentSearches));
  };

  // Limpiar todas las búsquedas recientes
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Manejar búsqueda reciente
  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };



  // Manejar clic en juego favorito
  const handleFavoriteGameClick = (game) => {
    navigate(`/juegos/${game.id}`);
    onClose();
  };

  // Manejar cambio del tipo de búsqueda
  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    setSearchResults([]);
    setGameResults([]);
    setUserResults([]);
    setHasSearched(false);
    setErrorSearch(null);
  };

  // Manejar clic en el backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Opciones del select
  const searchOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'mods', label: 'Mods' },
    { value: 'juegos', label: 'Juegos' },
    { value: 'usuarios', label: 'Usuarios' }
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="nexus-modal-overlay"
      onClick={handleBackdropClick}
    >
      <div className="nexus-modal-backdrop"></div>
      
      <div className="nexus-modal-content">
        {/* Header con campo de búsqueda */}
        <div className="nexus-modal-header">
          <div className="nexus-search-container">
            <form onSubmit={handleSubmit} className="nexus-search-form">
              <div className="nexus-search-input-wrapper">
                <select
                  value={searchType}
                  onChange={(e) => handleSearchTypeChange(e.target.value)}
                  className="nexus-category-select"
                >
                  {searchOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <svg className="nexus-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar mods, juegos, usuarios"
                  className="nexus-search-input"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="nexus-close-button"
                                  >
                    Cerrar
                  </button>
              </div>
            </form>
          </div>
        </div>

        {/* Body del modal */}
        <div className="nexus-modal-body">
          {/* Mostrar resultados de búsqueda de mods si está buscando mods */}
          {searchType === 'mods' && (hasSearched || searchQuery.trim()) ? (
            <div className="search-results-section">
              <div className="nexus-section-header">
                <h3 className="nexus-section-title">
                  {searchQuery.trim() ? `Resultados para "${searchQuery}"` : 'Resultados de búsqueda'}
                </h3>
              </div>
              
              {loadingSearch ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p className="loading-text">Buscando mods...</p>
                </div>
              ) : errorSearch ? (
                <div className="error-state">
                  <p className="error-text">Error al buscar mods</p>
                  <p className="error-subtext">{errorSearch}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="mods-grid">
                  {searchResults.map((mod) => (
                    <div key={mod.id} className="mod-card-wrapper">
                      <ModCardCompact 
                        mod={mod}
                        onClick={() => {
                          navigate(`/mods/${mod.id}`);
                          onClose();
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="empty-state">
                  <p className="empty-text">No se encontraron mods</p>
                  <p className="empty-subtext">Intenta con otros términos de búsqueda</p>
                </div>
              ) : null}
            </div>
          ) : searchType === 'juegos' && (hasSearched || searchQuery.trim()) ? (
            <div className="search-results-section">
              <div className="nexus-section-header">
                <h3 className="nexus-section-title">
                  {searchQuery.trim() ? `Resultados para "${searchQuery}"` : 'Resultados de búsqueda'}
                </h3>
              </div>
              
              {loadingSearch ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p className="loading-text">Buscando juegos...</p>
                </div>
              ) : errorSearch ? (
                <div className="error-state">
                  <p className="error-text">Error al buscar juegos</p>
                  <p className="error-subtext">{errorSearch}</p>
                </div>
              ) : gameResults.length > 0 ? (
                <div className="games-grid">
                  {gameResults.map((game) => (
                    <div key={game.id} className="game-card-wrapper">
                      <GameCard 
                        game={game}
                        showStats={true}
                        showFavoriteButton={false}
                        onClick={() => {
                          navigate(`/juegos/${game.id}`);
                          onClose();
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="empty-state">
                  <p className="empty-text">No se encontraron juegos</p>
                  <p className="empty-subtext">Intenta con otros términos de búsqueda</p>
                </div>
              ) : null}
            </div>
          ) : searchType === 'usuarios' && (hasSearched || searchQuery.trim()) ? (
            <div className="search-results-section">
              <div className="nexus-section-header">
                <h3 className="nexus-section-title">
                  {searchQuery.trim() ? `Resultados para "${searchQuery}"` : 'Resultados de búsqueda'}
                </h3>
              </div>
              
              {loadingSearch ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p className="loading-text">Buscando usuarios...</p>
                </div>
              ) : errorSearch ? (
                <div className="error-state">
                  <p className="error-text">Error al buscar usuarios</p>
                  <p className="error-subtext">{errorSearch}</p>
                </div>
              ) : userResults.length > 0 ? (
                <div className="users-grid">
                  {userResults.map((user) => (
                    <div key={user.id} className="user-card-wrapper">
                      <UserCard 
                        user={user}
                        onClick={() => {
                          navigate(`/usuarios/${user.id}/perfil`);
                          onClose();
                        }}
                        showLink={false}
                      />
                    </div>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="empty-state">
                  <p className="empty-text">No se encontraron usuarios</p>
                  <p className="empty-subtext">Intenta con otros términos de búsqueda</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="nexus-content-grid">
              {/* Búsquedas recientes */}
              <div className="nexus-recent-section">
                <div className="nexus-section-header">
                  <h3 className="nexus-section-title">Búsquedas recientes</h3>
                  {recentSearches.length > 0 && (
                    <button 
                      className="nexus-clear-button"
                      onClick={clearAllRecentSearches}
                    >
                      Limpiar todo
                    </button>
                  )}
                </div>
                <div className="nexus-recent-list">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearch(search)}
                        className="nexus-recent-item"
                      >
                        <svg className="nexus-search-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="nexus-recent-text">{search}</span>
                        <button 
                          className="nexus-remove-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(search);
                          }}
                        >
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </button>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p className="empty-text">Sin búsquedas recientes</p>
                      <p className="empty-subtext">Tu historial de búsquedas aparecerá aquí</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Mis juegos */}
              <div className="nexus-games-section">
                <div className="nexus-section-header">
                  <h3 className="nexus-section-title">Mis juegos</h3>
                </div>
                <div className="games-list">
                  {loadingFavorites ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p className="loading-text">Cargando tus juegos...</p>
                    </div>
                  ) : errorFavorites ? (
                    <div className="error-state">
                      <p className="error-text">Error al cargar los juegos</p>
                      <p className="error-subtext">Por favor, intenta refrescar la página</p>
                    </div>
                  ) : favoriteGames.length > 0 ? (
                    favoriteGames.map((game, index) => (
                      <button
                        key={game.id || index}
                        onClick={() => handleFavoriteGameClick(game)}
                        className="game-item"
                      >
                        {game.image ? (
                          <img 
                            src={game.image} 
                            alt={game.name}
                            className="game-image"
                          />
                        ) : (
                          <div className="game-image-placeholder">
                            🎮
                          </div>
                        )}
                        <span className="game-name">{game.name}</span>
                      </button>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p className="empty-text">No tienes juegos favoritos</p>
                      <p className="empty-subtext">{localStorage.getItem('token') ? 'Añade juegos a tus favoritos para verlos aquí' : 'Inicia sesión para ver tus juegos favoritos'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="nexus-modal-footer">
          <div className="nexus-footer-content">
            <div className="nexus-shortcuts">
              <div className="nexus-shortcut">
                <kbd className="nexus-key">Enter</kbd>
                <span>Seleccionar</span>
              </div>
              <div className="nexus-shortcut">
                <kbd className="nexus-key">↑</kbd>
                <kbd className="nexus-key">↓</kbd>
                <span>Navegar</span>
              </div>
              <div className="nexus-shortcut">
                <kbd className="nexus-key">Esc</kbd>
                <span>Cerrar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal; 