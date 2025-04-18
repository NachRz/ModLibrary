import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../layout/Footer';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('recomendados');
  const [timeFilter, setTimeFilter] = useState('semana');

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header/Navbar */}
      <header className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-white">ModLibrary</Link>
            </div>
            <div className="flex items-center">
              <div className="relative mx-4">
                <input
                  type="text"
                  placeholder="Buscar mods..."
                  className="w-64 pl-10 pr-4 py-2 rounded-md border-none focus:ring-2 focus:ring-white"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-indigo-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button className="text-white hover:text-indigo-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <div className="ml-3 relative">
                  <div>
                    <button className="bg-indigo-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
                      <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/150" alt="Avatar del usuario" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('recomendados')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recomendados'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recomendados
            </button>
            <button
              onClick={() => setActiveTab('tendencias')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tendencias'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tendencias
            </button>
            <button
              onClick={() => setActiveTab('categorias')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categorias'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => setActiveTab('busqueda')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'busqueda'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Búsqueda Avanzada
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderTabContent()}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard; 