import React, { useState } from 'react';
import ModCard from '../../common/Cards/ModCard';

const ModsGuardados = () => {
  const [sortOption, setSortOption] = useState('date');
  
  // Datos de ejemplo para mods guardados
  const savedMods = [
    {
      id: 1,
      title: 'Better Graphics Overhaul',
      game: 'Skyrim',
      author: 'ModMaster',
      downloads: 15243,
      rating: 4.8,
      category: 'Gráficos',
      image: 'https://via.placeholder.com/150',
      description: 'Mejora todos los gráficos del juego sin impactar el rendimiento.',
      dateAdded: '2023-04-15'
    },
    {
      id: 2,
      title: 'Enhanced Combat System',
      game: 'Fallout 4',
      author: 'CombatPro',
      downloads: 8976,
      rating: 4.5,
      category: 'Jugabilidad',
      image: 'https://via.placeholder.com/150',
      description: 'Un sistema de combate completamente renovado para una experiencia más inmersiva.',
      dateAdded: '2023-04-10'
    },
    {
      id: 3,
      title: 'New Weapons Pack',
      game: 'GTA V',
      author: 'WeaponMaster',
      downloads: 12567,
      rating: 4.7,
      category: 'Armas',
      image: 'https://via.placeholder.com/150',
      description: 'Añade más de 50 armas nuevas al juego, todas personalizables.',
      dateAdded: '2023-03-28'
    },
    {
      id: 4,
      title: 'Ultimate UI Improvement',
      game: 'Witcher 3',
      author: 'UIDesigner',
      downloads: 7865,
      rating: 4.6,
      category: 'Interfaz',
      image: 'https://via.placeholder.com/150',
      description: 'Mejora la interfaz de usuario para una experiencia más limpia y funcional.',
      dateAdded: '2023-03-20'
    },
    {
      id: 5,
      title: 'Realistic Weather System',
      game: 'Red Dead Redemption 2',
      author: 'WeatherPro',
      downloads: 9543,
      rating: 4.9,
      category: 'Inmersión',
      image: 'https://via.placeholder.com/150',
      description: 'Sistema climático realista con ciclos dinámicos y efectos visuales mejorados.',
      dateAdded: '2023-03-15'
    },
    {
      id: 6,
      title: 'Character Enhancement Pack',
      game: 'Mass Effect',
      author: 'CharacterArtist',
      downloads: 6789,
      rating: 4.4,
      category: 'Personajes',
      image: 'https://via.placeholder.com/150',
      description: 'Mejora todos los modelos de personajes para un aspecto más detallado.',
      dateAdded: '2023-03-05'
    }
  ];

  // Ordenar los mods según la opción seleccionada
  const sortedMods = [...savedMods].sort((a, b) => {
    switch (sortOption) {
      case 'date':
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
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

      {savedMods.length === 0 ? (
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
              actions={
                <button className="text-custom-detail hover:text-custom-error transition-colors duration-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ModsGuardados; 