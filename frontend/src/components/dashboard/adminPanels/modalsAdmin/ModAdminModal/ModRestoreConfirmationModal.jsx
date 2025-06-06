import React from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faTimes, faExclamationTriangle, faGamepad } from '@fortawesome/free-solid-svg-icons';

const ModRestoreConfirmationModal = ({
  modTitle,
  onConfirm,
  onCancel,
  isOpen,
  message = "¿Estás seguro de que quieres restaurar este mod?",
  isLoading = false
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-lg w-full mx-auto border border-green-500/50">

        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-green-600/10 to-green-700/10 border-b border-gray-700/50">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/30 rounded-lg">
                <FontAwesomeIcon
                  icon={faUndo}
                  className="text-green-400"
                />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Restaurar Mod
              </h2>
            </div>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5">
          <div className="bg-gradient-to-r from-green-500/20 to-green-600/30 border border-green-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-1 bg-gradient-to-br from-green-400/20 to-green-500/30 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-green-400 text-sm" />
              </div>
              <h3 className="text-green-300 font-bold">Confirmación de Restauración</h3>
            </div>
            <p className="text-green-200 mb-3">
              {message}
            </p>
            <p className="text-green-200 mb-3">
              Mod: <span className="font-bold text-white">"{modTitle}"</span>
            </p>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 p-3 rounded-lg border border-blue-500/30 mt-3">
              <p className="text-blue-200 text-sm flex items-center">
                <FontAwesomeIcon icon={faGamepad} className="mr-2 text-blue-400" />
                El mod será reactivado y volverá a estar disponible para todos los usuarios.
              </p>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-5">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2 ${isLoading
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                }`}
            >
              <FontAwesomeIcon
                icon={faUndo}
                className={`${isLoading ? 'animate-spin' : ''}`}
              />
              <span>{isLoading ? 'Restaurando...' : 'Restaurar Mod'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ModRestoreConfirmationModal; 