import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faTrash, 
  faTimes,
  faUserMinus,
  faShieldAlt,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

export const UserHasModsModal = ({ userName, userHasMods, onConfirm, onSoftDelete, onCancel, isOpen }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-lg w-full mx-auto border border-yellow-500/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-yellow-600/10 to-orange-600/10 border-b border-gray-700/50">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Eliminar Usuario
              </h2>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        
        <div className="p-5">
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/30 border border-yellow-500/50 rounded-xl p-4 mb-6">
            <p className="text-yellow-300 font-medium mb-2">
              Vas a eliminar al usuario <span className="font-bold text-white">"{userName}"</span>
            </p>
            <p className="text-yellow-200 text-sm mb-3">
              {userHasMods 
                ? 'Este usuario ha creado contenido en el sistema. Tienes las siguientes opciones:'
                : 'Elige cómo proceder con la eliminación:'
              }
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/50 rounded-xl p-4">
              <h3 className="text-blue-300 font-bold mb-3 flex items-center">
                <div className="p-1 bg-gradient-to-br from-blue-400/20 to-blue-500/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faUserMinus} className="text-blue-400 text-sm" />
                </div>
                Opción 1: Desactivar Usuario
              </h3>
              <p className="text-blue-200 text-sm mb-3">
                El usuario será desactivado{userHasMods ? ' pero sus mods permanecerán visibles' : ' de forma temporal'} en la aplicación.
              </p>
              <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                <li>Usuario no podrá acceder al sistema</li>
                {userHasMods && <li>Los mods seguirán disponibles para descarga</li>}
                <li>Acción reversible desde el panel de admin</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/30 border border-red-500/50 rounded-xl p-4">
              <h3 className="text-red-300 font-bold mb-3 flex items-center">
                <div className="p-1 bg-gradient-to-br from-red-400/20 to-red-500/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faTrash} className="text-red-400 text-sm" />
                </div>
                Opción 2: Eliminar Usuario
              </h3>
              <p className="text-red-200 text-sm mb-3">
                El usuario será eliminado{userHasMods ? ' pero sus mods permanecerán' : ' completamente'} de la aplicación.
              </p>
              <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
                <li>Eliminación permanente del usuario</li>
                {userHasMods ? (
                  <>
                    <li>Los mods quedarán sin autor visible</li>
                    <li>Se mantienen valoraciones y comentarios</li>
                  </>
                ) : (
                  <li>Se eliminan todos sus datos y relaciones</li>
                )}
                <li>Acción irreversible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-5">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onSoftDelete}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faUserMinus} />
              <span>Desactivar Usuario</span>
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Eliminar Usuario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export const FinalConfirmationModal = ({ userName, userHasMods, onConfirm, onCancel, isOpen }) => {
  const [confirmText, setConfirmText] = useState('');
  const [understood, setUnderstood] = useState(false);
  
  const handleConfirm = () => {
    if (confirmText === 'ELIMINAR USUARIO' && understood) {
      onConfirm();
    }
  };

  const isValid = confirmText === 'ELIMINAR USUARIO' && understood;

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-lg w-full mx-auto border border-red-500/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-red-600/10 to-red-700/10 border-b border-gray-700/50">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-lg">
                <FontAwesomeIcon icon={faTrash} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Confirmación de Eliminación
              </h2>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        
        <div className="p-5">
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1 bg-gradient-to-br from-red-400/20 to-red-500/30 rounded-lg">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 text-sm" />
              </div>
              <h3 className="text-red-300 font-bold">ADVERTENCIA</h3>
            </div>
            <p className="text-red-200 mb-3">
              Eliminar al usuario <span className="font-bold text-white">"{userName}"</span> causará:
            </p>
            <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
              <li>Eliminación PERMANENTE del usuario</li>
              {userHasMods ? (
                <>
                  <li>Los mods quedarán huérfanos (sin autor visible)</li>
                  <li>Se mantienen los mods, valoraciones y comentarios</li>
                </>
              ) : (
                <li>Se eliminarán sus datos personales y relaciones</li>
              )}
              <li>Esta acción NO se puede deshacer</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-4 border border-gray-600/30">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="understand"
                  checked={understood}
                  onChange={(e) => setUnderstood(e.target.checked)}
                  className="mt-1 accent-red-500"
                />
                <label htmlFor="understand" className="text-gray-300 text-sm">
                  Entiendo las consecuencias y acepto la responsabilidad de esta acción irreversible
                </label>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-xl p-4 border border-gray-600/30">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Para confirmar, escribe exactamente: <span className="text-red-400 font-bold">ELIMINAR USUARIO</span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all duration-300"
                placeholder="Escribe: ELIMINAR USUARIO"
              />
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-5">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`px-5 py-2 rounded-lg transition-all duration-300 font-medium flex items-center space-x-2 ${
                isValid 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FontAwesomeIcon icon={faTrash} />
              <span>Eliminar Usuario</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export const PermanentDeleteModal = ({ userName, onDeleteKeepMods, onDeleteWithMods, onCancel, isOpen }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-lg w-full mx-auto border border-red-500/50">
        {/* Header con gradiente mejorado */}
        <div className="bg-gradient-to-r from-red-600/10 to-red-700/10 border-b border-gray-700/50">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-600/30 rounded-lg">
                <FontAwesomeIcon icon={faTrash} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Eliminación Definitiva
              </h2>
            </div>
            <button 
              onClick={onCancel} 
              className="text-gray-400 hover:text-white transition-colors text-xl hover:rotate-90 transition-transform duration-300"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        
        <div className="p-5">
          <div className="bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-300 font-medium mb-2">
              El usuario <span className="font-bold text-white">"{userName}"</span> será eliminado definitivamente
            </p>
            <p className="text-red-200 text-sm mb-3">
              Elige cómo proceder:
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/50 rounded-xl p-4">
              <h3 className="text-blue-300 font-bold mb-3 flex items-center">
                <div className="p-1 bg-gradient-to-br from-blue-400/20 to-blue-500/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faShieldAlt} className="text-blue-400 text-sm" />
                </div>
                Opción 1: Eliminar Solo Usuario
              </h3>
              <p className="text-blue-200 text-sm mb-3">
                Solo se eliminará el usuario, sus mods (si los tiene) permanecerán en la aplicación.
              </p>
              <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                <li>Usuario eliminado definitivamente</li>
                <li>Los mods quedarán sin autor visible</li>
                <li>Se mantienen valoraciones y comentarios</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/30 border border-red-500/50 rounded-xl p-4">
              <h3 className="text-red-300 font-bold mb-3 flex items-center">
                <div className="p-1 bg-gradient-to-br from-red-400/20 to-red-500/30 rounded-lg mr-2">
                  <FontAwesomeIcon icon={faDatabase} className="text-red-400 text-sm" />
                </div>
                Opción 2: Eliminar Usuario y Mods
              </h3>
              <p className="text-red-200 text-sm mb-3">
                El usuario y TODOS sus mods (si los tiene) serán eliminados definitivamente.
              </p>
              <ul className="text-red-200 text-sm space-y-1 list-disc list-inside">
                <li>Eliminación completa e irreversible</li>
                <li>Todos los mods del usuario eliminados</li>
                <li>Se perderán valoraciones y comentarios</li>
                <li>Se eliminarán todos los archivos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/50 p-5">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-5 py-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg transition-all duration-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onDeleteKeepMods}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Solo Usuario</span>
            </button>
            <button
              onClick={onDeleteWithMods}
              className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-300 font-medium flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faDatabase} />
              <span>Usuario y Mods</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}; 