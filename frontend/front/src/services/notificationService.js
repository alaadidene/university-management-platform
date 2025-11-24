import axios from 'axios';

const API_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:3002';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const notificationService = {
  // Récupérer toutes les notifications d'un étudiant
  async getNotifications(etudiantId) {
    try {
      console.log('📬 Récupération notifications pour étudiant:', etudiantId);
      const response = await axios.get(
        `${API_URL}/api/notifications/etudiant/${etudiantId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      throw error;
    }
  },

  // Récupérer les notifications non lues
  async getUnreadNotifications(etudiantId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications/etudiant/${etudiantId}/unread`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération notifications non lues:', error);
      throw error;
    }
  },

  // Récupérer le nombre de notifications non lues
  async getUnreadCount(etudiantId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications/etudiant/${etudiantId}/count`,
        { headers: getAuthHeader() }
      );
      return response.data.count;
    } catch (error) {
      console.error('❌ Erreur récupération count:', error);
      return 0;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur marquage comme lu:', error);
      throw error;
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(etudiantId) {
    try {
      const response = await axios.patch(
        `${API_URL}/api/notifications/etudiant/${etudiantId}/read-all`,
        {},
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Erreur marquage toutes comme lues:', error);
      throw error;
    }
  },
};

export default notificationService;
