import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faTrash,
  faTimes,
  faTrashAlt,
  faGamepad,
  faArchive
} from '@fortawesome/free-solid-svg-icons';

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl ${isDangerous ? 'w-full max-w-lg h-full max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] mx-auto flex flex-col overflow-hidden' : 'max-w-lg w-full mx-auto'} border ${isDangerous ? 'border-red-500/50' : 'border-yellow-500/50'}`}>
        {/* Header con gradiente mejorado */}
        <div className={`bg-gradient-to-r ${isDangerous ? 'from-red-600/10 to-red-700/10' : 'from-yellow-600/10 to-orange-600/10'} border-b border-gray-700/50 ${isDangerous ? 'flex-shrink-0' : ''}`}>
          <div className={`flex items-center justify-between ${isDangerous ? 'p-3 sm:p-5' : 'p-5'}`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-gradient-to-br ${isDangerous ? 'from-red-500/20 to-red-600/30' : 'from-yellow-500/20 to-yellow-600/30'} rounded-lg`}>
                <FontAwesomeIcon
                  icon={isDangerous ? faTrashAlt : faArchive}
                  className={`${isDangerous ? 'text-red-400' : 'text-yellow-400'}`}
                />
              </div>
              <h2 className={`${isDangerous ? 'text-lg sm:text-xl' : 'text-xl'} font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
                {isDangerous ? 'Eliminar Definitivamente' : 'Desactivar Mod'}
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className={`text-gray-400 hover:text-white transition-colors ${isDangerous ? 'text-lg sm:text-xl' : 'text-xl'} hover:rotate-90 transition-transform duration-300`}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className={isDangerous ? "flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 min-h-0" : "p-5"}>
          {isDangerous ? (
            // Modal para eliminación permanente (responsivo)
            <>
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 rounded-xl p-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1 bg-gradient-to-br from-red-400/20 to-red-500/30 rounded-lg">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-sm" />
                  </div>
                  <h3 className="text-red-300 font-bold text-sm sm:text-base">ADVERTENCIA CRÍTICA</h3>
                </div>
                <p className="text-red-200 mb-3 text-sm">
                  {message}
                </p>
                <p className="text-red-200 mb-3 text-sm">
                  Mod: <span className="font-bold text-white">"{modTitle}"</span>
                </p>
                <ul className="text-red-200 text-xs sm:text-sm space-y-1 list-disc list-inside">
                  <li>Eliminación PERMANENTE del mod</li>
                  <li>Se eliminarán todas las versiones del mod</li>
                  <li>Se perderán todas las valoraciones y comentarios</li>
                  <li>Se eliminarán todos los archivos asociados</li>
                  <li>Esta acción NO se puede deshacer</li>
                </ul>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-3 sm:p-4 border border-gray-600/30">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="understand"
                      checked={understood}
                      onChange={(e) => setUnderstood(e.target.checked)}
                      className="mt-1 accent-red-500"
                    />
                    <label htmlFor="understand" className="text-gray-300 text-xs sm:text-sm">
                      Entiendo las consecuencias y acepto la responsabilidad de esta acción irreversible
                    </label>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-3 sm:p-4 border border-gray-600/30">
                  <label className="block text-gray-300 text-xs sm:text-sm font-medium mb-2">
                    Para confirmar, escribe exactamente: <span className="text-red-400 font-bold">ELIMINAR MOD</span>
                  </label>
                  <input
                    type="text"
                    value={inputConfirmText}
                    onChange={(e) => setInputConfirmText(e.target.value)}
                    className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300 text-sm"
                    placeholder="Escribe: ELIMINAR MOD"
                  />
                </div>
              </div>
            </>
          ) : (
            // Modal para soft delete (como estaba originalmente)
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 border border-yellow-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-1 bg-gradient-to-br from-yellow-400/20 to-yellow-500/30 rounded-lg">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400 text-sm" />
                </div>
                <h3 className="text-yellow-300 font-bold">Confirmación</h3>
              </div>
              <p className="text-yellow-200 mb-3">
                {message}
              </p>
              <p className="text-yellow-200 mb-3">
                Mod: <span className="font-bold text-white">"{modTitle}"</span>
              </p>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 p-3 rounded-lg border border-blue-500/30 mt-3">
                <p className="text-blue-200 text-sm flex items-center">
                  <FontAwesomeIcon icon={faGamepad} className="mr-2 text-blue-400" />
                  El mod será desactivado pero podrá ser restaurado posteriormente desde la pestaña "Mods Eliminados".
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer mejorado */}
        <div className={`bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 ${isDangerous ? 'p-3 sm:p-5 flex-shrink-0' : 'p-5'}`}>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className={`${isDangerous ? 'px-3 sm:px-5' : 'px-5'} py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium ${isDangerous ? 'text-sm' : ''}`}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`${isDangerous ? 'px-3 sm:px-5' : 'px-5'} py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2 ${isDangerous ? 'text-sm' : ''} ${isValid
                  ? (isDangerous
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                    : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white'
                  )
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                }`}
            >
              <FontAwesomeIcon icon={isDangerous ? faTrashAlt : faArchive} />
              {isDangerous ? (
                <>
                  <span className="hidden sm:inline">{confirmText}</span>
                  <span className="sm:hidden">Eliminar</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ModDeleteConfirmationModal; 