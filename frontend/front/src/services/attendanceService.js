import axios from 'axios';

const API_URL = process.env.REACT_APP_ABSENCE_API_URL || 'http://localhost:3003';

/**
 * Service pour gérer les présences des étudiants
 */
const attendanceService = {
  /**
   * Récupérer la liste des étudiants d'une classe pour une matière
   * @param {number} classeId - ID de la classe
   * @param {number} matiereId - ID de la matière
   * @returns {Promise} Liste des étudiants
   */
  getStudentsByClass: async (classeId, matiereId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/by-class/${classeId}/matiere/${matiereId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
      throw error;
    }
  },

  /**
   * Enregistrer les présences pour un cours
   * @param {Object} attendanceData - Données de présence
   * @returns {Promise} Résultat de l'enregistrement
   */
  saveAttendance: async (attendanceData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/attendance`,
        attendanceData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des présences:', error);
      throw error;
    }
  },

  /**
   * Récupérer l'historique des présences pour un cours
   * @param {number} matiereId - ID de la matière
   * @param {number} classeId - ID de la classe
   * @param {string} dateDebut - Date de début (format: YYYY-MM-DD)
   * @param {string} dateFin - Date de fin (format: YYYY-MM-DD)
   * @returns {Promise} Historique des présences
   */
  getAttendanceHistory: async (matiereId, classeId, dateDebut, dateFin) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/attendance/history`,
        {
          params: { matiereId, classeId, dateDebut, dateFin },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  },

  /**
   * Récupérer les statistiques de présence d'un étudiant
   * @param {number} etudiantId - ID de l'étudiant
   * @param {number} semestre - Numéro du semestre
   * @returns {Promise} Statistiques de présence
   */
  getStudentAttendanceStats: async (etudiantId, semestre) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/attendance/student/${etudiantId}/stats`,
        {
          params: { semestre },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  /**
   * Récupérer les présences d'une date spécifique
   * @param {string} date - Date (format: YYYY-MM-DD)
   * @param {number} classeId - ID de la classe
   * @param {number} matiereId - ID de la matière
   * @returns {Promise} Présences du jour
   */
  getAttendanceByDate: async (date, classeId, matiereId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/attendance/date/${date}`,
        {
          params: { classeId, matiereId },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des présences:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une présence existante
   * @param {number} attendanceId - ID de la présence
   * @param {string} statut - Nouveau statut ('present' ou 'absent')
   * @returns {Promise} Résultat de la mise à jour
   */
  updateAttendance: async (attendanceId, statut) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/attendance/${attendanceId}`,
        { statut },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la présence:', error);
      throw error;
    }
  },

  /**
   * Récupérer le taux de présence global d'une classe
   * @param {number} classeId - ID de la classe
   * @param {number} semestre - Numéro du semestre
   * @returns {Promise} Taux de présence
   */
  getClassAttendanceRate: async (classeId, semestre) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/attendance/class/${classeId}/rate`,
        {
          params: { semestre },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du taux de présence:', error);
      throw error;
    }
  }
};

export default attendanceService;