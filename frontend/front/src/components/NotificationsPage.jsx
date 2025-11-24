import React, { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  // Charger les notifications depuis l'API
  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`http://localhost:3002/api/notifications/etudiant/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`http://localhost:3002/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      loadNotifications(); // Recharger les notifications
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      await fetch(`http://localhost:3002/api/notifications/etudiant/${user.id}/read-all`, {
        method: 'PATCH'
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">Vos alertes et messages importants</p>
        </div>
        {notifications.filter(n => !n.isRead).length > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check size={18} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="mb-4">
            <div className="inline-block p-4 bg-gray-100 rounded-full">
              <Bell className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Aucune notification</h2>
          <p className="text-gray-600">Vous n'avez pas encore reçu de notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                !notification.isRead
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {!notification.isRead && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      notification.type === 'elimination'
                        ? 'bg-red-100 text-red-700'
                        : notification.type === 'avertissement'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {notification.type === 'elimination' && '🚨 Élimination'}
                      {notification.type === 'avertissement' && '⚠️ Avertissement'}
                      {notification.type === 'absence' && '📝 Absence'}
                      {!['elimination', 'avertissement', 'absence'].includes(notification.type) && '📬 Info'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(notification.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {notification.titre}
                  </h3>
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                    {notification.message}
                  </p>
                  {notification.matiereNom && (
                    <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      📚 {notification.matiereNom}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Check size={14} />
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;