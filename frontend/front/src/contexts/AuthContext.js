import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.REACT_APP_AUTH_API_URL || "http://localhost:3001/api";

  // Configure axios defaults
  axios.defaults.baseURL = API_BASE;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = normalizeUser(JSON.parse(userData));
        setUser(parsedUser);
        setIsAuthenticated(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    } else if (process.env.NODE_ENV === 'development') {
      // Mode test automatique avec utilisateur directeur
      const testDirector = {
        id: 1,
        email: "directeur.test@univ.tn",
        prenom: "Ahmed",
        nom: "Directeur",
        role: "directeur_departement",
        departement: "Informatique",
        specialite: "Génie Logiciel"
      };
      
      console.log('🧪 Mode test activé - Connexion automatique comme directeur');
      setUser(normalizeUser(testDirector));
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(testDirector));
      localStorage.setItem("token", "test-token-director");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password });

      // Vérifier si changement de mot de passe requis
      if (response.data.mustChangePassword) {
        return {
          success: false,
          mustChangePassword: true,
          message: response.data.message || 'Changement de mot de passe requis',
        };
      }

      if (response.data.success) {
        const { user: userData, token, type } = response.data;
        const normalized = normalizeUser(userData);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(normalized));

        setUser(normalized);
        setIsAuthenticated(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return { success: true, user: normalized, type };
      }

      return {
        success: false,
        message: response.data.message || "Erreur de connexion",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Erreur de connexion",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common["Authorization"];
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/auth/register", userData);

      if (response.data.success) {
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Erreur d'inscription",
      };
    }
  };

  const changePassword = async (email, currentPassword, newPassword) => {
    try {
      const response = await axios.post("/auth/change-password", {
        email,
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        const { user: userData, token, type } = response.data;
        const normalized = normalizeUser(userData);

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(normalized));
        setUser(normalized);
        setIsAuthenticated(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return { success: true, user: normalized, type };
      }

      return {
        success: false,
        message: response.data.message || "Erreur lors du changement de mot de passe",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Erreur lors du changement de mot de passe",
      };
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const response = await axios.post("/auth/update-profile", {
        email: user.email,
        nom: updatedUserData.nom,
        prenom: updatedUserData.prenom,
        cin: updatedUserData.cin,
      });

      if (response.data.success) {
        const updatedUser = normalizeUser(response.data.user);
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }

      return {
        success: false,
        message: response.data.message || "Erreur lors de la mise à jour du profil",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Erreur lors de la mise à jour du profil",
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    changePassword,
    updateUser,
  };

  // Normalisation pour garantir que departement / specialite ne cassent pas le rendu
  function normalizeUser(u) {
    if (!u || typeof u !== 'object') return u;
    const copy = { ...u };
    // departement peut être string ou objet { id, nom }
    if (copy.departement && typeof copy.departement === 'object') {
      if (typeof copy.departement.nom === 'string') {
        copy.departement_nom = copy.departement.nom; // garder référence
        copy.departementId = copy.departement.id;
        // Ne pas flatten - garder l'objet pour compatibilité avec le code existant
      } else {
        copy.departement = JSON.stringify(copy.departement);
      }
    } else if (typeof copy.departement === 'string') {
      // Si c'est déjà une string, la convertir en objet pour cohérence
      copy.departement = { nom: copy.departement };
    }
    if (copy.specialite && typeof copy.specialite === 'object') {
      if (typeof copy.specialite.nom === 'string') {
        copy.specialite_nom = copy.specialite.nom;
        copy.specialiteId = copy.specialite.id;
        copy.specialite = copy.specialite.nom;
      } else {
        copy.specialite = JSON.stringify(copy.specialite);
      }
    }
    return copy;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
