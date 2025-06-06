import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModCard from '../../common/Cards/ModCard';
import modService from '../../../services/api/modService';
import ModDeleteConfirmationModal from '../adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import ModRestoreConfirmationModal from '../adminPanels/modalsAdmin/ModAdminModal/ModRestoreConfirmationModal';
import EditModAdmin from '../adminPanels/modalsAdmin/ModAdminModal/EditModAdmin';
import { useNotification } from '../../../context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';

const MisMods = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeFilter, setActiveFilter] = useState('todos');
  const [myMods, setMyMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modToDelete, setModToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Estados para el modal de restauración
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [modToRestore, setModToRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);

  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [modToEdit, setModToEdit] = useState(null);

  // Función helper para formatear mensajes sobre juegos y géneros eliminados
  const formatearMensajeEliminacion = (mensajeBase, juegoEliminadoInfo) => {
    if (!juegoEliminadoInfo) return mensajeBase;

    let mensaje = `${mensajeBase} El juego "${juegoEliminadoInfo.titulo}" fue eliminado automáticamente porque no tenía más mods asociados`;

    if (juegoEliminadoInfo.generos_eliminados && juegoEliminadoInfo.generos_eliminados.length > 0) {
      const nombresGeneros = juegoEliminadoInfo.generos_eliminados.map(g => g.nombre).join(', ');
      mensaje += ` y se eliminaron los géneros: ${nombresGeneros}`;
    }

    return mensaje + '.';
  };

  useEffect(() => {
    const fetchMyMods = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener tanto mods activos como eliminados
        const [activeModsResponse, deletedModsResponse] = await Promise.allSettled([
          modService.getMyMods(),
          modService.getMyDeletedMods()
        ]);

        let allMods = [];

        // Procesar mods activos
        if (activeModsResponse.status === 'fulfilled' && activeModsResponse.value.status === 'success') {
          const activeMods = activeModsResponse.value.data.map(mod => ({
            ...formatModData(mod),
            is_deleted: false
          }));
          allMods = [...allMods, ...activeMods];
        }

        // Procesar mods eliminados
        if (deletedModsResponse.status === 'fulfilled' && deletedModsResponse.value.status === 'success') {
          const deletedMods = deletedModsResponse.value.data.map(mod => ({
            ...formatModData(mod),
            is_deleted: true,
            deleted_at: mod.fecha_eliminacion || mod.deleted_at
          }));
          allMods = [...allMods, ...deletedMods];
        }

        setMyMods(allMods);

        // Si no hay mods en absoluto, mostrar mensaje
        if (allMods.length === 0) {
          setError('No tienes mods creados aún');
        }

      } catch (err) {
        console.error('Error al cargar los mods:', err);
        setError(err.message || 'Error al cargar los mods');
      } finally {
        setLoading(false);
      }
    };

    fetchMyMods();
  }, []);

  // Función auxiliar para formatear los datos del mod
  const formatModData = (mod) => ({
    id: mod.id,
    titulo: mod.titulo,
    imagen: mod.imagen_banner ? `http://localhost:8000/storage/${mod.imagen_banner}` : '/images/mod-placeholder.jpg',
    juego: mod.juego || { titulo: 'Juego no especificado' },
    categoria: mod.etiquetas?.[0]?.nombre || 'Sin categoría',
    etiquetas: mod.etiquetas || [],
    autor: mod.creador?.nome || 'Anónimo',
    creador_id: mod.creador_id,
    descargas: mod.estadisticas?.total_descargas || mod.total_descargas || 0,
    valoracion: mod.estadisticas?.valoracion_media || mod.val_media || 0,
    numValoraciones: mod.estadisticas?.total_valoraciones || mod.num_valoraciones || 0,
    descripcion: mod.descripcion || '',
    fecha: mod.fecha_creacion || mod.created_at,
    estado: mod.estado || 'publicado',
    is_deleted: mod.is_deleted || false
  });

  // Manejar la eliminación del mod (soft delete)
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
        // Marcar el mod como eliminado en lugar de quitarlo de la lista
        setMyMods(prevMods =>
          prevMods.map(mod =>
            mod.id === modToDelete.id
              ? { ...mod, is_deleted: true, deleted_at: new Date().toISOString() }
              : mod
          )
        );

        // Mostrar notificación con información sobre juegos y géneros eliminados si aplica
        if (response.juego_eliminado) {
          const mensaje = formatearMensajeEliminacion(`Mod "${modToDelete.titulo}" desactivado correctamente (puede ser restaurado).`, response.juego_eliminado);
          showNotification(mensaje, 'success', 10000);
        } else {
          showNotification(`Mod "${modToDelete.titulo}" desactivado correctamente (puede ser restaurado)`, 'success');
        }
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
        // Marcar el mod como activo
        setMyMods(prevMods =>
          prevMods.map(mod =>
            mod.id === modToRestore.id
              ? { ...mod, is_deleted: false, deleted_at: null }
              : mod
          )
        );
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

  // Cancelar eliminación
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setModToDelete(null);
  };

  // Editar mod
  const handleEditMod = (modIdOrMod) => {
    // Si se pasa un objeto mod, usarlo directamente; si es un ID, buscar el mod
    let mod;
    if (typeof modIdOrMod === 'object') {
      mod = modIdOrMod;
    } else {
      mod = myMods.find(m => m.id === modIdOrMod);
    }

    if (mod) {
      setModToEdit(mod);
      setShowEditModal(true);
    }
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setModToEdit(null);
  };

  // Función para guardar cambios desde el modal de edición
  const handleSaveModFromModal = (updatedMod) => {
    console.log('Mod actualizado desde modal:', updatedMod);

    // Actualizar el mod en la lista local
    setMyMods(prevMods =>
      prevMods.map(mod =>
        mod.id === updatedMod.id ? {
          ...mod, // Mantener los campos existentes
          ...updatedMod, // Sobrescribir con los campos actualizados
          // Asegurar que los campos necesarios estén presentes
          titulo: updatedMod.titulo || updatedMod.nombre || mod.titulo,
          imagen: updatedMod.imagen_banner ? `http://localhost:8000/storage/${updatedMod.imagen_banner}` : mod.imagen,
          etiquetas: updatedMod.etiquetas || mod.etiquetas,
          estado: updatedMod.estado || mod.estado,
          descripcion: updatedMod.descripcion || mod.descripcion,
          fecha_actualizacion: new Date().toISOString()
        } : mod
      )
    );

    // Cerrar el modal
    setShowEditModal(false);
    setModToEdit(null);

    // Mostrar notificación de éxito
    showNotification(`Mod "${updatedMod.titulo || updatedMod.nombre}" actualizado exitosamente`, 'success');
  };

  // Filtrado mejorado para incluir mods eliminados
  const getFilteredMods = () => {
    switch (activeFilter) {
      case 'todos':
        return myMods.filter(mod => !mod.is_deleted);
      case 'publicado':
        return myMods.filter(mod => mod.estado === 'publicado' && !mod.is_deleted);
      case 'borrador':
        return myMods.filter(mod => mod.estado === 'borrador' && !mod.is_deleted);
      case 'eliminados':
        return myMods.filter(mod => mod.is_deleted);
      default:
        return myMods.filter(mod => !mod.is_deleted);
    }
  };

  const filteredMods = getFilteredMods();

  // Componentes para los diferentes estados
  const renderLoading = () => (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-custom-primary"></div>
      <p className="mt-2 text-custom-detail">Cargando tus mods...</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center py-8">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm underline hover:text-red-800"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <p className="text-custom-detail">
        {activeFilter === 'eliminados'
          ? 'No tienes mods eliminados.'
          : 'No tienes mods en esta categoría.'
        }
      </p>
      {activeFilter !== 'todos' && (
        <button
          onClick={() => setActiveFilter('todos')}
          className="mt-2 text-sm text-custom-primary hover:underline"
        >
          Ver todos los mods
        </button>
      )}
    </div>
  );

  const renderModGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMods.map(mod => (
        <div key={mod.id} className={mod.is_deleted ? 'opacity-75' : ''}>
          <ModCard
            mod={mod}
            isOwner={true}
            showSaveButton={false}
            onEdit={!mod.is_deleted ? () => handleEditMod(mod) : undefined}
            onDelete={!mod.is_deleted ? () => handleDeleteMod(mod) : undefined}
            actions={mod.is_deleted ? (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRestoreMod(mod);
                }}
                className="flex items-center justify-center w-9 h-9 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-full transition-colors duration-200 flex-shrink-0"
                title="Restaurar mod"
              >
                <FontAwesomeIcon icon={faUndo} className="w-4 h-4" />
              </button>
            ) : undefined}
            isDeleted={mod.is_deleted}
          />
          {mod.is_deleted && (
            <div className="text-center mt-2 text-sm text-red-400">
              <i className="fas fa-exclamation-triangle mr-1"></i>
              Mod eliminado
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderFilterButtons = () => {
    const buttonClass = (filter) => `px-4 py-2 rounded-md transition-colors duration-300 ${activeFilter === filter
        ? 'bg-custom-primary text-white'
        : 'bg-custom-bg text-custom-detail hover:text-custom-text'
      }`;

    const activeMods = myMods.filter(mod => !mod.is_deleted);
    const deletedMods = myMods.filter(mod => mod.is_deleted);

    return (
      <div className="flex space-x-2 mb-4 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveFilter('todos')} className={buttonClass('todos')}>
          Todos ({activeMods.length})
        </button>
        <button onClick={() => setActiveFilter('publicado')} className={buttonClass('publicado')}>
          Publicados ({activeMods.filter(mod => mod.estado === 'publicado').length})
        </button>
        <button onClick={() => setActiveFilter('borrador')} className={buttonClass('borrador')}>
          Borradores ({activeMods.filter(mod => mod.estado === 'borrador').length})
        </button>
        <button onClick={() => setActiveFilter('eliminados')} className={buttonClass('eliminados')}>
          Eliminados ({deletedMods.length})
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 animate-fadeIn mb-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-custom-text">Mis Mods</h3>
          <button
            onClick={() => navigate('/mods/crear')}
            className="bg-custom-primary hover:bg-custom-primary-hover text-white py-2 px-4 rounded-lg transition-colors duration-300 flex items-center shadow-md hover:shadow-lg"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Nuevo Mod
          </button>
        </div>

        <div className="bg-custom-card rounded-lg shadow-custom p-4">
          {renderFilterButtons()}

          {loading ? renderLoading() :
            error ? renderError() :
              filteredMods.length === 0 ? renderEmptyState() :
                renderModGrid()}
        </div>
      </div>

      {/* Modal de confirmación para eliminar mod */}
      <ModDeleteConfirmationModal
        modTitle={modToDelete?.titulo || ''}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isOpen={showDeleteModal}
        message="¿Estás seguro de que quieres desactivar este mod? Podrá ser restaurado posteriormente."
      />

      {/* Modal de confirmación para restaurar mod */}
      <ModRestoreConfirmationModal
        modTitle={modToRestore?.titulo || ''}
        onConfirm={confirmRestore}
        onCancel={cancelRestore}
        isOpen={showRestoreModal}
        isLoading={restoring}
        message="¿Estás seguro de que quieres restaurar este mod?"
      />

      {/* Modal de edición */}
      {showEditModal && modToEdit && (
        <EditModAdmin
          mod={modToEdit}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveModFromModal}
        />
      )}
    </>
  );
};

export default MisMods; 