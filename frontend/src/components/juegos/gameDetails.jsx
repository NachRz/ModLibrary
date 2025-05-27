import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageContainer from '../layout/PageContainer';
import ModCard from '../common/Cards/ModCard';
import gameService from '../../services/api/gameService';
import modService from '../../services/api/modService';
import { useNotification } from '../../context/NotificationContext';
import '../../assets/styles/components/juegos/gameDetails.css';

const GameDetails = () => {
  const { id } = useParams();
  const { showNotification } = useNotification();
  
  // Estados
  const [juego, setJuego] = useState(null);
  const [mods, setMods] = useState([]);
  const [cargandoJuego, setCargandoJuego] = useState(true);
  const [cargandoMods, setCargandoMods] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMods, setFiltroMods] = useState('todos');
  const [ordenMods, setOrdenMods] = useState('populares');

  // Cargar datos del juego
  useEffect(() => {
    const cargarJuego = async () => {
      try {
        setCargandoJuego(true);
        setError(null);
        
        const response = await gameService.getGameById(parseInt(id));
        setJuego(response);
      } catch (err) {
        setError('Error al cargar la información del juego');
        showNotification('Error al cargar el juego', 'error');
        console.error('Error al cargar el juego:', err);
      } finally {
        setCargandoJuego(false);
      }
    };

    if (id) {
      cargarJuego();
    }
  }, [id, showNotification]);

  // Cargar mods del juego
  useEffect(() => {
    const cargarMods = async () => {
      try {
        setCargandoMods(true);
        
        const response = await modService.getModsByGame(juego.id);
        if (response.status === 'success') {
          setMods(response.data.map(mod => ({
            id: mod.id,
            titulo: mod.titulo,
            imagen: mod.imagen || '/images/mod-placeholder.jpg',
            juego: { titulo: mod.juego?.titulo || 'Juego desconocido' },
            categoria: mod.etiquetas?.[0]?.nombre || 'General',
            etiquetas: mod.etiquetas || [],
            autor: mod.creador?.nome || 'Anónimo',
            descargas: mod.estadisticas?.total_descargas || mod.total_descargas || 0,
            valoracion: mod.estadisticas?.valoracion_media || 0,
            numValoraciones: mod.estadisticas?.total_valoraciones || 0,
            descripcion: mod.descripcion || '',
            estado: mod.estado || 'publicado'
          })));
        }
      } catch (err) {
        console.error('Error al cargar los mods:', err);
        // No mostramos error si no hay mods, es normal
        setMods([]);
      } finally {
        setCargandoMods(false);
      }
    };

    if (juego?.id) {
      cargarMods();
    }
  }, [juego]);

  // Filtrar y ordenar mods
  const modsFiltrados = mods
    .filter(mod => {
      if (filtroMods === 'todos') return true;
      return mod.categoria.toLowerCase() === filtroMods.toLowerCase();
    })
    .sort((a, b) => {
      switch (ordenMods) {
        case 'populares':
          return b.descargas - a.descargas;
        case 'valoracion':
          return b.valoracion - a.valoracion;
        case 'recientes':
          return new Date(b.fecha) - new Date(a.fecha);
        case 'alfabetico':
          return a.titulo.localeCompare(b.titulo);
        default:
          return 0;
      }
    });

  // Obtener categorías únicas de los mods
  const categorias = ['todos', ...new Set(mods.map(mod => mod.categoria))];

  // Función para mostrar estrellas según la valoración
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

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

  if (cargandoJuego) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-primary mb-4"></div>
            <p className="text-custom-detail">Cargando información del juego...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !juego) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
              <p>{error || 'Juego no encontrado'}</p>
            </div>
            <Link 
              to="/juegos" 
              className="bg-custom-primary hover:bg-custom-primary-hover text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Volver a juegos
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="min-h-screen bg-custom-bg text-white">
      {/* Header del juego */}
      <div className="relative">
        {/* Imagen de fondo con overlay */}
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `url(${juego.imagen_fondo || juego.background_image})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-custom-bg via-custom-bg/60 to-transparent"></div>
        </div>
        
        {/* Contenido del header */}
        <div className="max-w-7xl mx-auto px-4 relative -mt-40">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Imagen del juego */}
            <div className="flex-shrink-0">
              <img 
                src={juego.imagen_fondo || juego.background_image} 
                alt={juego.titulo || juego.title}
                className="w-48 h-64 object-cover rounded-lg shadow-2xl border-2 border-gray-700"
              />
            </div>
            
            {/* Información del juego */}
            <div className="flex-1 pt-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                {juego.titulo || juego.title}
              </h1>
              
              {/* Estadísticas */}
              <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
                <div className="flex items-center">
                  {renderStars(juego.rating || 0)}
                  <span className="ml-2 text-lg">
                    {juego.rating ? parseFloat(juego.rating).toFixed(1) : '0.0'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>{juego.total_mods || juego.mods_totales || 0} mods</span>
                </div>
                
                {juego.fecha_lanzamiento && (
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(juego.fecha_lanzamiento).getFullYear()}</span>
                  </div>
                )}
              </div>
              
              {/* Descripción */}
              {juego.descripcion && (
                <div className="bg-custom-card/50 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-300 leading-relaxed">
                    {juego.descripcion.length > 400 
                      ? `${juego.descripcion.substring(0, 400)}...` 
                      : juego.descripcion
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de pestañas */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button className="py-4 px-1 border-b-2 border-orange-500 text-orange-500 font-medium">
              <span className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Mods
              </span>
            </button>
            <button className="py-4 px-1 text-gray-400 hover:text-white font-medium">
              Próximamente
            </button>
          </nav>
        </div>
      </div>

      {/* Sección de Mods */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header de Mods con filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="h-6 w-6 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Mods en tendencia
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {modsFiltrados.length} {modsFiltrados.length === 1 ? 'mod encontrado' : 'mods encontrados'}
            </p>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={filtroMods}
              onChange={(e) => setFiltroMods(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria === 'todos' ? 'Todas las categorías' : categoria}
                </option>
              ))}
            </select>
            
            <select 
              value={ordenMods}
              onChange={(e) => setOrdenMods(e.target.value)}
              className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="populares">Más populares</option>
              <option value="valoracion">Mejor valorados</option>
              <option value="recientes">Más recientes</option>
              <option value="alfabetico">Alfabético</option>
            </select>
            
            <button className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2 text-sm hover:bg-gray-700 transition-colors">
              Ver todo
            </button>
          </div>
        </div>

        {/* Grid de Mods */}
        {cargandoMods ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-400">Cargando mods...</p>
          </div>
        ) : modsFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {modsFiltrados.map(mod => (
              <ModCard key={mod.id} mod={mod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <svg className="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No hay mods disponibles</h3>
              <p className="text-gray-400 mb-4">
                {filtroMods === 'todos' 
                  ? 'Aún no hay mods creados para este juego.' 
                  : `No hay mods en la categoría "${filtroMods}".`
                }
              </p>
              {filtroMods !== 'todos' && (
                <button 
                  onClick={() => setFiltroMods('todos')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Ver todos los mods
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sección "Próximamente" */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Próximamente</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Estamos trabajando en nuevas funcionalidades para mejorar tu experiencia con los mods. 
              Pronto podrás disfrutar de recomendaciones personalizadas, estadísticas avanzadas y mucho más.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
