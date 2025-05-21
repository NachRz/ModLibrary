import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../layout/PageContainer';
import '../../assets/styles/components/explorarJuegos/ExplorarJuegos.css';

const ExplorarJuegos = () => {
  // Estados
  const [juegos, setJuegos] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    generos: [],
    ordenarPor: 'nombre',
    orden: 'asc'
  });
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    resultadosPorPagina: 20,
    totalPaginas: 1
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);

  // Estado para secciones colapsables
  const [secciones, setSecciones] = useState({
    genero: true
  });

  // Géneros de juegos basados en la imagen
  const generosJuegos = [
    { id: 1, nombre: 'Action', count: 570 },
    { id: 2, nombre: 'Adventure', count: 367 },
    { id: 3, nombre: 'ARPG', count: 150 },
    { id: 4, nombre: 'Dungeon crawl', count: 12 },
    { id: 5, nombre: 'Fighting', count: 112 },
    { id: 6, nombre: 'FPS', count: 294 },
    { id: 7, nombre: 'Hack and Slash', count: 38 },
    { id: 8, nombre: 'Horror', count: 171 },
    { id: 9, nombre: 'Indie', count: 217 },
    { id: 10, nombre: 'Metroidvania', count: 10 },
    { id: 11, nombre: 'MMORPG', count: 42 },
    { id: 12, nombre: 'Music', count: 11 },
    { id: 13, nombre: 'Platformer', count: 74 },
    { id: 14, nombre: 'Puzzle', count: 62 }
  ];

  // Juegos simulados para demo
  const juegosDemo = [
    { id: 1, titulo: 'Skyrim Special Edition', genero: 'ARPG', downloads: 110200, likes: 28000, size: '7.8B' },
    { id: 2, titulo: 'Skyrim', genero: 'ARPG', downloads: 72400, likes: 110, size: '1.9B' },
    { id: 3, titulo: 'Fallout 4', genero: 'ARPG', downloads: 65700, likes: 2200, size: '1.8B' },
    { id: 4, titulo: 'Fallout New Vegas', genero: 'ARPG', downloads: 37100, likes: 1000, size: '779.8M' },
    { id: 5, titulo: 'Cyberpunk 2077', genero: 'Action', downloads: 15200, likes: 1500, size: '686.4M' },
    { id: 6, titulo: 'Stardew Valley', genero: 'Indie', downloads: 22800, likes: 3000, size: '541.5M' },
    { id: 7, titulo: 'Oblivion', genero: 'ARPG', downloads: 32400, likes: 7000, size: '324.7M' },
    { id: 8, titulo: "Baldur's Gate 3", genero: 'ARPG', downloads: 12300, likes: 3500, size: '297.6M' },
    { id: 9, titulo: 'Fallout 3', genero: 'ARPG', downloads: 18700, likes: 60, size: '183.2M' },
    { id: 10, titulo: 'The Witcher 3', genero: 'ARPG', downloads: 7700, likes: 70, size: '169.3M' },
    { id: 11, titulo: 'Mount & Blade II: Bannerlord', genero: 'Action', downloads: 5800, likes: 287, size: '105.4M' },
    { id: 12, titulo: 'Morrowind', genero: 'ARPG', downloads: 13300, likes: 35, size: '85.5M' },
    { id: 13, titulo: 'Monster Hunter: World', genero: 'Action', downloads: 6300, likes: 128, size: '84.2M' },
    { id: 14, titulo: 'Modding Tools', genero: 'Utilities', downloads: 580, likes: 0, size: '82.1M' }
  ];

  // Cargar juegos (simulado)
  const cargarJuegos = useCallback(() => {
    setCargando(true);
    setError(null);
    
    // Simulamos la carga de juegos
    setTimeout(() => {
      setJuegos(juegosDemo);
      setCargando(false);
    }, 800);
  }, []);

  useEffect(() => {
    cargarJuegos();
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

  // Manejar cambios en los géneros
  const handleGeneroChange = (genero) => {
    setFiltros(prev => {
      const nuevosGeneros = prev.generos.includes(genero)
        ? prev.generos.filter(g => g !== genero)
        : [...prev.generos, genero];
      return {
        ...prev,
        generos: nuevosGeneros
      };
    });
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFiltros({
      busqueda: '',
      generos: [],
      ordenarPor: 'nombre',
      orden: 'asc'
    });
  };

  // Remover un género específico
  const removeGenero = (genero) => {
    setFiltros(prev => ({
      ...prev,
      generos: prev.generos.filter(g => g !== genero)
    }));
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos = filtros.busqueda || filtros.generos.length > 0;

  // Función para alternar secciones
  const toggleSeccion = (seccion) => {
    setSecciones(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // Filtrar y ordenar los juegos
  const juegosFiltrados = juegos
    .filter(juego => {
      if (filtros.busqueda) {
        const searchTerm = filtros.busqueda.toLowerCase();
        return juego.titulo.toLowerCase().includes(searchTerm);
      }
      return true;
    })
    .filter(juego => {
      if (filtros.generos.length === 0) return true;
      return filtros.generos.includes(juego.genero);
    })
    .sort((a, b) => {
      const order = filtros.orden === 'desc' ? -1 : 1;
      switch (filtros.ordenarPor) {
        case 'nombre':
          return order * a.titulo.localeCompare(b.titulo);
        case 'descargas':
          return order * (b.downloads - a.downloads);
        case 'mods':
          // Simulamos un contador de mods para cada juego
          const modsA = Math.floor(Math.random() * 100);
          const modsB = Math.floor(Math.random() * 100);
          return order * (modsB - modsA);
        case 'colecciones':
          // Simulamos un contador de colecciones para cada juego
          const colA = Math.floor(Math.random() * 50);
          const colB = Math.floor(Math.random() * 50);
          return order * (colB - colA);
        case 'fecha':
          // Simulamos fechas aleatorias
          return order * (new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)) - 
                         new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)));
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

  return (
    <PageContainer>
      <div className="explorar-container">
        {/* Cabecera con título y contador de resultados */}
        <div className="explorar-header">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
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

        <div className="explorar-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
                    <div className="filter-section-header flex justify-between items-center cursor-pointer" onClick={() => toggleSeccion('genero')}>
                      <h3 className="text-custom-text font-medium">Género de juego</h3>
                      <svg
                        className={`w-5 h-5 text-custom-detail transition-transform ${secciones.genero ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                    
                    {secciones.genero && (
                      <div className="filter-section-content mt-2 space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {generosJuegos.map(genero => (
                          <div key={genero.id} className="flex items-center">
                            <label className="custom-checkbox block w-full">
                              <input
                                type="checkbox"
                                checked={filtros.generos.includes(genero.nombre)}
                                onChange={() => handleGeneroChange(genero.nombre)}
                              />
                              <span className="checkmark"></span>
                              <span className="text-sm text-custom-text">{genero.nombre}</span>
                              <span className="text-xs text-custom-detail ml-1">({genero.count})</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
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
                    
                    {filtros.generos.map(genero => (
                      <div key={genero} className="filtro-tag">
                        <span className="tipo">Género:</span>
                        <span>{genero}</span>
                        <span
                          className="remove ml-2 cursor-pointer"
                          onClick={() => removeGenero(genero)}
                        >
                          ×
                        </span>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleClearFilters}
                      className="filtro-tag bg-custom-primary/20 hover:bg-custom-primary/30"
                    >
                      Limpiar todos
                    </button>
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
                      <option value="descargas">Descargas</option>
                      <option value="mods">Mods</option>
                      <option value="colecciones">Colecciones</option>
                      <option value="fecha">Fecha</option>
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
              {cargando ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <div className="loading-spinner w-12 h-12 border-4 border-custom-primary/20 border-t-custom-primary rounded-full animate-spin"></div>
                </div>
              ) : juegosEnPagina.length > 0 ? (
                <div className="proximamente-content">
                  <div className="vista-proximamente">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <h3>Visualización de juegos en desarrollo</h3>
                    <p>
                      Estamos trabajando en una forma atractiva de mostrar los {juegosFiltrados.length} juegos. 
                      Pronto podrás ver todos tus juegos favoritos aquí.
                    </p>
                    <button
                      className="mt-4 px-6 py-2.5 bg-custom-primary hover:bg-custom-primary-hover text-white font-medium rounded-md transition-colors"
                      onClick={cargarJuegos}
                    >
                      Recargar datos
                    </button>
                  </div>
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
                <div className="pagination-container mt-8 flex justify-between items-center">
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
                            className={`pagination-button ${
                              paginacion.paginaActual === pageNum
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
