import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const NotificationPanel = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // Charger les notifications
  const loadNotifications = async () => {
    if (!user?.id) {
      console.log('⚠️ NotificationPanel: user.id non disponible', user);
      return;
    }
    
    console.log('🔔 NotificationPanel: Chargement notifications pour user.id:', user.id);
    
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(user.id);
      console.log('📬 NotificationPanel: Notifications reçues:', data);
      setNotifications(data);
      
      const count = await notificationService.getUnreadCount(user.id);
      console.log('🔢 NotificationPanel: Nombre non lues:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage et toutes les 30 secondes
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 30 secondes
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fermer si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      loadNotifications();
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'elimination':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'avertissement':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'absence':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'note':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'message':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  console.log('🎨 NotificationPanel render - unreadCount:', unreadCount, 'user:', user?.id);

  return (
    <div className="relative z-50" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell size={22} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck size={14} />
                  Tout lire
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.lu 
                        ? notification.type === 'elimination'
                          ? 'bg-red-50 border-l-4 border-red-600'
                          : notification.type === 'avertissement'
                          ? 'bg-orange-50 border-l-4 border-orange-500'
                          : 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => !notification.lu && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${
                            notification.type === 'elimination'
                              ? 'text-red-700'
                              : notification.type === 'avertissement'
                              ? 'text-orange-700'
                              : !notification.lu 
                              ? 'text-gray-900' 
                              : 'text-gray-700'
                          }`}>
                            {notification.titre}
                          </h4>
                          {!notification.lu && (
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${
                              notification.type === 'elimination'
                                ? 'bg-red-600'
                                : notification.type === 'avertissement'
                                ? 'bg-orange-500'
                                : 'bg-blue-600'
                            }`}></div>
                          )}
                        </div>
                        <p className={`text-sm mt-1 break-words ${
                          notification.type === 'elimination'
                            ? 'text-red-800 font-medium'
                            : notification.type === 'avertissement'
                            ? 'text-orange-700'
                            : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        {notification.matiereNom && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded ${
                              notification.type === 'elimination'
                                ? 'bg-red-100 text-red-700'
                                : notification.type === 'avertissement'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100'
                            }`}>
                              {notification.matiereNom}
                            </span>
                            {notification.date && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {notification.date}
                              </span>
                            )}
                          </div>
                        )}
                        {notification.enseignantNom && (
                          <p className="text-xs text-gray-500 mt-1">
                            Par {notification.enseignantNom}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Optionnel: naviguer vers une page dédiée aux notifications
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
