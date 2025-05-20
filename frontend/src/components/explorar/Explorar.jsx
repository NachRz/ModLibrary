import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ModCard from '../common/Cards/ModCard';
import modService from '../../services/api/modService';
import { useNotification } from '../../context/NotificationContext';
import '../../assets/styles/components/explorar/Explorar.css';

const Explorar = () => {
  // Estados
  const [mods, setMods] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filtros, setFiltros] = useState({
    juego: '',
    categoria: '',
    etiquetas: [],
    busqueda: '',
    ordenarPor: 'recientes',
    orden: 'desc'
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingResults, setIsUpdatingResults] = useState(false);
  
  const { showNotification } = useNotification();

  // Cargar mods desde la base de datos
  const cargarMods = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await modService.getModsWithDetails();
      if (response.status === 'success') {
        setMods(response.data.map(mod => ({
          id: mod.id,
          titulo: mod.titulo,
          imagen: mod.imagen || '/images/mod-placeholder.jpg',
          juego: { titulo: mod.juego?.titulo || 'Juego desconocido' },
          categoria: mod.etiquetas?.[0]?.nombre || 'General',
          etiquetas: mod.etiquetas || [],
          autor: mod.creador?.nome || 'Anónimo',
          descargas: mod.estadisticas?.total_descargas || 0,
          valoracion: mod.estadisticas?.valoracion_media || 0,
          numValoraciones: mod.estadisticas?.total_valoraciones || 0,
          descripcion: mod.descripcion || '',
          fecha: mod.fecha_creacion,
          estado: mod.estado || 'publicado'
        })));
      } else {
        throw new Error(response.message || 'Error al cargar los mods');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los mods');
      showNotification('Error al cargar los mods', 'error');
    } finally {
      setCargando(false);
    }
  }, [showNotification]);

  useEffect(() => {
    cargarMods();
  }, [cargarMods]);

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

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFiltros({
      juego: '',
      categoria: '',
      etiquetas: [],
      busqueda: '',
      ordenarPor: 'recientes',
      orden: 'desc'
    });
  };

  // Filtrar y ordenar los mods
  const modsFiltrados = mods
    .filter(mod => {
      if (filtros.busqueda) {
        const searchTerm = filtros.busqueda.toLowerCase();
        return mod.titulo.toLowerCase().includes(searchTerm) ||
               mod.descripcion.toLowerCase().includes(searchTerm) ||
               mod.autor.toLowerCase().includes(searchTerm);
      }
      return true;
    })
    .filter(mod => filtros.juego ? mod.juego.titulo === filtros.juego : true)
    .filter(mod => filtros.categoria ? mod.categoria === filtros.categoria : true)
    .filter(mod => {
      if (filtros.etiquetas.length === 0) return true;
      return mod.etiquetas.some(tag => filtros.etiquetas.includes(tag.nombre));
    })
    .sort((a, b) => {
      const order = filtros.orden === 'desc' ? -1 : 1;
      switch (filtros.ordenarPor) {
        case 'recientes':
          return order * (new Date(b.fecha) - new Date(a.fecha));
        case 'descargas':
          return order * (b.descargas - a.descargas);
        case 'valoracion':
          return order * (b.valoracion - a.valoracion);
        case 'alfabetico':
          return order * a.titulo.localeCompare(b.titulo);
        default:
          return 0;
      }
    });

  // Extraer datos únicos para los filtros
  const juegosUnicos = [...new Set(mods.map(mod => mod.juego.titulo))];
  const categoriasUnicas = [...new Set(mods.map(mod => mod.categoria))];
  const etiquetasUnicas = [...new Set(mods.flatMap(mod => mod.etiquetas.map(tag => tag.nombre)))];

  return (
    <div className="explorar-container">
      {/* Cabecera con título y contador de resultados */}
      <div className="explorar-header">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-custom-text">Explorar Mods</h1>
              <p className={`mt-1 text-custom-detail results-counter ${isUpdatingResults ? 'updating' : ''}`}>
                {modsFiltrados.length} {modsFiltrados.length === 1 ? 'resultado' : 'resultados'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="explorar-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel de filtros */}
          <div className={`lg:w-64 flex-shrink-0 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="filters-panel rounded-lg p-4">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="filter-button text-custom-text hover:text-custom-primary transition-colors lg:hidden"
                >
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                </button>
                <button
                  onClick={handleClearFilters}
                  className="clear-filters-btn text-sm text-custom-primary hover:text-custom-primary-hover transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>

              {/* Búsqueda */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-custom-text mb-2">Búsqueda</h3>
                <input
                  type="text"
                  name="busqueda"
                  value={filtros.busqueda}
                  onChange={handleFiltroChange}
                  placeholder="Buscar mods..."
                  className="filter-input w-full rounded-md px-3 py-2 bg-custom-bg text-custom-text"
                />
              </div>

              {/* Juegos */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-custom-text mb-2">Juego</h3>
                <div className="custom-select">
                  <select
                    name="juego"
                    value={filtros.juego}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todos los juegos</option>
                    {juegosUnicos.map(juego => (
                      <option key={juego} value={juego}>{juego}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-custom-text mb-2">Categoría</h3>
                <div className="custom-select">
                  <select
                    name="categoria"
                    value={filtros.categoria}
                    onChange={handleFiltroChange}
                  >
                    <option value="">Todas las categorías</option>
                    {categoriasUnicas.map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Etiquetas */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-custom-text mb-2">Etiquetas</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {etiquetasUnicas.map(etiqueta => (
                    <label key={etiqueta} className="custom-checkbox block">
                      <input
                        type="checkbox"
                        checked={filtros.etiquetas.includes(etiqueta)}
                        onChange={(e) => {
                          const newEtiquetas = e.target.checked
                            ? [...filtros.etiquetas, etiqueta]
                            : filtros.etiquetas.filter(t => t !== etiqueta);
                          setFiltros(prev => ({ ...prev, etiquetas: newEtiquetas }));
                        }}
                      />
                      <span className="checkmark"></span>
                      <span className="text-sm text-custom-text">{etiqueta}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Barra de ordenamiento */}
            <div className="sort-bar rounded-lg p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="filter-button lg:hidden text-custom-text hover:text-custom-primary transition-colors"
                >
                  {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                </button>
                <div className="flex items-center space-x-4">
                  <div className="custom-select">
                    <select
                      name="ordenarPor"
                      value={filtros.ordenarPor}
                      onChange={handleFiltroChange}
                    >
                      <option value="recientes">Fecha</option>
                      <option value="descargas">Descargas</option>
                      <option value="valoracion">Valoración</option>
                      <option value="alfabetico">Alfabético</option>
                    </select>
                  </div>
                  <div className="custom-select">
                    <select
                      name="orden"
                      value={filtros.orden}
                      onChange={handleFiltroChange}
                    >
                      <option value="desc">Descendente</option>
                      <option value="asc">Ascendente</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado de carga y error */}
            {cargando ? (
              <div className="flex justify-center items-center py-12">
                <div className="loading-spinner h-12 w-12 border-b-2 border-custom-primary rounded-full"></div>
              </div>
            ) : error ? (
              <div className="empty-state">
                <svg className="mx-auto h-12 w-12 text-custom-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-custom-text">Error al cargar los mods</h3>
                <p className="mt-1 text-custom-detail">{error}</p>
                <button 
                  onClick={() => cargarMods()} 
                  className="mt-4 px-4 py-2 bg-custom-primary text-white rounded-md hover:bg-custom-primary-hover transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : (
              <>
                {/* Grid de mods */}
                {modsFiltrados.length > 0 ? (
                  <div className="mods-grid">
                    {modsFiltrados.map((mod) => (
                      <ModCard 
                        key={mod.id}
                        mod={mod}
                        showSaveButton={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg className="mx-auto h-12 w-12 text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-custom-text">No se encontraron mods</h3>
                    <p className="mt-1 text-custom-detail">Prueba a cambiar los filtros de búsqueda</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explorar; 