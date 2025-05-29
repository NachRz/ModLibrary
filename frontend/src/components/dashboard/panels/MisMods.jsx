import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModCard from '../../common/Cards/ModCard';
import modService from '../../../services/api/modService';
import ModDeleteConfirmationModal from '../adminPanels/modalsAdmin/ModAdminModal/ModDeleteConfirmationModal';
import { useNotification } from '../../../context/NotificationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

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
  
  useEffect(() => {
    const fetchMyMods = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await modService.getMyMods();
        
        if (response.status === 'success') {
          setMyMods(response.data.map(formatModData));
        } else {
          setError('No se pudieron cargar los mods');
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

  // Función para formatear los datos del mod
  const formatModData = (mod) => ({
    id: mod.id,
    titulo: mod.titulo,
    juego: mod.juego?.titulo || 'Juego desconocido',
    autor: mod.creador?.nome || 'Anónimo',
    descargas: mod.total_descargas || 0,
    valoracion: mod.val_media || 0,
    numValoraciones: mod.num_valoraciones || 0,
    categoria: mod.etiquetas?.[0]?.nombre || 'General',
    imagen: mod.imagen || '/images/mod-placeholder.jpg',
    descripcion: mod.descripcion || '',
    estado: mod.estado || 'publicado',
    url: mod.url
  });

  // Manejar la eliminación del mod
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
        setMyMods(prevMods => prevMods.filter(mod => mod.id !== modToDelete.id));
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

  // Editar mod
  const handleEditMod = (modId) => {
    navigate(`/mods/editar/${modId}`);
  };
  
  const filteredMods = activeFilter === 'todos' 
    ? myMods 
    : myMods.filter(mod => mod.estado === activeFilter);

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
      <p className="text-custom-detail">No tienes mods en esta categoría.</p>
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

  // Crear acciones personalizadas para cada mod
  const createModActions = (mod) => (
    <div className="flex items-center space-x-2">
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleEditMod(mod.id);
        }}
        className="flex items-center justify-center w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-full transition-colors duration-200"
        title="Editar mod"
      >
        <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
      </button>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDeleteMod(mod);
        }}
        className="flex items-center justify-center w-8 h-8 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-colors duration-200"
        title="Eliminar mod"
        disabled={deleting && modToDelete?.id === mod.id}
      >
        <FontAwesomeIcon 
          icon={faTrash} 
          className={`w-3 h-3 ${deleting && modToDelete?.id === mod.id ? 'animate-spin' : ''}`} 
        />
      </button>
    </div>
  );

  const renderModGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMods.map(mod => (
        <ModCard 
          key={mod.id} 
          mod={mod} 
          isOwner={true} 
          showSaveButton={false}
          actions={createModActions(mod)}
        />
      ))}
    </div>
  );

  const renderFilterButtons = () => {
    const buttonClass = (filter) => `px-4 py-2 rounded-md transition-colors duration-300 ${
      activeFilter === filter 
        ? 'bg-custom-primary text-white' 
        : 'bg-custom-bg text-custom-detail hover:text-custom-text'
    }`;

    return (
      <div className="flex space-x-2 mb-4 overflow-x-auto hide-scrollbar">
        <button onClick={() => setActiveFilter('todos')} className={buttonClass('todos')}>
          Todos
        </button>
        <button onClick={() => setActiveFilter('publicado')} className={buttonClass('publicado')}>
          Publicados
        </button>
        <button onClick={() => setActiveFilter('borrador')} className={buttonClass('borrador')}>
          Borradores
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
      />
    </>
  );
};

export default MisMods; 