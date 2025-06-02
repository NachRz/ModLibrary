import React, { useState, useEffect } from 'react';
import ModCard from '../../common/Cards/ModCard';
import modService from '../../../services/api/modService';
import { useNotification } from '../../../context/NotificationContext';

const ModsGuardados = () => {
  const [sortOption, setSortOption] = useState('date');
  const [savedMods, setSavedMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchSavedMods = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await modService.getSavedMods();
      if (response.status === 'success') {
        // Formatear los datos para que sean compatibles con ModCard
        setSavedMods(response.data.map(mod => ({
          id: mod.id,
          titulo: mod.titulo,
          imagen: mod.imagen_banner ? `/storage/${mod.imagen_banner}` : '/images/mod-placeholder.jpg',
          juego: mod.juego || { titulo: 'Juego no especificado' },
          categoria: mod.etiquetas?.[0]?.nombre || 'Sin categoría',
          etiquetas: mod.etiquetas || [],
          autor: mod.creador?.nome || 'Anónimo',
          creador_id: mod.creador_id,
          descargas: mod.total_descargas || 0,
          valoracion: mod.valoracion || 0,
          numValoraciones: mod.numValoraciones || 0,
          descripcion: mod.descripcion || '',
          fecha: mod.fecha_creacion || mod.created_at,
          estado: mod.estado || 'publicado',
          edad_recomendada: Number(mod.edad_recomendada || 0),
          popularidad: mod.popularidad || 'baja',
          version: mod.version || '1.0',
          fecha_guardado: mod.pivot?.fecha_guardado || mod.fecha_guardado
        })));
      } else {
        throw new Error(response.message || 'Error al cargar los mods guardados');
      }
    } catch (err) {
      setError(err.message || 'Error al obtener los mods guardados');
      showNotification('Error al cargar los mods guardados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedMods();
  }, []);

  // Ordenar los mods según la opción seleccionada
  const sortedMods = [...savedMods].sort((a, b) => {
    switch (sortOption) {
      case 'date':
        return new Date(b.fecha_guardado || b.fecha) - new Date(a.fecha_guardado || a.fecha);
      case 'rating':
        return (b.valoracion || 0) - (a.valoracion || 0);
      case 'downloads':
        return (b.descargas || 0) - (a.descargas || 0);
      case 'name':
        return a.titulo.localeCompare(b.titulo);
      default:
        return 0;
    }
  });

  // Cuando un mod es desmarcado como guardado, se actualiza automáticamente
  const handleModSavedChanged = (modId, isCurrentlySaved) => {
    if (!isCurrentlySaved) {
      setSavedMods(prevMods => prevMods.filter(mod => mod.id !== modId));
    }
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-custom-text">Mods Guardados</h3>
        <div className="flex items-center space-x-2">
          <label htmlFor="sort-select" className="text-custom-detail text-sm">Ordenar por:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-custom-card border border-custom-detail/20 text-custom-text rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-custom-primary/50"
          >
            <option value="date">Fecha</option>
            <option value="rating">Valoración</option>
            <option value="downloads">Descargas</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-custom-card rounded-lg shadow-custom">
          <span className="text-custom-detail">Cargando mods guardados...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-custom-card rounded-lg shadow-custom">
          <span className="text-custom-error">{error}</span>
        </div>
      ) : savedMods.length === 0 ? (
        <div className="text-center py-12 bg-custom-card rounded-lg shadow-custom">
          <svg className="mx-auto h-12 w-12 text-custom-detail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h4 className="mt-2 text-lg font-medium text-custom-text">No tienes mods guardados</h4>
          <p className="mt-1 text-custom-detail">Cuando guardes mods, aparecerán aquí para facilitar su acceso.</p>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-custom-primary hover:bg-custom-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-primary transition-colors duration-300">
            Explorar mods
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMods.map(mod => (
            <ModCard 
              key={mod.id} 
              mod={mod}
              showSaveButton={true}
              onSavedChange={(isCurrentlySaved) => handleModSavedChanged(mod.id, isCurrentlySaved)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModsGuardados; 