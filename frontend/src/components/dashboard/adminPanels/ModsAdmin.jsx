import React, { useState, useEffect } from 'react';

const ModsAdmin = () => {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Datos de ejemplo mientras no tengamos la API
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setMods([
        {
          id: 1,
          nombre: 'Texture Pack HD',
          creador: 'admin',
          juego: 'Minecraft',
          estado: 'publicado',
          descargas: 1250,
          valoracion: 4.8,
          fecha_creacion: '2024-01-10',
          reportes: 0
        },
        {
          id: 2,
          nombre: 'Gun Mod Advanced',
          creador: 'usuario1',
          juego: 'GTA V',
          estado: 'revision',
          descargas: 0,
          valoracion: 0,
          fecha_creacion: '2024-02-15',
          reportes: 2
        },
        {
          id: 3,
          nombre: 'Magic Spells Pack',
          creador: 'usuario2',
          juego: 'Skyrim',
          estado: 'borrador',
          descargas: 0,
          valoracion: 0,
          fecha_creacion: '2024-02-20',
          reportes: 0
        },
        {
          id: 4,
          nombre: 'Racing Mod Pro',
          creador: 'usuario1',
          juego: 'GTA V',
          estado: 'suspendido',
          descargas: 830,
          valoracion: 3.2,
          fecha_creacion: '2024-01-28',
          reportes: 5
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMods = mods.filter(mod => {
    const matchesSearch = mod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.creador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.juego.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'todos' || mod.estado === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (modId, newStatus) => {
    setMods(prev => prev.map(mod => 
      mod.id === modId ? { ...mod, estado: newStatus } : mod
    ));
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'publicado': return 'text-green-400';
      case 'revision': return 'text-yellow-400';
      case 'borrador': return 'text-gray-400';
      case 'suspendido': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (estado) => {
    const colors = {
      publicado: 'bg-green-500',
      revision: 'bg-yellow-500',
      borrador: 'bg-gray-500',
      suspendido: 'bg-red-500'
    };
    return colors[estado] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header y controles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Gestión de Mods</h2>
          <p className="text-gray-400">Administra y modera los mods del sistema</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="publicado">Publicados</option>
            <option value="revision">En revisión</option>
            <option value="borrador">Borradores</option>
            <option value="suspendido">Suspendidos</option>
          </select>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar mods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-64"
            />
            <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Total Mods</h3>
          <p className="text-2xl font-bold text-white">{mods.length}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Publicados</h3>
          <p className="text-2xl font-bold text-green-400">
            {mods.filter(m => m.estado === 'publicado').length}
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">En Revisión</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {mods.filter(m => m.estado === 'revision').length}
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Con Reportes</h3>
          <p className="text-2xl font-bold text-red-400">
            {mods.filter(m => m.reportes > 0).length}
          </p>
        </div>
      </div>

      {/* Tabla de mods */}
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-gray-300 font-medium">Mod</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Creador</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Juego</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Estado</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Descargas</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Valoración</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Reportes</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredMods.map((mod) => (
                <tr key={mod.id} className="hover:bg-gray-600">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">MOD</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{mod.nombre}</div>
                        <div className="text-gray-400 text-sm">{mod.fecha_creacion}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{mod.creador}</td>
                  <td className="px-6 py-4 text-gray-300">{mod.juego}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusBadge(mod.estado)}`}></span>
                      <select
                        value={mod.estado}
                        onChange={(e) => handleStatusChange(mod.id, e.target.value)}
                        className="bg-gray-600 text-white px-2 py-1 rounded text-sm border border-gray-500 focus:border-purple-500"
                      >
                        <option value="borrador">Borrador</option>
                        <option value="revision">Revisión</option>
                        <option value="publicado">Publicado</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{mod.descargas.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-gray-300 ml-1">
                        {mod.valoracion > 0 ? mod.valoracion.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {mod.reportes > 0 ? (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        {mod.reportes}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">0</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Ver
                      </button>
                      <button className="text-green-400 hover:text-green-300 text-sm">
                        Editar
                      </button>
                      <button className="text-red-400 hover:text-red-300 text-sm">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMods.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No se encontraron mods con los criterios de búsqueda especificados.</p>
        </div>
      )}
    </div>
  );
};

export default ModsAdmin; 