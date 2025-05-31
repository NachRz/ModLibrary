import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

const ModDeleteConfirmationModal = ({ 
  modTitle, 
  onConfirm, 
  onCancel, 
  isOpen, 
  message = "¿Estás seguro de que quieres eliminar este mod?",
  confirmText = "Eliminar",
  isDangerous = false 
}) => {
  const [inputConfirmText, setInputConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  
  const handleConfirm = () => {
    if (isDangerous) {
      // Para eliminación permanente, requiere confirmación estricta
      if (inputConfirmText === 'ELIMINAR MOD' && understood) {
        onConfirm();
      }
    } else {
      // Para soft delete, confirmación simple
      onConfirm();
    }
  };

  const handleCancel = () => {
    setInputConfirmText('');
    setUnderstood(false);
    onCancel();
  };

  const isValid = isDangerous ? (inputConfirmText === 'ELIMINAR MOD' && understood) : true;

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
      <div className={`bg-gray-800 rounded-lg max-w-lg w-full mx-auto border ${isDangerous ? 'border-red-500' : 'border-yellow-500'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon 
              icon={isDangerous ? faTrashAlt : faTrash} 
              className={`text-xl ${isDangerous ? 'text-red-500' : 'text-yellow-500'}`} 
            />
            <h2 className="text-lg font-bold text-white">
              {isDangerous ? 'Eliminar Definitivamente' : 'Desactivar Mod'}
            </h2>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-6">
          {isDangerous ? (
            // Modal para eliminación permanente
            <>
              <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-4 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
                  <h3 className="text-red-400 font-bold">ADVERTENCIA CRÍTICA</h3>
                </div>
                <p className="text-red-300 mb-3">
                  {message}
                </p>
                <p className="text-red-300 mb-3">
                  Mod: <span className="font-bold text-white">"{modTitle}"</span>
                </p>
                <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
                  <li>Eliminación PERMANENTE del mod</li>
                  <li>Se eliminarán todas las versiones del mod</li>
                  <li>Se perderán todas las valoraciones y comentarios</li>
                  <li>Se eliminarán todos los archivos asociados</li>
                  <li>Esta acción NO se puede deshacer</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="understand"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="understand" className="text-gray-300 text-sm">
                    Entiendo las consecuencias y acepto la responsabilidad de esta acción irreversible
                  </label>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Para confirmar, escribe exactamente: <span className="text-red-400 font-bold">ELIMINAR MOD</span>
                  </label>
                  <input
                    type="text"
                    value={inputConfirmText}
                    onChange={(e) => setInputConfirmText(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="Escribe: ELIMINAR MOD"
                  />
                </div>
              </div>
            </>
          ) : (
            // Modal para soft delete
            <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded p-4 mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400" />
                <h3 className="text-yellow-400 font-bold">Confirmación</h3>
              </div>
              <p className="text-yellow-100 mb-3">
                {message}
              </p>
              <p className="text-yellow-100">
                Mod: <span className="font-bold text-white">"{modTitle}"</span>
              </p>
              <p className="text-yellow-200 text-sm mt-2">
                El mod será desactivado pero podrá ser restaurado posteriormente desde la pestaña "Mods Eliminados".
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className={`px-4 py-2 rounded transition-colors flex items-center space-x-2 ${
              isValid 
                ? (isDangerous ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-yellow-600 text-white hover:bg-yellow-700')
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={isDangerous ? faTrashAlt : faTrash} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ModDeleteConfirmationModal; 