import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../layout/Footer';
import Tabs from '../common/Tabs';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('recomendados');
  const [timeFilter, setTimeFilter] = useState('semana');
  const [userData, setUserData] = useState({
    username: 'Usuario1',
    modsCreated: 12,
    modsInstalled: 45,
    favorites: 8
  });

  // Datos de ejemplo para mods
  const mods = [
    {
      id: 1,
      title: 'Better Graphics Overhaul',
      game: 'Skyrim',
      author: 'ModMaster',
      downloads: 15243,
      rating: 4.8,
      category: 'Gráficos',
      image: 'https://via.placeholder.com/150',
      description: 'Mejora todos los gráficos del juego sin impactar el rendimiento.'
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
      description: 'Un sistema de combate completamente renovado para una experiencia más inmersiva.'
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
      description: 'Añade más de 50 armas nuevas al juego, todas personalizables.'
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
      description: 'Mejora la interfaz de usuario para una experiencia más limpia y funcional.'
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
      description: 'Sistema climático realista con ciclos dinámicos y efectos visuales mejorados.'
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
      description: 'Mejora todos los modelos de personajes para un aspecto más detallado.'
    }
  ];

  // Categorías populares
  const categories = [
    { id: 1, name: 'Gráficos', count: 1243 },
    { id: 2, name: 'Jugabilidad', count: 987 },
    { id: 3, name: 'Armas', count: 765 },
    { id: 4, name: 'Interfaz', count: 654 },
    { id: 5, name: 'Inmersión', count: 543 },
    { id: 6, name: 'Personajes', count: 432 },
    { id: 7, name: 'Misiones', count: 321 },
    { id: 8, name: 'Audio', count: 210 }
  ];

  // Función para renderizar la pestaña activa
  const renderTabContent = () => {
    switch (activeTab) {
      case 'recomendados':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Mods Recomendados Para Ti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mods.filter((_, index) => index < 3).map(mod => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        );
      case 'tendencias':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Tendencias</h2>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setTimeFilter('dia')}
                  className={`px-4 py-2 rounded-md ${timeFilter === 'dia' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setTimeFilter('semana')}
                  className={`px-4 py-2 rounded-md ${timeFilter === 'semana' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Esta semana
                </button>
                <button
                  onClick={() => setTimeFilter('mes')}
                  className={`px-4 py-2 rounded-md ${timeFilter === 'mes' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Este mes
                </button>
                <button
                  onClick={() => setTimeFilter('año')}
                  className={`px-4 py-2 rounded-md ${timeFilter === 'año' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Este año
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mods.sort((a, b) => b.downloads - a.downloads).map(mod => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        );
      case 'categorias':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Explorar por Categorías</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-gray-600 text-sm">{category.count} mods</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'busqueda':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Búsqueda Avanzada</h2>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar
                  </label>
                  <input
                    type="text"
                    id="search"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nombre del mod, autor..."
                  />
                </div>
                <div>
                  <label htmlFor="game" className="block text-sm font-medium text-gray-700 mb-1">
                    Juego
                  </label>
                  <select
                    id="game"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Todos los juegos</option>
                    <option value="skyrim">Skyrim</option>
                    <option value="fallout4">Fallout 4</option>
                    <option value="gtav">GTA V</option>
                    <option value="witcher3">Witcher 3</option>
                    <option value="rdr2">Red Dead Redemption 2</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    id="category"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name.toLowerCase()}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Autor
                  </label>
                  <input
                    type="text"
                    id="author"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nombre del autor"
                  />
                </div>
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Valoración mínima
                  </label>
                  <select
                    id="rating"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="0">Cualquier valoración</option>
                    <option value="3">3+ estrellas</option>
                    <option value="4">4+ estrellas</option>
                    <option value="4.5">4.5+ estrellas</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de publicación
                  </label>
                  <select
                    id="date"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Cualquier fecha</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                    <option value="year">Último año</option>
                  </select>
                </div>
              </div>
              <button className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Buscar
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mods.map(mod => (
                <ModCard key={mod.id} mod={mod} />
              ))}
            </div>
          </div>
        );
      default:
        return <div>Contenido no disponible</div>;
    }
  };

  // Componente de tarjeta de mod
  const ModCard = ({ mod }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <img src={mod.image} alt={mod.title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg text-gray-900">{mod.title}</h3>
          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
            {mod.category}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Para {mod.game}</p>
        <p className="text-sm text-gray-500 mt-2">{mod.description}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(mod.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-sm text-gray-600">{mod.rating}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span>{mod.downloads.toLocaleString()} descargas</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <span className="text-sm text-gray-600">Por {mod.author}</span>
          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );

  // Componente para el panel de control
  const OverviewPanel = () => (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-custom-primary text-custom-text p-4 rounded-custom shadow-custom">
          <h3 className="text-sm font-medium opacity-80">Mods Creados</h3>
          <p className="text-3xl font-bold mt-2">{userData.modsCreated}</p>
        </div>
        <div className="bg-custom-secondary text-custom-text p-4 rounded-custom shadow-custom">
          <h3 className="text-sm font-medium opacity-80">Mods Instalados</h3>
          <p className="text-3xl font-bold mt-2">{userData.modsInstalled}</p>
        </div>
        <div className="bg-custom-primary-hover text-custom-text p-4 rounded-custom shadow-custom">
          <h3 className="text-sm font-medium opacity-80">Favoritos</h3>
          <p className="text-3xl font-bold mt-2">{userData.favorites}</p>
        </div>
        <div className="bg-custom-card text-custom-text p-4 rounded-custom shadow-custom border border-custom-detail/10">
          <h3 className="text-sm font-medium text-custom-detail">Valoraciones</h3>
          <p className="text-3xl font-bold mt-2 text-custom-secondary">4.8</p>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-custom-card rounded-custom p-4 shadow-custom border border-custom-detail/10">
        <h3 className="text-lg font-semibold text-custom-text mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(item => (
            <div key={item} className="p-3 border-b border-custom-detail/10 last:border-0">
              <div className="flex items-start">
                <div className="bg-custom-primary/20 h-10 w-10 rounded-full flex items-center justify-center text-custom-primary">
                  {item === 1 ? '⬇️' : item === 2 ? '⭐' : '📝'}
                </div>
                <div className="ml-4">
                  <p className="text-custom-text">{
                    item === 1 ? 'Has descargado un nuevo mod' : 
                    item === 2 ? 'Has marcado un mod como favorito' : 
                    'Has comentado en un mod'
                  }</p>
                  <p className="text-custom-detail text-sm">Hace {item} hora{item > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Componente para mis mods
  const MyModsPanel = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-custom-text">Mis Mods</h3>
        <button className="bg-custom-primary hover:bg-custom-primary-hover text-custom-text px-4 py-2 rounded-md transition-colors">
          Crear Nuevo Mod
        </button>
      </div>

      {userData.modsCreated > 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-custom-card rounded-custom p-4 border border-custom-detail/10 shadow-custom">
              <div className="flex justify-between">
                <div>
                  <h4 className="text-custom-text font-medium">Mod de Ejemplo {i+1}</h4>
                  <p className="text-custom-detail text-sm mt-1">Versión 1.{i+1}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-custom-detail hover:text-custom-text transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="text-custom-detail hover:text-custom-error transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center text-custom-detail text-sm space-x-4">
                  <span>Descargas: {(i+1)*124}</span>
                  <span>Valoraciones: {4 + i*0.1}/5</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-custom-detail/10 flex justify-between">
                <button className="text-sm text-custom-secondary hover:text-custom-secondary/80 transition-colors">
                  Ver estadísticas
                </button>
                <button className="text-sm text-custom-secondary hover:text-custom-text transition-colors">
                  Subir actualización
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-custom-card rounded-custom p-6 text-center border border-dashed border-custom-detail/30">
          <p className="text-custom-detail mb-4">Aún no has creado ningún mod</p>
          <button className="bg-custom-primary hover:bg-custom-primary-hover text-custom-text px-4 py-2 rounded-md transition-colors">
            Crear tu primer mod
          </button>
        </div>
      )}
    </div>
  );

  // Componente para mis juegos
  const MyGamesPanel = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-custom-text">Mis Juegos</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar juegos..."
            className="bg-custom-card border border-custom-detail/20 rounded-md px-4 py-2 text-custom-text placeholder-custom-detail/50 focus:outline-none focus:ring-2 focus:ring-custom-primary/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(game => (
          <div key={game} className="bg-custom-card rounded-custom shadow-custom overflow-hidden group">
            <div className="h-32 bg-gradient-to-r from-custom-primary/20 to-custom-secondary/20 flex items-center justify-center">
              <span className="text-custom-detail">Imagen del juego {game}</span>
            </div>
            <div className="p-4">
              <h4 className="text-custom-text font-medium">Juego de Ejemplo {game}</h4>
              <p className="text-custom-detail text-sm mt-1">{5 + game} mods instalados</p>
              <div className="mt-3 pt-3 border-t border-custom-detail/10">
                <button className="w-full bg-custom-primary/10 hover:bg-custom-primary/20 text-custom-primary font-medium py-2 rounded transition-colors">
                  Ver mods instalados
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Componente para configuración
  const SettingsPanel = () => (
    <div className="bg-custom-card rounded-custom p-6 shadow-custom">
      <h3 className="text-lg font-semibold text-custom-text mb-6">Configuración de la cuenta</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-custom-detail mb-2">Nombre de usuario</label>
          <input
            type="text"
            defaultValue={userData.username}
            className="w-full bg-custom-bg border border-custom-detail/20 rounded-md px-4 py-2 text-custom-text focus:outline-none focus:ring-2 focus:ring-custom-primary/50"
          />
        </div>
        
        <div>
          <label className="block text-custom-detail mb-2">Correo electrónico</label>
          <input
            type="email"
            defaultValue="usuario@ejemplo.com"
            className="w-full bg-custom-bg border border-custom-detail/20 rounded-md px-4 py-2 text-custom-text focus:outline-none focus:ring-2 focus:ring-custom-primary/50"
          />
        </div>
        
        <div>
          <label className="block text-custom-detail mb-2">Notificaciones</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-updates"
                defaultChecked
                className="h-4 w-4 text-custom-primary focus:ring-custom-primary border-custom-detail rounded"
              />
              <label htmlFor="notify-updates" className="ml-2 text-custom-text">
                Actualizaciones de mods
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-comments"
                defaultChecked
                className="h-4 w-4 text-custom-primary focus:ring-custom-primary border-custom-detail rounded"
              />
              <label htmlFor="notify-comments" className="ml-2 text-custom-text">
                Comentarios en mis mods
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notify-messages"
                defaultChecked
                className="h-4 w-4 text-custom-primary focus:ring-custom-primary border-custom-detail rounded"
              />
              <label htmlFor="notify-messages" className="ml-2 text-custom-text">
                Mensajes privados
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-custom-detail/10">
          <button className="bg-custom-primary hover:bg-custom-primary-hover text-custom-text px-4 py-2 rounded-md transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      label: 'Panel',
      content: <OverviewPanel />,
    },
    {
      label: 'Mis Mods',
      content: <MyModsPanel />,
    },
    {
      label: 'Mis Juegos',
      content: <MyGamesPanel />,
    },
    {
      label: 'Configuración',
      content: <SettingsPanel />,
    },
  ];

  return (
    <div className="min-h-screen bg-custom-bg">
      {/* Cabecera del dashboard */}
      <header className="bg-custom-card shadow-custom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-custom-text">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-custom-text">{userData.username}</p>
                <p className="text-custom-detail text-sm">Miembro</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-custom-primary flex items-center justify-center text-custom-text">
                {userData.username.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-custom-bg rounded-custom shadow-custom-lg overflow-hidden">
          <Tabs tabs={tabs} defaultTab={0} />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard; 