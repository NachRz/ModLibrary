import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

export const UserHasModsModal = ({ userName, userHasMods, onConfirm, onSoftDelete, onCancel, isOpen }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-auto border border-yellow-500">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 text-xl" />
            <h2 className="text-lg font-bold text-white">Eliminar Usuario</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded p-4 mb-6">
            <p className="text-yellow-400 font-medium mb-2">
              Vas a eliminar al usuario <span className="font-bold text-white">"{userName}"</span>
            </p>
            <p className="text-yellow-300 text-sm mb-3">
              {userHasMods 
                ? 'Este usuario ha creado contenido en el sistema. Tienes las siguientes opciones:'
                : 'Elige cómo proceder con la eliminación:'
              }
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded p-4">
              <h3 className="text-blue-400 font-bold mb-2">Opción 1: Desactivar Usuario</h3>
              <p className="text-blue-300 text-sm mb-3">
                El usuario será desactivado{userHasMods ? ' pero sus mods permanecerán visibles' : ' de forma temporal'} en la aplicación.
              </p>
              <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
                <li>Usuario no podrá acceder al sistema</li>
                {userHasMods && <li>Los mods seguirán disponibles para descarga</li>}
                <li>Acción reversible desde el panel de admin</li>
              </ul>
            </div>

            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-4">
              <h3 className="text-red-400 font-bold mb-2">Opción 2: Eliminar Usuario</h3>
              <p className="text-red-300 text-sm mb-3">
                El usuario será eliminado{userHasMods ? ' pero sus mods permanecerán' : ' completamente'} de la aplicación.
              </p>
              <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
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

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSoftDelete}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>Desactivar Usuario</span>
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Eliminar Usuario</span>
          </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-auto border border-red-500">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            <h2 className="text-lg font-bold text-white">Confirmación de Eliminación</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
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
              Eliminar al usuario <span className="font-bold text-white">"{userName}"</span> causará:
            </p>
            <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
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
                Para confirmar, escribe exactamente: <span className="text-red-400 font-bold">ELIMINAR USUARIO</span>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Escribe: ELIMINAR USUARIO"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
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
            <span>Eliminar Usuario</span>
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export const PermanentDeleteModal = ({ userName, onDeleteKeepMods, onDeleteWithMods, onCancel, isOpen }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
      <div className="bg-gray-800 rounded-lg max-w-lg w-full mx-auto border border-red-500">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon icon={faTrash} className="text-red-500 text-xl" />
            <h2 className="text-lg font-bold text-white">Eliminación Definitiva</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-4 mb-6">
            <p className="text-red-400 font-medium mb-2">
              El usuario <span className="font-bold text-white">"{userName}"</span> será eliminado definitivamente
            </p>
            <p className="text-red-300 text-sm mb-3">
              Elige cómo proceder:
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded p-4">
              <h3 className="text-blue-400 font-bold mb-2">Opción 1: Eliminar Solo Usuario</h3>
              <p className="text-blue-300 text-sm mb-3">
                Solo se eliminará el usuario, sus mods (si los tiene) permanecerán en la aplicación.
              </p>
              <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
                <li>Usuario eliminado definitivamente</li>
                <li>Los mods quedarán sin autor visible</li>
                <li>Se mantienen valoraciones y comentarios</li>
              </ul>
            </div>

            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded p-4">
              <h3 className="text-red-400 font-bold mb-2">Opción 2: Eliminar Usuario y Mods</h3>
              <p className="text-red-300 text-sm mb-3">
                El usuario y TODOS sus mods (si los tiene) serán eliminados definitivamente.
              </p>
              <ul className="text-red-300 text-sm space-y-1 list-disc list-inside">
                <li>Eliminación completa e irreversible</li>
                <li>Todos los mods del usuario eliminados</li>
                <li>Se perderán valoraciones y comentarios</li>
                <li>Se eliminarán todos los archivos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onDeleteKeepMods}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Solo Usuario</span>
          </button>
          <button
            onClick={onDeleteWithMods}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Usuario y Mods</span>
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}; 