import React, { createContext, useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheck } from '@fortawesome/free-solid-svg-icons';

const NotificationsAdminUserDeleteContext = createContext();

export const useAdminUserDeleteNotifications = () => useContext(NotificationsAdminUserDeleteContext);

export const NotificationsAdminUserDeleteProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const NotificationModal = ({ message, type }) => (
    <div className="fixed top-4 right-4 z-50">
      <div className={`rounded-lg p-4 shadow-lg border max-w-sm ${
        type === 'success' 
          ? 'bg-green-800 border-green-600 text-green-200' 
          : type === 'error'
          ? 'bg-red-800 border-red-600 text-red-200'
          : 'bg-blue-800 border-blue-600 text-blue-200'
      }`}>
        <div className="flex items-center space-x-3">
          <FontAwesomeIcon 
            icon={type === 'success' ? faCheck : faExclamationTriangle} 
            className="flex-shrink-0"
          />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    </div>
  );

  return (
    <NotificationsAdminUserDeleteContext.Provider value={{
      showNotification
    }}>
      {children}
      
      {/* Notificaciones */}
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
        />
      )}
    </NotificationsAdminUserDeleteContext.Provider>
  );
}; 