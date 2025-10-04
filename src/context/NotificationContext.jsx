import { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    
    setNotifications(prev => [
      ...prev, 
      { id, message, type, duration }
    ]);

    // Auto remove the notification after duration
    if (duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove a notification by id
  const removeNotification = useCallback((id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  // Helper methods for different notification types
  const notifySuccess = useCallback((message, duration) => 
    addNotification(message, 'success', duration), [addNotification]);

  const notifyError = useCallback((message, duration) => 
    addNotification(message, 'error', duration), [addNotification]);

  const notifyInfo = useCallback((message, duration) => 
    addNotification(message, 'info', duration), [addNotification]);

  const notifyWarning = useCallback((message, duration) => 
    addNotification(message, 'warning', duration), [addNotification]);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
