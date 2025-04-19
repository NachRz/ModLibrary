import React, { useState } from 'react';
import ModCard from '../../common/Cards/ModCard';

const MisMods = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  
  // Datos de ejemplo para mis mods
  const myMods = [
    {
      id: 1,
      title: 'Better Graphics Overhaul',
      game: 'Skyrim',
      author: 'Usuario1',
      downloads: 15243,
      rating: 4.8,
      category: 'Gráficos',
      image: 'https://via.placeholder.com/150',
      description: 'Mejora todos los gráficos del juego sin impactar el rendimiento.',
      status: 'publicado'
    },
    {
      id: 2,
      title: 'Enhanced Combat System',
      game: 'Fallout 4',
      author: 'Usuario1',
      downloads: 8976,
      rating: 4.5,
      category: 'Jugabilidad',
      image: 'https://via.placeholder.com/150',
      description: 'Un sistema de combate completamente renovado para una experiencia más inmersiva.',
      status: 'publicado'
    },
    {
      id: 3,
      title: 'UI Improvement WIP',
      game: 'Witcher 3',
      author: 'Usuario1',
      downloads: 0,
      rating: 0,
      category: 'Interfaz',
      image: 'https://via.placeholder.com/150',
      description: 'Mejora la interfaz de usuario para una experiencia más limpia y funcional.',
      status: 'borrador'
    }
  ];
  
  const filteredMods = activeFilter === 'todos' 
    ? myMods 
    : myMods.filter(mod => mod.status === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-custom-text">Mis Mods</h3>
        <button className="bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Crear Nuevo Mod
        </button>
      </div>
      
      <div className="bg-custom-card rounded-lg shadow-custom p-4">
        <div className="flex space-x-2 mb-4">
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
        
        {filteredMods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-custom-detail">No tienes mods en esta categoría.</p>
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