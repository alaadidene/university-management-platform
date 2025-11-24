import { adminApi } from "../config/api";

// ==================== DÉPARTEMENTS ====================
export const departementService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/departement");
      return response.data;
    } catch (error) {
      console.error("Erreur departementService.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/departement/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur departementService.getById:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post("/departement", data);
      return response.data;
    } catch (error) {
      console.error("Erreur departementService.create:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/departement/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Erreur departementService.update:", error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/departement/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Erreur departementService.delete:", error);
      throw error;
    }
  }
};

// ==================== CLASSES ====================
export const classeService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/classe");
      return response.data;
    } catch (error) {
      console.error('Erreur classeService.getAll:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/classe/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur classeService.getById:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post("/classe", data);
      return response.data;
    } catch (error) {
      console.error('Erreur classeService.create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/classe/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur classeService.update:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/classe/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur classeService.delete:', error);
      throw error;
    }
  }
};

// ==================== ENSEIGNANTS ====================
export const enseignantService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/enseignant");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de récupération" };
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/enseignant/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Enseignant non trouvé" };
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post("/enseignant", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de création" };
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/enseignant/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de modification" };
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/enseignant/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de suppression" };
    }
  }
};

// ==================== ÉTUDIANTS ====================
export const etudiantService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/etudiants");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de récupération" };
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post("/etudiants", data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de création" };
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/etudiants/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de modification" };
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/etudiants/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Erreur de suppression" };
    }
  }
};

// ==================== SPÉCIALITÉS ====================
export const specialiteService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/specialite");
      return response.data;
    } catch (error) {
      console.error("Erreur specialiteService.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/specialite/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur specialiteService.getById:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post("/specialite", data);
      return response.data;
    } catch (error) {
      console.error("Erreur specialiteService.create:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/specialite/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur specialiteService.update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/specialite/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Erreur specialiteService.delete:", error);
      throw error;
    }
  }
};

// ==================== SPÉCIALITÉS D'ENSEIGNEMENT ====================
export const specialiteEnseignementService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/specialite-enseignement");
      return response.data;
    } catch (error) {
      console.error("Erreur specialiteEnseignementService.getAll:", error);
      throw error;
    }
  }
};

// ==================== NIVEAUX ====================
export const niveauService = {
  getAll: async () => {
    try {
      const response = await adminApi.get("/niveau");
      return response.data;
    } catch (error) {
      console.error("Erreur niveauService.getAll:", error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/niveau/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur niveauService.getById:", error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post("/niveau", data);
      return response.data;
    } catch (error) {
      console.error("Erreur niveauService.create:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/niveau/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur niveauService.update:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/niveau/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Erreur niveauService.delete:", error);
      throw error;
    }
  }
};

// ==================== STATISTIQUES ====================
export const statsService = {
  // Stats pour le dashboard directeur
  getDirectorStats: async () => {
    try {
      // En attendant l'endpoint stats, on récupère les données de base
      const [depts, enseignants, etudiants, classes] = await Promise.all([
        departementService.getAll(),
        enseignantService.getAll(),
        etudiantService.getAll(),
        classeService.getAll()
      ]);

      return {
        success: true,
        data: {
          totalDepartements: depts.data?.length || 0,
          totalEnseignants: enseignants.data?.length || 0,
          totalEtudiants: etudiants.data?.length || 0,
          totalClasses: classes.data?.length || 0
        }
      };
    } catch (error) {
      return { success: false, message: "Erreur lors du chargement des statistiques" };
    }
  }
};

// ==================== SALLES ====================
export const salleService = {
  getAll: async () => {
    try {
      const response = await adminApi.get('/salles');
      return response.data;
    } catch (error) {
      console.error('Erreur salleService.getAll:', error);
      throw error;
    }
  }
};

// ==================== MATIÈRES ====================
export const matiereService = {
  getAll: async () => {
    try {
      const response = await adminApi.get('/matiere');
      return response.data;
    } catch (error) {
      console.error('Erreur matiereService.getAll:', error);
      throw error;
    }
  }
};

// CRUD pour SALLE
salleService.create = async (data) => {
  try {
    const resp = await adminApi.post('/salles', data);
    return { success: true, data: resp.data };
  } catch (error) {
    console.error('Erreur salleService.create:', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

salleService.update = async (id, data) => {
  try {
    const resp = await adminApi.patch(`/salles/${id}`, data);
    return { success: true, data: resp.data };
  } catch (error) {
    console.error('Erreur salleService.update:', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

salleService.delete = async (id) => {
  try {
    await adminApi.delete(`/salles/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur salleService.delete:', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// CRUD pour MATIERE
matiereService.create = async (data) => {
  try {
    const resp = await adminApi.post('/matiere', data);
    return { success: true, data: resp.data };
  } catch (error) {
    console.error('Erreur matiereService.create:', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

matiereService.update = async (id, data) => {
  try {
    const resp = await adminApi.patch(`/matiere/${id}`, data);
    return { success: true, data: resp.data };
  } catch (error) {
    console.error('Erreur matiereService.update:', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

matiereService.delete = async (id) => {
  try {
    await adminApi.delete(`/matiere/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Erreur matiereService.delete:', error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

// ==================== ÉVÉNEMENTS ====================
export const evenementService = {
  getAll: async () => {
    try {
      const response = await adminApi.get('/evenements');
      return response.data;
    } catch (error) {
      console.error('Erreur evenementService.getAll:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await adminApi.get(`/evenements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erreur evenementService.getById:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const response = await adminApi.post('/evenements', data);
      return response.data;
    } catch (error) {
      console.error('Erreur evenementService.create:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await adminApi.patch(`/evenements/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur evenementService.update:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await adminApi.delete(`/evenements/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Erreur evenementService.delete:', error);
      return { success: false, message: error.response?.data?.message || error.message };
    }
  }
};
