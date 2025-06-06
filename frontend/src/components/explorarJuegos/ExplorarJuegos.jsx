import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../layout/PageContainer';
import GameCard from '../common/Cards/GameCard';
import gameService from '../../services/api/gameService';
import genreService from '../../services/api/genreService';
import '../../assets/styles/components/explorarJuegos/ExplorarJuegos.css';

const ExplorarJuegos = () => {
  // Estados
  const [juegos, setJuegos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    busquedaGenero: '',
    generosSeleccionados: [],
    ordenarPor: 'nombre',
    orden: 'asc'
  });
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    resultadosPorPagina: 20,
    totalPaginas: 1
  });
  const [cargando, setCargando] = useState(true);
  const [cargandoGeneros, setCargandoGeneros] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);

  // Cargar géneros disponibles
  const cargarGeneros = useCallback(async () => {
    try {
      setCargandoGeneros(true);
      const generosDisponibles = await genreService.getAllGenres();
      setGeneros(generosDisponibles);
    } catch (err) {
      console.error('Error al cargar géneros:', err);
      // Los géneros de ejemplo ya están incluidos en el servicio
    } finally {
      setCargandoGeneros(false);
    }
  }, []);

  // Cargar juegos desde la base de datos
  const cargarJuegos = useCallback(async (forceRefresh = false) => {
    try {
      setCargando(true);
      setError(null);

      const response = await gameService.getAllGames(forceRefresh);
      setJuegos(response.map(game => ({
        id: game.id,
        titulo: game.titulo,
        title: game.titulo,
        image: game.imagen_fondo,
        background_image: game.imagen_fondo,
        totalMods: game.total_mods,
        mods_totales: game.total_mods,
        rating: game.rating,
        release_date: game.fecha_lanzamiento,
        generos: game.generos || []
      })));
    } catch (err) {
      setError('Error al cargar los juegos');
      console.error('Error al cargar los juegos:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  // Función para refrescar datos
  const handleRefresh = () => {
    cargarJuegos(true);
  };

  useEffect(() => {
    cargarGeneros();
    cargarJuegos(true); // Siempre hacer refresh inicial
  }, [cargarGeneros, cargarJuegos]);

  // Auto-actualizar cuando el usuario vuelve a la pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Solo actualizar si han pasado más de 10 segundos desde la última carga
        const now = Date.now();
        const lastFetch = localStorage.getItem('explorarJuegos_lastFetch');
        if (!lastFetch || now - parseInt(lastFetch) > 10000) {
          cargarJuegos(true);
          localStorage.setItem('explorarJuegos_lastFetch', now.toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Establecer marca de tiempo inicial
    localStorage.setItem('explorarJuegos_lastFetch', Date.now().toString());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cargarJuegos]);

  // Efecto para animar el contador de resultados
  useEffect(() => {
    setIsUpdatingResults(true);
    const timer = setTimeout(() => setIsUpdatingResults(false), 300);
    return () => clearTimeout(timer);
  }, [filtros]);

  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar selección de géneros
  const handleGeneroToggle = (generoId) => {
    setFiltros(prev => ({
      ...prev,
      generosSeleccionados: prev.generosSeleccionados.includes(generoId)
        ? prev.generosSeleccionados.filter(id => id !== generoId)
        : [...prev.generosSeleccionados, generoId]
    }));
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFiltros({
      busqueda: '',
      busquedaGenero: '',
      generosSeleccionados: [],
      ordenarPor: 'nombre',
      orden: 'asc'
    });
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtros.busqueda || filtros.generosSeleccionados.length > 0;

  // Calcular contadores de juegos por género
  const calcularContadorGenero = (generoId) => {
    return juegos.filter(juego => {
      const juegoGeneros = juego.generos || [];
      return juegoGeneros.some(genero => genero.id === generoId);
    }).length;
  };

  // Filtrar géneros por búsqueda
  const generosFiltrados = generos.filter(genero => {
    if (!filtros.busquedaGenero) return true;
    return genero.nombre.toLowerCase().includes(filtros.busquedaGenero.toLowerCase());
  });

  // Filtrar y ordenar los juegos
  const juegosFiltrados = juegos
    .filter(juego => {
      // Filtro por búsqueda
      if (filtros.busqueda) {
        const searchTerm = filtros.busqueda.toLowerCase();
        if (!juego.title.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por géneros
      if (filtros.generosSeleccionados.length > 0) {
        const juegoGeneros = juego.generos || [];
        const hasMatchingGenre = filtros.generosSeleccionados.some(generoId =>
          juegoGeneros.some(genero => genero.id === generoId)
        );
        if (!hasMatchingGenre) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const order = filtros.orden === 'desc' ? -1 : 1;
      switch (filtros.ordenarPor) {
        case 'nombre':
          return order * a.title.localeCompare(b.title);
        case 'descargas':
          return order * ((b.totalMods || 0) - (a.totalMods || 0));
        case 'fecha':
          return order * (new Date(b.release_date) - new Date(a.release_date));
        case 'rating':
          return order * ((b.rating || 0) - (a.rating || 0));
        default:
          return 0;
      }
    });

  // Calcular paginación
  const indiceInicial = (paginacion.paginaActual - 1) * paginacion.resultadosPorPagina;
  const indiceFinal = indiceInicial + paginacion.resultadosPorPagina;
  const juegosEnPagina = juegosFiltrados.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(juegosFiltrados.length / paginacion.resultadosPorPagina);

  useEffect(() => {
    setPaginacion(prev => ({
      ...prev,
      totalPaginas: Math.ceil(juegosFiltrados.length / prev.resultadosPorPagina)
    }));
  }, [juegosFiltrados.length]);

  // Manejar cambio de página
  const handlePaginaChange = (nuevaPagina) => {
    setPaginacion(prev => ({
      ...prev,
      paginaActual: nuevaPagina
    }));
  };

  // Obtener nombre del género por ID
  const obtenerNombreGenero = (generoId) => {
    const genero = generos.find(g => g.id === generoId);
    return genero ? genero.nombre : `Género ${generoId}`;
  };

  return (
    <PageContainer>
      <div className="explorar-container">
        {/* Cabecera con título y contador de resultados */}
        <div className="explorar-header">
          <div className="max-w-[1600px] mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <div>
                  <h1 className="text-3xl font-bold text-custom-text">Explorar Juegos</h1>
                  <p className={`mt-1 text-custom-detail results-counter ${isUpdatingResults ? 'updating' : ''}`}>
                    {juegosFiltrados.length} {juegosFiltrados.length === 1 ? 'resultado' : 'resultados'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="explorar-content max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Panel de filtros */}
            <div className={`lg:w-80 flex-shrink-0 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:hidden'}`}>
              <div className="filters-panel rounded-lg">
                {/* Contenido de filtros */}
                <div className="p-4 space-y-5">
                  {/* Botón de mostrar/ocultar filtros */}
                  {showFilters && (
                    <div className="filter-section">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="filter-button text-sm text-custom-text hover:text-custom-primary transition-colors bg-custom-bg/30 px-4 py-2 rounded-md flex items-center h-9 w-auto"
                      >
                        <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Ocultar filtros
                      </button>
                    </div>
                  )}

                  {/* Buscador de juegos */}
                  <div className="filter-section">
                    <h3 className="text-custom-text font-medium mb-2">Buscar juego</h3>
                    <input
                      type="text"
                      name="busqueda"
                      value={filtros.busqueda}
                      onChange={handleFiltroChange}
                      placeholder="Buscar juego..."
                      className="w-full px-3 py-2 rounded-md bg-custom-bg/30 filter-input text-sm"
                    />
                  </div>

                  {/* Filtro de género */}
                  <div className="filter-section">
                    <div className="game-genre-section">
                      <h3 className="game-genre-title">GAME GENRE</h3>

                      {/* Campo de búsqueda de géneros */}
                      <div className="genre-search-container">
                        <input
                          type="text"
                          name="busquedaGenero"
                          value={filtros.busquedaGenero}
                          onChange={handleFiltroChange}
                          placeholder="Game genre search"
                          className="genre-search-input"
                        />
                      </div>

                      {cargandoGeneros ? (
                        <div className="p-4 bg-custom-bg/20 rounded-md text-center">
                          <div className="loading-spinner w-6 h-6 border-2 border-custom-primary/20 border-t-custom-primary rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-custom-detail">Cargando géneros...</p>
                        </div>
                      ) : (
                        <div className="genre-list">
                          <div className="space-y-1">
                            {generosFiltrados.map(genero => {
                              const contador = calcularContadorGenero(genero.id);
                              return (
                                <label
                                  key={genero.id}
                                  className="genre-item"
                                >
                                  <input
                                    type="checkbox"
                                    checked={filtros.generosSeleccionados.includes(genero.id)}
                                    onChange={() => handleGeneroToggle(genero.id)}
                                    className="genre-checkbox"
                                  />
                                  <span className="genre-name">{genero.nombre}</span>
                                  <span className="genre-count">({contador})</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de limpiar filtros */}
                  {hayFiltrosActivos && (
                    <button
                      onClick={handleClearFilters}
                      className="clear-filters-btn w-full py-2 px-4 mt-4 text-sm font-medium border border-custom-primary/30 rounded-md hover:bg-custom-primary/10 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              {/* Filtros activos */}
              {hayFiltrosActivos && (
                <div className="filtros-activos mb-6">
                  <div className="flex flex-wrap gap-2">
                    {filtros.busqueda && (
                      <div className="filtro-tag">
                        <span className="tipo">Búsqueda:</span>
                        <span>{filtros.busqueda}</span>
                        <span
                          className="remove ml-2 cursor-pointer"
                          onClick={() => setFiltros(prev => ({ ...prev, busqueda: '' }))}
                        >
                          ×
                        </span>
                      </div>
                    )}

                    {filtros.generosSeleccionados.map(generoId => (
                      <div key={generoId} className="filtro-tag">
                        <span className="tipo">Género:</span>
                        <span>{obtenerNombreGenero(generoId)}</span>
                        <span
                          className="remove ml-2 cursor-pointer"
                          onClick={() => handleGeneroToggle(generoId)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de ordenamiento */}
              <div className="sort-bar rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-2">
                  {!showFilters && (
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="filter-button text-sm text-custom-text hover:text-custom-primary transition-colors bg-custom-bg/30 px-4 py-2 rounded-md flex items-center h-9 w-auto"
                    >
                      <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Mostrar filtros
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Ordenamiento */}
                  <div className="custom-select">
                    <select
                      name="ordenarPor"
                      value={filtros.ordenarPor}
                      onChange={handleFiltroChange}
                      className="h-9"
                    >
                      <option value="nombre">Nombre</option>
                      <option value="descargas">Total de mods</option>
                      <option value="fecha">Fecha de lanzamiento</option>
                      <option value="rating">Calificación</option>
                    </select>
                  </div>

                  {/* Orden ascendente/descendente */}
                  <div className="custom-select">
                    <select
                      name="orden"
                      value={filtros.orden}
                      onChange={handleFiltroChange}
                      className="h-9"
                    >
                      <option value="asc">Ascendente</option>
                      <option value="desc">Descendente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contenido principal - Juegos */}
              {error ? (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-medium mt-4">Error al cargar los juegos</h3>
                  <p className="mt-2 text-custom-detail max-w-md mx-auto">
                    {error}. Por favor, intenta de nuevo más tarde.
                  </p>
                  <button
                    className="mt-4 px-6 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white font-medium rounded-md transition-colors"
                    onClick={handleRefresh}
                  >
                    Reintentar
                  </button>
                </div>
              ) : cargando ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <div className="loading-spinner w-12 h-12 border-4 border-custom-primary/20 border-t-custom-primary rounded-full animate-spin"></div>
                </div>
              ) : juegosEnPagina.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl-wide:grid-cols-5 gap-6">
                  {juegosEnPagina.map(juego => (
                    <GameCard
                      key={juego.id}
                      game={{
                        id: juego.id,
                        titulo: juego.titulo,
                        title: juego.title,
                        imagen_fondo: juego.image,
                        background_image: juego.background_image,
                        image: juego.image,
                        totalMods: juego.totalMods,
                        mods_totales: juego.mods_totales,
                        total_mods: juego.totalMods,
                        rating: juego.rating,
                        release_date: juego.release_date,
                        generos: juego.generos
                      }}
                      showFavoriteButton={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mt-4">No se encontraron juegos</h3>
                  <p className="mt-2 text-custom-detail max-w-md mx-auto">
                    No hay resultados que coincidan con tus criterios de búsqueda. Intenta modificar los filtros o buscar algo diferente.
                  </p>
                  <button
                    className="mt-4 px-6 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white font-medium rounded-md transition-colors"
                    onClick={handleClearFilters}
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {/* Paginación */}
              {!cargando && juegosEnPagina.length > 0 && (
                <div className="pagination-container mt-8 mb-8 flex justify-between items-center">
                  <div className="text-sm text-custom-detail">
                    Mostrando <span className="font-medium text-custom-text">{indiceInicial + 1}</span> a{' '}
                    <span className="font-medium text-custom-text">
                      {Math.min(indiceFinal, juegosFiltrados.length)}
                    </span>{' '}
                    de <span className="font-medium text-custom-text">{juegosFiltrados.length}</span> juegos
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePaginaChange(1)}
                      disabled={paginacion.paginaActual === 1}
                      className="pagination-button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handlePaginaChange(paginacion.paginaActual - 1)}
                      disabled={paginacion.paginaActual === 1}
                      className="pagination-button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Mostrar páginas */}
                    <div className="hidden sm:flex space-x-2">
                      {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                        let pageNum;
                        if (totalPaginas <= 5) {
                          pageNum = i + 1;
                        } else if (paginacion.paginaActual <= 3) {
                          pageNum = i + 1;
                        } else if (paginacion.paginaActual >= totalPaginas - 2) {
                          pageNum = totalPaginas - 4 + i;
                        } else {
                          pageNum = paginacion.paginaActual - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePaginaChange(pageNum)}
                            className={`pagination-button ${paginacion.paginaActual === pageNum
                                ? 'bg-custom-primary border-custom-primary text-white'
                                : ''
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePaginaChange(paginacion.paginaActual + 1)}
                      disabled={paginacion.paginaActual === totalPaginas}
                      className="pagination-button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handlePaginaChange(totalPaginas)}
                      disabled={paginacion.paginaActual === totalPaginas}
                      className="pagination-button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ExplorarJuegos;
