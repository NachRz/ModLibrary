import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

const ModDeleteConfirmationModal = ({ modTitle, onConfirm, onCancel, isOpen }) => {
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  
  const handleConfirm = () => {
    if (confirmText === 'ELIMINAR MOD' && understood) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setConfirmText('');
    setUnderstood(false);
    onCancel();
  };

  const isValid = confirmText === 'ELIMINAR MOD' && understood;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-auto border border-red-500">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            <h2 className="text-lg font-bold text-white">Eliminar Mod</h2>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400" />
              <h3 className="text-red-400 font-bold">ADVERTENCIA</h3>
            </div>
            <p className="text-red-300 mb-3">
              Estás a punto de eliminar el mod <span className="font-bold text-white">"{modTitle}"</span>. Esta acción causará:
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
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Escribe: ELIMINAR MOD"
              />
            </div>
          </div>
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
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Eliminar Mod</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModDeleteConfirmationModal; 