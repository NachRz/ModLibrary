import React, { useState, useEffect } from 'react';

const UsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo mientras no tengamos la API
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setUsuarios([
        {
          id: 1,
          nome: 'admin',
          correo: 'admin@modlibrary.com',
          rol: 'admin',
          estado: 'activo',
          fecha_registro: '2024-01-15'
        },
        {
          id: 2,
          nome: 'usuario1',
          correo: 'usuario1@example.com',
          rol: 'usuario',
          estado: 'activo',
          fecha_registro: '2024-02-01'
        },
        {
          id: 3,
          nome: 'usuario2',
          correo: 'usuario2@example.com',
          rol: 'usuario',
          estado: 'suspendido',
          fecha_registro: '2024-02-10'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = (userId, newRole) => {
    setUsuarios(prev => prev.map(user => 
      user.id === userId ? { ...user, rol: newRole } : user
    ));
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsuarios(prev => prev.map(user => 
      user.id === userId ? { ...user, estado: newStatus } : user
    ));
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
      {/* Header y búsqueda */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Gestión de Usuarios</h2>
          <p className="text-gray-400">Administra los usuarios del sistema</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-64"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Total Usuarios</h3>
          <p className="text-2xl font-bold text-white">{usuarios.length}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Activos</h3>
          <p className="text-2xl font-bold text-green-400">
            {usuarios.filter(u => u.estado === 'activo').length}
          </p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-gray-300 text-sm">Administradores</h3>
          <p className="text-2xl font-bold text-purple-400">
            {usuarios.filter(u => u.rol === 'admin').length}
          </p>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-gray-300 font-medium">Usuario</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Correo</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Rol</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Estado</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Registro</th>
                <th className="px-6 py-3 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-600">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-600">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-medium">
                          {usuario.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-medium">{usuario.nome}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{usuario.correo}</td>
                  <td className="px-6 py-4">
                    <select
                      value={usuario.rol}
                      onChange={(e) => handleRoleChange(usuario.id, e.target.value)}
                      className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-purple-500"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={usuario.estado}
                      onChange={(e) => handleStatusChange(usuario.id, e.target.value)}
                      className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:border-purple-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="suspendido">Suspendido</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{usuario.fecha_registro}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Ver
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

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">No se encontraron usuarios con ese criterio de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default UsuariosAdmin; 