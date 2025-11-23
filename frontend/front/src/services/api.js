import axios from 'axios';

// Configuration des URLs des services backend
const API_URLS = {
  auth: 'http://localhost:3001',
  admin: 'http://localhost:3002',
  absence: 'http://localhost:3003',
  emploi: 'http://localhost:3010'
};

// Créer une instance axios avec configuration par défaut
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH SERVICE ============
export const authService = {
  login: (email, password) => 
    api.post(`${API_URLS.auth}/auth/login`, { email, password }),
  
  register: (userData) => 
    api.post(`${API_URLS.auth}/auth/register`, userData),
  
  getCurrentUser: () => 
    api.get(`${API_URLS.auth}/auth/me`),
  
  resetPassword: (email) => 
    api.post(`${API_URLS.auth}/auth/reset-password`, { email })
};

// ============ ADMIN SERVICE ============
export const adminService = {
  // Départements
  getDepartements: () => 
    api.get(`${API_URLS.admin}/departement`),
  
  createDepartement: (data) => 
    api.post(`${API_URLS.admin}/departement`, data),
  
  // Classes
  getClasses: () => 
    api.get(`${API_URLS.admin}/classe`),
  
  getClasseById: (id) => 
    api.get(`${API_URLS.admin}/classe/${id}`),
  
  getEtudiantsClasse: (classeId) => 
    api.get(`${API_URLS.admin}/classe/${classeId}/etudiants`),
  
  // Étudiants
  getEtudiants: () => 
    api.get(`${API_URLS.admin}/etudiant`),
  
  getEtudiantById: (id) => 
    api.get(`${API_URLS.admin}/etudiant/${id}`),
  
  createEtudiant: (data) => 
    api.post(`${API_URLS.admin}/etudiant`, data),
  
  updateEtudiant: (id, data) => 
    api.put(`${API_URLS.admin}/etudiant/${id}`, data),
  
  deleteEtudiant: (id) => 
    api.delete(`${API_URLS.admin}/etudiant/${id}`),
  
  // Enseignants
  getEnseignants: () => 
    api.get(`${API_URLS.admin}/enseignant`),
  
  getEnseignantById: (id) => 
    api.get(`${API_URLS.admin}/enseignant/${id}`),
  
  createEnseignant: (data) => 
    api.post(`${API_URLS.admin}/enseignant`, data),
  
  updateEnseignant: (id, data) => 
    api.put(`${API_URLS.admin}/enseignant/${id}`, data),
  
  // Matières
  getMatieres: () => 
    api.get(`${API_URLS.admin}/matiere`),
  
  getMatiereById: (id) => 
    api.get(`${API_URLS.admin}/matiere/${id}`)
};

// ============ ABSENCE SERVICE ============
export const absenceService = {
  // Créer une absence
  createAbsence: (data) => 
    api.post(`${API_URLS.absence}/absences`, data),
  
  // Toutes les absences (admin/directeur)
  getAllAbsences: () => 
    api.get(`${API_URLS.absence}/absences`),
  
  // Absences d'un étudiant
  getAbsencesEtudiant: (etudiantId) => 
    api.get(`${API_URLS.absence}/absences/etudiant/${etudiantId}`),
  
  // Statut élimination par matière pour un étudiant
  getStatutMatieresEtudiant: (etudiantId) => 
    api.get(`${API_URLS.absence}/absences/etudiant/${etudiantId}/statut-matieres`),
  
  // Vérifier le risque d'élimination
  verifierRisqueElimination: (etudiantId, matiereId) => 
    api.get(`${API_URLS.absence}/absences/etudiant/${etudiantId}/risque-elimination?matiereId=${matiereId}`),
  
  // Étudiants à risque
  getEtudiantsARisque: () => 
    api.get(`${API_URLS.absence}/absences/etudiants-a-risque`),
  
  // Absences par matière
  getAbsencesMatiere: (matiereId) => 
    api.get(`${API_URLS.absence}/absences/matiere/${matiereId}`),
  
  // Justifier une absence
  justifierAbsence: (absenceId, data) => 
    api.post(`${API_URLS.absence}/absences/${absenceId}/justifier`, data),
  
  // Valider/refuser une justification (directeur)
  validerJustification: (absenceId, valide, commentaire) => 
    api.patch(`${API_URLS.absence}/absences/${absenceId}/valider`, { valide, commentaireDirecteur: commentaire }),
  
  // Mettre à jour une absence
  updateAbsence: (absenceId, data) => 
    api.patch(`${API_URLS.absence}/absences/${absenceId}`, data),
  
  // Supprimer une absence
  deleteAbsence: (absenceId) => 
    api.delete(`${API_URLS.absence}/absences/${absenceId}`)
};

// ============ EMPLOI SERVICE ============
export const emploiService = {
  // Emploi du temps
  getEmploiDuTemps: (classeId) => 
    api.get(`${API_URLS.emploi}/emploi/${classeId}`),
  
  getSeanceById: (seanceId) => 
    api.get(`${API_URLS.emploi}/seance/${seanceId}`),
  
  createSeance: (data) => 
    api.post(`${API_URLS.emploi}/seance`, data),
  
  updateSeance: (seanceId, data) => 
    api.put(`${API_URLS.emploi}/seance/${seanceId}`, data),
  
  deleteSeance: (seanceId) => 
    api.delete(`${API_URLS.emploi}/seance/${seanceId}`)
};

// Helper pour stocker et récupérer les données utilisateur
export const userHelper = {
  saveUser: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  getUserRole: () => {
    const user = userHelper.getUser();
    return user?.role || null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default api;
