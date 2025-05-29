import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSave, 
  faImage, 
  faFile, 
  faUsers, 
  faCalendar,
  faDownload,
  faStar,
  faEye,
  faComments,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useNotification } from '../../../../../context/NotificationContext';
import modService from '../../../../../services/api/modService';

const EditModAdmin = ({ mod, isOpen, onClose, onSave }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    descripcion_corta: '',
    estado: 'borrador',
    edad_recomendada: 0,
    version: '1.0',
    etiquetas: [],
    imagen: '',
    archivo_principal: '',
    categoria_principal: '',
    es_destacado: false,
    permitir_comentarios: true,
    visible_en_busqueda: true
  });

  // Estados para datos adicionales
  const [disponibleEtiquetas, setDisponibleEtiquetas] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_descargas: 0,
    valoracion_media: 0,
    total_valoraciones: 0,
    total_comentarios: 0,
    fecha_creacion: '',
    fecha_actualizacion: ''
  });

  // Cargar datos del mod cuando se abre el modal
  useEffect(() => {
    if (isOpen && mod) {
      setFormData({
        titulo: mod.titulo || '',
        descripcion: mod.descripcion || '',
        descripcion_corta: mod.descripcion_corta || '',
        estado: mod.estado || 'borrador',
        edad_recomendada: mod.edad_recomendada || 0,
        version: mod.version || '1.0',
        etiquetas: mod.etiquetas || [],
        imagen: mod.imagen || '',
        archivo_principal: mod.archivo_principal || '',
        categoria_principal: mod.categoria_principal || '',
        es_destacado: mod.es_destacado || false,
        permitir_comentarios: mod.permitir_comentarios !== false,
        visible_en_busqueda: mod.visible_en_busqueda !== false
      });

      setEstadisticas({
        total_descargas: mod.total_descargas || 0,
        valoracion_media: mod.valoracion_media || 0,
        total_valoraciones: mod.total_valoraciones || 0,
        total_comentarios: mod.total_comentarios || 0,
        fecha_creacion: mod.fecha_creacion || '',
        fecha_actualizacion: mod.fecha_actualizacion || ''
      });

      // Cargar etiquetas disponibles
      cargarEtiquetasDisponibles();
    }
  }, [isOpen, mod]);

  const cargarEtiquetasDisponibles = async () => {
    try {
      const response = await modService.getAvailableTags();
      if (response.status === 'success') {
        setDisponibleEtiquetas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEtiquetaToggle = (etiqueta) => {
    setFormData(prev => {
      const etiquetasActuales = prev.etiquetas || [];
      const yaExiste = etiquetasActuales.some(e => e.id === etiqueta.id);
      
      if (yaExiste) {
        return {
          ...prev,
          etiquetas: etiquetasActuales.filter(e => e.id !== etiqueta.id)
        };
      } else {
        return {
          ...prev,
          etiquetas: [...etiquetasActuales, etiqueta]
        };
      }
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validaciones básicas
      if (!formData.titulo.trim()) {
        showNotification('El título es obligatorio', 'error');
        return;
      }
      
      if (!formData.descripcion.trim()) {
        showNotification('La descripción es obligatoria', 'error');
        return;
      }

      const response = await modService.updateMod(mod.id, formData);
      
      if (response.status === 'success') {
        showNotification('Mod actualizado exitosamente', 'success');
        onSave && onSave(response.data);
        onClose();
      } else {
        throw new Error(response.message || 'Error al actualizar el mod');
      }
    } catch (error) {
      showNotification(error.message || 'Error al actualizar el mod', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTabGeneral = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="Título del mod"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción corta
            </label>
            <input
              type="text"
              name="descripcion_corta"
              value={formData.descripcion_corta}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="Descripción breve del mod"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Versión
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="1.0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Edad recomendada
            </label>
            <select
              name="edad_recomendada"
              value={formData.edad_recomendada}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            >
              <option value={0}>Sin clasificar</option>
              <option value={3}>3+ años</option>
              <option value={7}>7+ años</option>
              <option value={12}>12+ años</option>
              <option value={16}>16+ años</option>
              <option value={18}>18+ años</option>
            </select>
          </div>
        </div>

        {/* Configuraciones */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Configuraciones
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="es_destacado"
                  checked={formData.es_destacado}
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Marcar como destacado</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="permitir_comentarios"
                  checked={formData.permitir_comentarios}
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Permitir comentarios</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="visible_en_busqueda"
                  checked={formData.visible_en_busqueda}
                  onChange={handleInputChange}
                  className="mr-2 bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Visible en búsquedas</span>
              </label>
            </div>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL de imagen
            </label>
            <input
              type="url"
              name="imagen"
              value={formData.imagen}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Vista previa de imagen */}
          {formData.imagen && (
            <div className="mt-2">
              <img
                src={formData.imagen}
                alt="Vista previa"
                className="w-full h-32 object-cover rounded-lg border border-gray-600"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Descripción completa */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descripción completa *
        </label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={6}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
          placeholder="Descripción detallada del mod..."
        />
      </div>
    </div>
  );

  const renderTabEtiquetas = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-white mb-4">Gestión de Etiquetas</h4>
        
        {/* Etiquetas seleccionadas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Etiquetas seleccionadas ({formData.etiquetas?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-gray-700 rounded-lg border border-gray-600">
            {formData.etiquetas?.map(etiqueta => (
              <span
                key={etiqueta.id}
                className="inline-flex items-center px-3 py-1 bg-purple-500 text-white text-sm rounded-full"
              >
                {etiqueta.nombre}
                <button
                  onClick={() => handleEtiquetaToggle(etiqueta)}
                  className="ml-2 text-purple-200 hover:text-white"
                >
                  <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(!formData.etiquetas || formData.etiquetas.length === 0) && (
              <span className="text-gray-400 text-sm">No hay etiquetas seleccionadas</span>
            )}
          </div>
        </div>

        {/* Etiquetas disponibles */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Etiquetas disponibles
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {disponibleEtiquetas.map(etiqueta => {
              const isSelected = formData.etiquetas?.some(e => e.id === etiqueta.id);
              return (
                <button
                  key={etiqueta.id}
                  onClick={() => handleEtiquetaToggle(etiqueta)}
                  className={`text-left p-2 rounded text-sm transition-colors ${
                    isSelected
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {etiqueta.nombre}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabArchivos = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faFile} className="text-6xl text-gray-500 mb-4" />
        <h4 className="text-lg font-medium text-white mb-2">Gestión de Archivos</h4>
        <p className="text-gray-400 mb-4">
          La gestión completa de archivos estará disponible próximamente
        </p>
        <div className="bg-gray-700 rounded-lg p-4 text-left">
          <h5 className="text-white font-medium mb-2">Archivo principal actual:</h5>
          <p className="text-gray-300 text-sm">
            {formData.archivo_principal || 'No especificado'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabEstadisticas = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-white mb-4">Estadísticas del Mod</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faDownload} className="text-blue-400 text-xl" />
            <span className="text-2xl font-bold text-white">{estadisticas.total_descargas}</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Total Descargas</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xl" />
            <span className="text-2xl font-bold text-white">
              {Number(estadisticas.valoracion_media).toFixed(1)}
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Valoración Media</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faUsers} className="text-green-400 text-xl" />
            <span className="text-2xl font-bold text-white">{estadisticas.total_valoraciones}</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Total Valoraciones</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <FontAwesomeIcon icon={faComments} className="text-purple-400 text-xl" />
            <span className="text-2xl font-bold text-white">{estadisticas.total_comentarios}</span>
          </div>
          <p className="text-gray-300 text-sm mt-2">Comentarios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <h5 className="text-white font-medium mb-2">Fecha de Creación</h5>
          <p className="text-gray-300">
            {estadisticas.fecha_creacion ? 
              new Date(estadisticas.fecha_creacion).toLocaleDateString('es-ES') : 
              'No disponible'
            }
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h5 className="text-white font-medium mb-2">Última Actualización</h5>
          <p className="text-gray-300">
            {estadisticas.fecha_actualizacion ? 
              new Date(estadisticas.fecha_actualizacion).toLocaleDateString('es-ES') : 
              'No disponible'
            }
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabAvanzado = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl text-yellow-500 mb-4" />
        <h4 className="text-lg font-medium text-white mb-2">Configuración Avanzada</h4>
        <p className="text-gray-400 mb-4">
          Las opciones avanzadas de moderación y gestión estarán disponibles próximamente
        </p>
        
        <div className="bg-gray-700 rounded-lg p-4 text-left space-y-3">
          <h5 className="text-white font-medium">Características en desarrollo:</h5>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Gestión de versiones múltiples</li>
            <li>• Configuración de permisos específicos</li>
            <li>• Moderación de comentarios</li>
            <li>• Análisis de compatibilidad</li>
            <li>• Programación de publicaciones</li>
          </ul>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">
              Editar Mod: {mod?.titulo || 'Sin título'}
            </h3>
            <p className="text-gray-400 text-sm">
              ID: {mod?.id} | Administración avanzada
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <div className="flex space-x-4 px-6">
            {[
              { id: 'general', label: 'General', icon: faEye },
              { id: 'etiquetas', label: 'Etiquetas', icon: faComments },
              { id: 'archivos', label: 'Archivos', icon: faFile },
              { id: 'estadisticas', label: 'Estadísticas', icon: faStar },
              { id: 'avanzado', label: 'Avanzado', icon: faExclamationTriangle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {activeTab === 'general' && renderTabGeneral()}
          {activeTab === 'etiquetas' && renderTabEtiquetas()}
          {activeTab === 'archivos' && renderTabArchivos()}
          {activeTab === 'estadisticas' && renderTabEstadisticas()}
          {activeTab === 'avanzado' && renderTabAvanzado()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon 
              icon={faSave} 
              className={loading ? 'animate-spin' : ''} 
            />
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModAdmin; 