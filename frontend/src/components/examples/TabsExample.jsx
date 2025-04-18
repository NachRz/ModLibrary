import React from 'react';
import Tabs from '../common/Tabs';

const TabsExample = () => {
  // Componente para simular contenido de juegos
  const GamesList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((game) => (
        <div key={game} className="bg-custom-card rounded-custom p-4 shadow-custom hover:shadow-custom-lg transition-all duration-300 transform hover:scale-105">
          <div className="bg-custom-primary/10 rounded-md h-32 mb-4 flex items-center justify-center">
            <span className="text-custom-primary">Imagen del juego {game}</span>
          </div>
          <h3 className="text-custom-text font-medium">Juego de ejemplo {game}</h3>
          <p className="text-custom-detail text-sm mt-2">Una breve descripción del juego de ejemplo {game}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-custom-secondary">RPG, Aventura</span>
            <span className="text-xs text-custom-detail">4.5 ★</span>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente para simular contenido de mods
  const ModsList = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((mod) => (
        <div key={mod} className="bg-custom-card rounded-custom p-4 border border-custom-detail/10 shadow-custom hover:shadow-custom-lg transition-all duration-300">
          <div className="flex items-start">
            <div className="bg-custom-secondary/10 rounded-md h-20 w-20 flex items-center justify-center">
              <span className="text-custom-secondary text-xs">Mod {mod}</span>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <h3 className="text-custom-text font-medium">Mod de ejemplo {mod}</h3>
                <span className="text-xs text-custom-detail">v1.2.{mod}</span>
              </div>
              <p className="text-custom-detail text-sm mt-2">Este mod añade nuevas funcionalidades al juego base...</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs text-custom-detail mr-4">Descargas: 1.{mod}K</span>
                  <span className="text-xs text-custom-detail">4.{mod} ★</span>
                </div>
                <button className="px-3 py-1 text-xs bg-custom-primary text-custom-text rounded-md hover:bg-custom-primary-hover transition-colors">
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente para simular favoritos
  const FavoritesList = () => (
    <div className="bg-custom-card rounded-custom p-4 shadow-custom">
      <div className="border-b border-custom-detail/10 pb-3 mb-4">
        <h3 className="text-lg font-semibold text-custom-text">Juegos y Mods Favoritos</h3>
        <p className="text-custom-detail text-sm">Una lista de tus juegos y mods favoritos guardados.</p>
      </div>
      
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="p-3 bg-custom-bg rounded-md border border-custom-detail/5 hover:border-custom-detail/20 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-custom-accent/10 h-10 w-10 rounded-md flex items-center justify-center">
                  <span className="text-custom-accent text-xs">F{item}</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-custom-text font-medium">Favorito {item}</h4>
                  <p className="text-custom-detail text-xs">Añadido el 01/0{item}/2023</p>
                </div>
              </div>
              <button className="text-custom-detail hover:text-custom-error transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    {
      label: 'Juegos',
      content: <GamesList />,
    },
    {
      label: 'Mods',
      content: <ModsList />,
    },
    {
      label: 'Favoritos',
      content: <FavoritesList />,
    },
  ];

  const handleTabChange = (index) => {
    console.log(`Cambiando a la pestaña ${index}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-custom-text mb-6">Biblioteca de ModLibrary</h2>
      <div className="bg-custom-bg rounded-custom shadow-custom-lg overflow-hidden">
        <Tabs tabs={tabs} defaultTab={0} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default TabsExample; 