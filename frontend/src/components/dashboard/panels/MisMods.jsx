import React, { useState, useEffect } from 'react';
import ModCard from '../../common/Cards/ModCard';
import modService from '../../../services/api/modService';

const MisMods = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [myMods, setMyMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Función para cargar los mods del usuario autenticado
  useEffect(() => {
    const fetchMyMods = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await modService.getMyMods();
        
        if (response.status === 'success') {
          // Procesamos y calculamos los datos necesarios
          const formattedMods = response.data.map(mod => {
            // Calculamos el número total de descargas sumando las descargas de todas las versiones
            const totalDescargas = mod.versiones 
              ? mod.versiones.reduce((total, version) => total + (version.descargas || 0), 0)
              : 0;
            
            // Calculamos la valoración media
            let valoracionMedia = 0;
            if (mod.valoraciones && mod.valoraciones.length > 0) {
              valoracionMedia = mod.valoraciones.reduce((sum, val) => sum + val.puntuacion, 0) / mod.valoraciones.length;
            }
            
            // Obtenemos el nombre del juego
            const juegoNombre = mod.juego ? mod.juego.titulo : 'Juego desconocido';
            
            // Formateamos la primera etiqueta para la categoría
            const categoria = mod.etiquetas && mod.etiquetas.length > 0 
              ? mod.etiquetas[0].nombre 
              : 'General';
            
            return {
              id: mod.id,
              titulo: mod.titulo,
              juego: juegoNombre,
              autor: mod.creador?.nome || 'Anónimo',
              descargas: totalDescargas,
              valoracion: valoracionMedia || 0,
              categoria: categoria,
              imagen: mod.imagen || '/images/mod-placeholder.jpg',
              descripcion: mod.descripcion,
              estado: mod.estado || 'publicado',
              // Información adicional
              versiones: mod.versiones || [],
              etiquetas: mod.etiquetas || [],
              url: mod.url,
              fechaCreacion: mod.created_at,
              fechaActualizacion: mod.updated_at
            };
          });
          
          setMyMods(formattedMods);
        } else {
          setError('No se pudieron cargar los mods');
        }
      } catch (err) {
        console.error('Error al cargar los mods:', err);
        setError(err.message || 'Error al cargar los mods');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyMods();
  }, []);
  
  const filteredMods = activeFilter === 'todos' 
    ? myMods 
    : myMods.filter(mod => mod.estado === activeFilter);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-custom-text">Mis Mods</h3>
        <button className="bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center shadow-md hover:shadow-lg">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear Nuevo Mod
        </button>
      </div>
      
      <div className="bg-custom-card rounded-lg shadow-custom p-4">
        <div className="flex space-x-2 mb-4 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-4 py-2 rounded-md transition-colors duration-300 ${
              activeFilter === 'todos' 
                ? 'bg-custom-primary text-white' 
                : 'bg-custom-bg text-custom-detail hover:text-custom-text'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('publicado')}
            className={`px-4 py-2 rounded-md transition-colors duration-300 ${
              activeFilter === 'publicado' 
                ? 'bg-custom-primary text-white' 
                : 'bg-custom-bg text-custom-detail hover:text-custom-text'
            }`}
          >
            Publicados
          </button>
          <button
            onClick={() => setActiveFilter('borrador')}
            className={`px-4 py-2 rounded-md transition-colors duration-300 ${
              activeFilter === 'borrador' 
                ? 'bg-custom-primary text-white' 
                : 'bg-custom-bg text-custom-detail hover:text-custom-text'
            }`}
          >
            Borradores
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-custom-primary"></div>
            <p className="mt-2 text-custom-detail">Cargando tus mods...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm underline hover:text-red-800"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        ) : filteredMods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-custom-detail">No tienes mods en esta categoría.</p>
            {activeFilter !== 'todos' && (
              <button 
                onClick={() => setActiveFilter('todos')} 
                className="mt-2 text-sm text-custom-primary hover:underline"
              >
                Ver todos los mods
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMods.map(mod => (
              <ModCard key={mod.id} mod={mod} isOwner={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisMods; 