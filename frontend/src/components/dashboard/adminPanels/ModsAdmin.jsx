import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faEdit, faTrash, faUndo, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import modService from '../../../services/api/modService';
import ModDeleteConfirmationModal from './modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import ModRestoreConfirmationModal from './modalsAdmin/ModAdminModal/ModRestoreConfirmationModal';
import EditModAdmin from './modalsAdmin/ModAdminModal/EditModAdmin';
import ModViewModal from './modalsAdmin/ModAdminModal/ModViewModal';
import { useNotification } from '../../../context/NotificationContext';
import Pagination from '../../common/Pagination';
import '../../../assets/styles/components/dashboard/adminPanel/adminTables.css';

const ModsAdmin = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [mods, setMods] = useState([]);
  const [deletedMods, setDeletedMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [activeTab, setActiveTab] = useState('active'); // Nueva pestaña activa
  
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

  // Estados para el modal de vista de mod
  const [showViewModal, setShowViewModal] = useState(false);
  const [modToView, setModToView] = useState(null);

  // Estados para eliminación permanente
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);

  // Estados para el modal de restauración
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [modToRestore, setModToRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Función para cargar todos los datos iniciales
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar ambos tipos de datos en paralelo
      const [modsResponse, deletedModsResponse] = await Promise.all([
        modService.getModsWithDetails(),
        modService.getDeletedMods()
      ]);
      
      // Procesar mods activos
      if (modsResponse.status === 'success') {
        const formattedMods = modsResponse.data.map(mod => ({
          id: mod.id,
          nombre: mod.titulo,
          creador: mod.creador?.nome || 'Usuario eliminado',
          juego: mod.juego?.titulo || 'Juego no especificado',
          estado: mod.estado || 'borrador',
          descargas: mod.estadisticas?.total_descargas || mod.total_descargas || 0,
          valoracion: mod.estadisticas?.valoracion_media || mod.val_media || 0,
          fecha_creacion: mod.created_at ? new Date(mod.created_at).toLocaleDateString() : 'N/A',
          titulo: mod.titulo
        }));
        setMods(formattedMods);
      } else {
        throw new Error(modsResponse.message || 'Error al cargar los mods');
      }
      
      // Procesar mods eliminados
      if (deletedModsResponse.status === 'success') {
        setDeletedMods(deletedModsResponse.data || []);
      } else {
        throw new Error(deletedModsResponse.message || 'Error al cargar mods eliminados');
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      showNotification('Error al cargar datos', 'error');
      setMods([]);
      setDeletedMods([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMods = async () => {
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

  // Cargar mods eliminados
  const loadDeletedMods = async () => {
    try {
      setLoading(true);
      const response = await modService.getDeletedMods();
      
      if (response.status === 'success') {
        setDeletedMods(response.data || []);
      } else {
        throw new Error(response.message || 'Error al cargar mods eliminados');
      }
    } catch (err) {
      console.error('Error al cargar mods eliminados:', err);
      showNotification('Error al cargar mods eliminados', 'error');
      setDeletedMods([]);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar pestaña y cargar datos correspondientes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'active') {
      loadMods();
    } else {
      loadDeletedMods();
    }
  };

  const filteredMods = mods.filter(mod => {
    const matchesSearch = mod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.creador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mod.juego.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'todos' || mod.estado === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Filtrado para mods eliminados
  const filteredDeletedMods = deletedMods.filter(mod =>
    mod.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mod.creador?.nome && mod.creador.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (mod.juego?.titulo && mod.juego.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Lógica de paginación para mods activos
  const totalPagesActive = Math.ceil(filteredMods.length / itemsPerPage);
  const startIndexActive = (currentPage - 1) * itemsPerPage;
  const endIndexActive = startIndexActive + itemsPerPage;
  const paginatedMods = filteredMods.slice(startIndexActive, endIndexActive);

  // Lógica de paginación para mods eliminados
  const totalPagesDeleted = Math.ceil(filteredDeletedMods.length / itemsPerPage);
  const startIndexDeleted = (currentPage - 1) * itemsPerPage;
  const endIndexDeleted = startIndexDeleted + itemsPerPage;
  const paginatedDeletedMods = filteredDeletedMods.slice(startIndexDeleted, endIndexDeleted);

  // Resetear página cuando cambian los filtros o pestañas
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, activeTab]);

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

  // Manejar eliminación de mod (soft delete)
  const handleDeleteMod = (mod) => {
    setModToDelete(mod);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación (soft delete)
  const confirmDelete = async () => {
    if (!modToDelete) return;
    
    try {
      setDeleting(true);
      const response = await modService.softDeleteMod(modToDelete.id);
      
      if (response.status === 'success') {
        // Eliminar el mod de la lista local
        setMods(prevMods => prevMods.filter(mod => mod.id !== modToDelete.id));
        // Añadir el mod a la lista de eliminados para actualizar el contador
        setDeletedMods(prevDeleted => [...prevDeleted, { 
          ...modToDelete, 
          fecha_eliminacion: new Date().toLocaleString() 
        }]);
        showNotification(`Mod "${modToDelete.titulo}" desactivado correctamente (puede ser restaurado)`, 'success');
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

  // Restaurar mod eliminado
  const handleRestoreMod = (mod) => {
    setModToRestore(mod);
    setShowRestoreModal(true);
  };

  // Confirmar restauración
  const confirmRestore = async () => {
    if (!modToRestore) return;
    
    try {
      setRestoring(true);
      const response = await modService.restoreMod(modToRestore.id);
      
      if (response.status === 'success') {
        // Formatear el mod restaurado para la lista de activos
        const formattedMod = {
          id: modToRestore.id,
          nombre: modToRestore.titulo,
          creador: modToRestore.creador?.nome || 'Usuario eliminado',
          juego: modToRestore.juego?.titulo || 'Juego no especificado',
          estado: modToRestore.estado || 'borrador',
          descargas: modToRestore.total_descargas || 0,
          valoracion: modToRestore.val_media || 0,
          fecha_creacion: modToRestore.fecha_creacion || 'N/A',
          titulo: modToRestore.titulo
        };
        setMods(prevMods => [...prevMods, formattedMod]);
        
        setDeletedMods(prev => prev.filter(mod => mod.id !== modToRestore.id));
        showNotification(`Mod "${modToRestore.titulo}" restaurado correctamente`, 'success');
      } else {
        throw new Error(response.message || 'Error al restaurar el mod');
      }
    } catch (err) {
      showNotification(err.message || 'Error al restaurar mod', 'error');
    } finally {
      setRestoring(false);
      setShowRestoreModal(false);
      setModToRestore(null);
    }
  };

  // Cancelar restauración
  const cancelRestore = () => {
    setShowRestoreModal(false);
    setModToRestore(null);
  };

  // Eliminar mod permanentemente
  const handlePermanentDelete = (mod) => {
    setModToDelete(mod);
    setShowPermanentDeleteModal(true);
  };

  const confirmPermanentDelete = async () => {
    if (!modToDelete) return;
    
    try {
      setDeleting(true);
      const response = await modService.forceDeleteMod(modToDelete.id);
      
      if (response.status === 'success') {
        setDeletedMods(prev => prev.filter(mod => mod.id !== modToDelete.id));
        showNotification(`Mod "${modToDelete.titulo}" eliminado definitivamente`, 'success');
      } else {
        throw new Error(response.message || 'Error al eliminar definitivamente');
      }
    } catch (err) {
      showNotification(err.message || 'Error al eliminar definitivamente', 'error');
    } finally {
      setDeleting(false);
      setShowPermanentDeleteModal(false);
      setModToDelete(null);
    }
  };

  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setShowPermanentDeleteModal(false);
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
        mod.id === updatedMod.id ? {
          ...mod, // Mantener los campos existentes
          ...updatedMod, // Sobrescribir con los campos actualizados
          // Asegurar que los campos críticos para la tabla estén presentes
          nombre: updatedMod.titulo || updatedMod.nombre || mod.nombre,
          estado: updatedMod.estado || mod.estado
        } : mod
      )
    );
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setModToEdit(null);
  };

  // Funciones para vista de mod
  const handleViewMod = (mod) => {
    setModToView(mod);
    setShowViewModal(true);
  };

  const handleViewClose = () => {
    setShowViewModal(false);
    setModToView(null);
  };

  const handleEditFromView = (mod) => {
    setShowViewModal(false);
    setModToView(null);
    setModToEdit(mod);
    setShowEditModal(true);
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
            {activeTab === 'active' && (
              <>
                <button
                  onClick={() => navigate('/mods/crear')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Crear Mod</span>
                </button>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 text-white px-3 lg:px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 text-sm w-full sm:w-auto"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="publicado">Publicados</option>
                  <option value="borrador">Borradores</option>
                </select>
              </>
            )}
            
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

        {/* Pestañas */}
        <div className="border-b border-gray-600">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('active')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'active'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Mods Activos ({mods.length})
            </button>
            <button
              onClick={() => handleTabChange('deleted')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'deleted'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              Mods Eliminados ({deletedMods.length})
            </button>
          </nav>
        </div>

        {/* Estadísticas */}
        {activeTab === 'active' && (
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
        )}

        {/* Tabla de mods */}
        <div className="admin-table-container">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-user">Mod</th>
                  <th className="col-email hidden sm:table-cell">Creador</th>
                  <th className="col-name hidden md:table-cell">Juego</th>
                  {activeTab === 'active' && (
                    <th className="col-status">Estado</th>
                  )}
                  {activeTab === 'deleted' && (
                    <th className="col-date hidden lg:table-cell">Fecha Eliminación</th>
                  )}
                  <th className="col-downloads hidden lg:table-cell">Descargas</th>
                  <th className="col-rating hidden lg:table-cell">Valoración</th>
                  <th className="actions-column">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {activeTab === 'active' ? (
                  paginatedMods.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                        No se encontraron mods activos.
                      </td>
                    </tr>
                  ) : (
                    paginatedMods.map((mod) => (
                      <tr key={mod.id}>
                        <td className="col-user">
                          <div className="flex items-center">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                              <span className="text-white font-bold text-xs lg:text-sm">MOD</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-white font-medium text-sm lg:text-base truncate">{mod.nombre}</div>
                              <div className="text-gray-400 text-xs lg:text-sm">{mod.fecha_creacion}</div>
                              <div className="sm:hidden text-gray-400 text-xs mt-1">
                                <span>{mod.creador?.nome || mod.creador?.nombre || 'Usuario'}</span>
                                <span className="mx-2">•</span>
                                <span>{mod.juego?.titulo || mod.juego?.title || mod.juego?.nombre || 'Juego'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="col-email text-cell hidden sm:table-cell">{mod.creador?.nome || mod.creador?.nombre || 'Usuario'}</td>
                        <td className="col-name text-cell hidden md:table-cell">{mod.juego?.titulo || mod.juego?.title || mod.juego?.nombre || 'Juego'}</td>
                        <td className="col-status">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusBadge(mod.estado)}`}></span>
                            <select
                              value={mod.estado}
                              onChange={(e) => handleStatusChange(mod.id, e.target.value)}
                              className="bg-gray-600 text-white px-2 py-1 rounded text-xs border border-gray-500 focus:border-purple-500 w-full max-w-[100px]"
                            >
                              <option value="borrador">Borrador</option>
                              <option value="publicado">Publicado</option>
                            </select>
                          </div>
                          <div className="lg:hidden mt-2 flex items-center gap-3 text-xs text-gray-400">
                            <span>{mod.descargas.toLocaleString()} desc.</span>
                            <span className="flex items-center">
                              <span className="text-yellow-400 mr-1">⭐</span>
                              {mod.valoracion && mod.valoracion > 0 ? Number(mod.valoracion).toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="col-downloads text-cell hidden lg:table-cell">
                          {mod.descargas.toLocaleString()}
                        </td>
                        <td className="col-rating hidden lg:table-cell">
                          <div className="flex items-center">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-gray-300 ml-1 text-sm">
                              {mod.valoracion && mod.valoracion > 0 ? Number(mod.valoracion).toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="actions-column">
                          <div className="action-buttons-container">
                            <button 
                              onClick={() => handleViewMod(mod)}
                              className="action-btn-text view"
                              title="Ver mod"
                            >
                              <FontAwesomeIcon icon={faEye} className="action-btn-icon" />
                              <span className="btn-text-full">Ver</span>
                              <span className="btn-text-short">V</span>
                            </button>
                            
                            <button 
                              onClick={() => handleEditMod(mod)}
                              className="action-btn-text edit"
                              title="Editar mod"
                            >
                              <FontAwesomeIcon icon={faEdit} className="action-btn-icon" />
                              <span className="btn-text-full">Editar</span>
                              <span className="btn-text-short">E</span>
                            </button>
                            
                            <button 
                              onClick={() => handleDeleteMod(mod)}
                              className="action-btn-text delete"
                              title="Eliminar mod"
                              disabled={deleting && modToDelete?.id === mod.id}
                            >
                              <FontAwesomeIcon 
                                icon={faTrash} 
                                className={`action-btn-icon ${deleting && modToDelete?.id === mod.id ? 'animate-spin' : ''}`} 
                              />
                              <span className="btn-text-full">Eliminar</span>
                              <span className="btn-text-short">X</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                ) : (
                  paginatedDeletedMods.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                        No hay mods eliminados.
                      </td>
                    </tr>
                  ) : (
                    paginatedDeletedMods.map((mod) => (
                      <tr key={mod.id}>
                        <td className="col-user">
                          <div className="flex items-center">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg flex items-center justify-center mr-2 lg:mr-3 flex-shrink-0">
                              <span className="text-white font-bold text-xs lg:text-sm">MOD</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-gray-300 font-medium text-sm lg:text-base truncate">{mod.titulo}</div>
                              <div className="text-gray-500 text-xs lg:text-sm">{mod.fecha_creacion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="col-email text-cell hidden sm:table-cell">{mod.creador?.nome || 'Usuario eliminado'}</td>
                        <td className="col-name text-cell hidden md:table-cell">{mod.juego?.titulo || 'N/A'}</td>
                        <td className="col-date text-cell hidden lg:table-cell">{mod.fecha_eliminacion}</td>
                        <td className="col-downloads text-cell hidden lg:table-cell">
                          {mod.total_descargas?.toLocaleString() || 0}
                        </td>
                        <td className="col-rating hidden lg:table-cell">
                          <div className="flex items-center">
                            <span className="text-yellow-600">⭐</span>
                            <span className="text-gray-400 ml-1 text-sm">
                              {mod.val_media && mod.val_media > 0 ? Number(mod.val_media).toFixed(1) : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="actions-column">
                          <div className="action-buttons-container">
                            <button 
                              onClick={() => handleRestoreMod(mod)}
                              className="action-btn-text restore"
                              title="Restaurar mod"
                            >
                              <FontAwesomeIcon icon={faUndo} className="action-btn-icon" />
                              <span className="btn-text-full">Restaurar</span>
                              <span className="btn-text-short">R</span>
                            </button>
                            <button 
                              onClick={() => handlePermanentDelete(mod)}
                              className="action-btn-text delete"
                              title="Eliminar definitivamente"
                            >
                              <FontAwesomeIcon icon={faTrashAlt} className="action-btn-icon" />
                              <span className="btn-text-full">Eliminar</span>
                              <span className="btn-text-short">X</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {((activeTab === 'active' && filteredMods.length > 0) || (activeTab === 'deleted' && filteredDeletedMods.length > 0)) && (
          <Pagination
            currentPage={currentPage}
            totalPages={activeTab === 'active' ? totalPagesActive : totalPagesDeleted}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={activeTab === 'active' ? filteredMods.length : filteredDeletedMods.length}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Modal de confirmación para eliminar (soft delete) */}
      <ModDeleteConfirmationModal
        modTitle={modToDelete?.nombre || modToDelete?.titulo || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isOpen={showDeleteModal}
        message="¿Estás seguro de que quieres desactivar este mod? Podrá ser restaurado posteriormente."
      />

      {/* Modal de confirmación para eliminación permanente */}
      <ModDeleteConfirmationModal
        modTitle={modToDelete?.titulo || ''}
        onConfirm={confirmPermanentDelete}
        onCancel={cancelDelete}
        isOpen={showPermanentDeleteModal}
        message="⚠️ ¿Estás seguro de que quieres eliminar DEFINITIVAMENTE este mod? Esta acción NO se puede deshacer y se eliminarán todos los archivos asociados."
        confirmText="Eliminar Definitivamente"
        isDangerous={true}
      />

      {/* Modal de edición de mod */}
      <EditModAdmin
        mod={modToEdit}
        isOpen={showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />

      {/* Modal de vista de mod */}
      <ModViewModal
        mod={modToView}
        isOpen={showViewModal}
        onClose={handleViewClose}
        onEdit={handleEditFromView}
      />

      {/* Modal de confirmación para restauración */}
      <ModRestoreConfirmationModal
        modTitle={modToRestore?.titulo || ''}
        onConfirm={confirmRestore}
        onCancel={cancelRestore}
        isOpen={showRestoreModal}
        isLoading={restoring}
        message="¿Estás seguro de que quieres restaurar este mod?"
      />
    </>
  );
};

export default ModsAdmin; 