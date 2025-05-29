import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import modService from '../../../services/api/modService';
import ModDeleteConfirmationModal from './modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import EditModAdmin from './modalsAdmin/ModAdminModal/EditModAdmin';
import { useNotification } from '../../../context/NotificationContext';
import Pagination from '../../common/Pagination';

const ModsAdmin = () => {
  const { showNotification } = useNotification();
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modToDelete, setModToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [modToEdit, setModToEdit] = useState(null);

  // Cargar mods desde la API
  useEffect(() => {
    const fetchMods = async () => {
      try {
        setLoading(true);
        const response = await modService.getModsWithDetails();
        
        if (response.status === 'success') {
          // Formatear los datos para el panel de admin
          const formattedMods = response.data.map(mod => ({
            id: mod.id,
            nombre: mod.titulo,
            creador: mod.creador?.nome || 'Usuario eliminado',
            juego: mod.juego?.titulo || 'Juego no especificado',
            estado: mod.estado || 'borrador',
            descargas: mod.estadisticas?.total_descargas || mod.total_descargas || 0,
            valoracion: mod.estadisticas?.valoracion_media || mod.val_media || 0,
            fecha_creacion: mod.created_at ? new Date(mod.created_at).toLocaleDateString() : 'N/A',
            titulo: mod.titulo // Guardar el título original para el modal
          }));
          setMods(formattedMods);
        } else {
          throw new Error(response.message || 'Error al cargar los mods');
        }
      } catch (err) {
        console.error('Error al cargar los mods:', err);
        showNotification('Error al cargar los mods', 'error');
        setMods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMods();
  }, [showNotification]);

  const filteredMods = mods.filter(mod => {
    const matchesSearch = mod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.creador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.juego.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'todos' || mod.estado === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Lógica de paginación
  const totalPages = Math.ceil(filteredMods.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMods = filteredMods.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleStatusChange = async (modId, newStatus) => {
    try {
      const response = await modService.changeModStatus(modId, newStatus);
      
      if (response.status === 'success') {
        setMods(prev => prev.map(mod => 
          mod.id === modId ? { ...mod, estado: newStatus } : mod
        ));
        showNotification(`Estado del mod actualizado a "${newStatus}"`, 'success');
      } else {
        throw new Error(response.message || 'Error al actualizar el estado');
      }
    } catch (err) {
      showNotification('Error al cambiar el estado del mod', 'error');
    }
  };

  // Manejar eliminación de mod
  const handleDeleteMod = (mod) => {
    setModToDelete(mod);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!modToDelete) return;
    
    try {
      setDeleting(true);
      const response = await modService.deleteMod(modToDelete.id);
      
      if (response.status === 'success') {
        // Eliminar el mod de la lista local
        setMods(prevMods => prevMods.filter(mod => mod.id !== modToDelete.id));
        showNotification(`Mod "${modToDelete.titulo}" eliminado exitosamente`, 'success');
      } else {
        throw new Error(response.message || 'Error al eliminar el mod');
      }
    } catch (err) {
      showNotification(err.message || 'Error al eliminar el mod', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setModToDelete(null);
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setModToDelete(null);
  };

  // Funciones para edición
  const handleEditMod = (mod) => {
    setModToEdit(mod);
    setShowEditModal(true);
  };

  const handleEditSave = (updatedMod) => {
    // Actualizar el mod en la lista local
    setMods(prevMods => 
      prevMods.map(mod => 
        mod.id === updatedMod.id ? { ...mod, ...updatedMod } : mod
      )
    );
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setModToEdit(null);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'publicado': return 'text-green-400';
      case 'borrador': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (estado) => {
    const colors = {
      publicado: 'bg-green-500',
      borrador: 'bg-yellow-500'
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
    <>
      <div className="space-y-6">
        {/* Header y controles */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-white">Gestión de Mods</h2>
            <p className="text-gray-400 text-sm">Administra y modera los mods del sistema</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-700 text-white px-3 lg:px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 text-sm w-full sm:w-auto"
            >
              <option value="todos">Todos los estados</option>
              <option value="publicado">Publicados</option>
              <option value="borrador">Borradores</option>
            </select>
            
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buscar mods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-white px-3 lg:px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 w-full sm:w-64 text-sm"
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute right-3 top-3 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="bg-gray-700 p-3 lg:p-4 rounded-lg">
            <h3 className="text-gray-300 text-xs lg:text-sm">Total Mods</h3>
            <p className="text-xl lg:text-2xl font-bold text-white">{mods.length}</p>
          </div>
          <div className="bg-gray-700 p-3 lg:p-4 rounded-lg">
            <h3 className="text-gray-300 text-xs lg:text-sm">Publicados</h3>
            <p className="text-xl lg:text-2xl font-bold text-green-400">
              {mods.filter(m => m.estado === 'publicado').length}
            </p>
          </div>
          <div className="bg-gray-700 p-3 lg:p-4 rounded-lg">
            <h3 className="text-gray-300 text-xs lg:text-sm">Borradores</h3>
            <p className="text-xl lg:text-2xl font-bold text-yellow-400">
              {mods.filter(m => m.estado === 'borrador').length}
            </p>
          </div>
        </div>

        {/* Tabla de mods */}
        <div className="bg-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm">Mod</th>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm hidden sm:table-cell">Creador</th>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm hidden md:table-cell">Juego</th>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm">Estado</th>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm hidden lg:table-cell">Descargas</th>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm hidden lg:table-cell">Valoración</th>
                  <th className="px-3 lg:px-6 py-3 text-gray-300 font-medium text-sm w-32 lg:w-40">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {paginatedMods.map((mod) => (
                  <tr key={mod.id} className="hover:bg-gray-600">
                    <td className="px-3 lg:px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                          <span className="text-white font-bold text-xs lg:text-sm">MOD</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium text-sm lg:text-base truncate">{mod.nombre}</div>
                          <div className="text-gray-400 text-xs lg:text-sm">{mod.fecha_creacion}</div>
                          {/* Mostrar info adicional en móvil */}
                          <div className="sm:hidden text-gray-400 text-xs mt-1">
                            <span>{mod.creador}</span>
                            <span className="mx-2">•</span>
                            <span>{mod.juego}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-gray-300 text-sm hidden sm:table-cell">
                      <div className="truncate max-w-[120px]">{mod.creador}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-gray-300 text-sm hidden md:table-cell">
                      <div className="truncate max-w-[100px]">{mod.juego}</div>
                    </td>
                    <td className="px-3 lg:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusBadge(mod.estado)}`}></span>
                        <select
                          value={mod.estado}
                          onChange={(e) => handleStatusChange(mod.id, e.target.value)}
                          className="bg-gray-600 text-white px-2 py-1 rounded text-xs lg:text-sm border border-gray-500 focus:border-purple-500 min-w-0 flex-1 max-w-[100px]"
                        >
                          <option value="borrador">Borrador</option>
                          <option value="publicado">Publicado</option>
                        </select>
                      </div>
                      {/* Mostrar estadísticas en móvil */}
                      <div className="lg:hidden mt-2 flex items-center gap-3 text-xs text-gray-400">
                        <span>{mod.descargas.toLocaleString()} desc.</span>
                        <span className="flex items-center">
                          <span className="text-yellow-400 mr-1">⭐</span>
                          {mod.valoracion && mod.valoracion > 0 ? Number(mod.valoracion).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-gray-300 text-sm hidden lg:table-cell">
                      {mod.descargas.toLocaleString()}
                    </td>
                    <td className="px-3 lg:px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-gray-300 ml-1 text-sm">
                          {mod.valoracion && mod.valoracion > 0 ? Number(mod.valoracion).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 w-32 lg:w-40">
                      <div className="flex items-center justify-start gap-1 lg:gap-2">
                        <button 
                          onClick={() => window.open(`/mods/${mod.id}`, '_blank')}
                          className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full transition-colors duration-200 flex-shrink-0"
                          title="Ver mod"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                        </button>
                        
                        {/* Botón editar responsive */}
                        <button 
                          onClick={() => handleEditMod(mod)}
                          className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full transition-colors duration-200 flex-shrink-0 xl:hidden"
                          title="Editar mod"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                        </button>
                        
                        {/* Botón editar expandido para pantallas muy grandes */}
                        <button 
                          onClick={() => handleEditMod(mod)}
                          className="hidden xl:flex items-center space-x-1 px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50 rounded-md hover:bg-green-500 hover:bg-opacity-30 hover:border-green-400 transition-all duration-200 text-xs font-medium flex-shrink-0"
                        >
                          <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteMod(mod)}
                          className="flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors duration-200 flex-shrink-0"
                          title="Eliminar mod"
                          disabled={deleting && modToDelete?.id === mod.id}
                        >
                          <FontAwesomeIcon 
                            icon={faTrash} 
                            className={`w-3 h-3 ${deleting && modToDelete?.id === mod.id ? 'animate-spin' : ''}`} 
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {paginatedMods.length === 0 && !loading && (
          <div className="text-center py-8 px-4">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No se encontraron mods</h3>
              <p className="text-gray-400 text-sm">
                No hay mods que coincidan con los criterios de búsqueda especificados.
              </p>
              {(searchTerm || filterStatus !== 'todos') && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('todos');
                  }}
                  className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Paginación */}
        {filteredMods.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredMods.length}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      <ModDeleteConfirmationModal
        modTitle={modToDelete?.nombre || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isOpen={showDeleteModal}
      />

      {/* Modal de edición de mod */}
      <EditModAdmin
        mod={modToEdit}
        isOpen={showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </>
  );
};

export default ModsAdmin; 