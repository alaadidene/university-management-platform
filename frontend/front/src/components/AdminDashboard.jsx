import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./DirectorDashboard.css";

const AdminDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
  });

  useEffect(() => {
    console.log('🚀 AdminDashboard useEffect déclenché');
    console.log('👤 Utilisateur:', user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('🔄 Chargement des données du dashboard admin...');
    
    setTimeout(() => {
      const data = {
        title: "Espace Administrateur",
        stats: [
          { label: "Départements", value: "5", icon: "🏢", color: "primary" },
          { label: "Enseignants", value: "85", icon: "👨‍🏫", color: "turquoise" },
          { label: "Étudiants", value: "1250", icon: "👥", color: "yellow" },
          { label: "Classes", value: "42", icon: "🎓", color: "primary" },
        ],
        actions: [
          { label: "📅 Mon Emploi du Temps", description: "Consulter mon emploi du temps personnel", action: "mySchedule" },
          { label: "🏢 Gérer Départements", description: "Administration des départements", action: "manageDepartments" },
          { label: "👥 Gérer Utilisateurs", description: "Administration de tous les comptes", action: "manageUsers" },
          { label: "👨‍🏫 Gérer Enseignants", description: "Gestion du personnel enseignant", action: "manageTeachers" },
          { label: "👨‍🎓 Gérer Étudiants", description: "Gestion des étudiants", action: "manageStudents" },
          { label: "🎓 Gérer Classes", description: "Administration des classes", action: "manageClasses" },
          { label: "📚 Gérer Matières", description: "Administration des matières", action: "manageSubjects" },
          { label: "🏫 Gérer Salles", description: "Gestion des salles de cours", action: "manageRooms" },
          { label: "📋 Voir Absences", description: "Consultation des absences", action: "viewAbsences" },
          { label: "📅 Emplois du Temps", description: "Consulter tous les emplois du temps", action: "viewSchedules" },
          { label: "💬 Messagerie", description: "Messagerie interne", action: "messaging" },
          { label: "📊 Statistiques", description: "Statistiques globales", action: "statistics" },
        ],
      };
      console.log('✅ Données admin chargées:', data);
      setDashboardData(data);
      setLoading(false);
    }, 300);
  };

  const handleAction = (action) => {
    setActiveNav(action);
    switch (action) {
      case "dashboard":
        break;
      case "mySchedule":
        navigate("/my-schedule");
        break;
      case "manageDepartments":
        alert("⚙️ Gestion des départements - En cours de développement");
        break;
      case "manageUsers":
        alert("⚙️ Gestion des utilisateurs - En cours de développement");
        break;
      case "manageTeachers":
        alert("⚙️ Gestion des enseignants - En cours de développement");
        break;
      case "manageStudents":
        alert("⚙️ Gestion des étudiants - En cours de développement");
        break;
      case "manageClasses":
        alert("⚙️ Gestion des classes - En cours de développement");
        break;
      case "manageSubjects":
        alert("⚙️ Gestion des matières - En cours de développement");
        break;
      case "manageRooms":
        alert("⚙️ Gestion des salles - En cours de développement");
        break;
      case "viewAbsences":
        navigate("/directeur/absences");
        break;
      case "viewSchedules":
        navigate("/schedule-viewer");
        break;
      case "messaging":
        navigate("/messagerie");
        break;
      case "statistics":
        alert("📊 Statistiques - En cours de développement");
        break;
      default:
        console.log("Action non gérée:", action);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log("Mise à jour profil:", profileData);
    await updateUser(profileData);
    setEditingProfile(false);
    alert("✅ Profil mis à jour avec succès!");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="director-dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h1>🏛️ ISET Tozeur</h1>
          <span className="user-role">{dashboardData?.title}</span>
        </div>
        <div className="nav-actions">
          <button
            className="nav-btn"
            onClick={() => {
              setShowProfile(!showProfile);
              setEditingProfile(false);
            }}
          >
            👤 {user?.prenom} {user?.nom}
          </button>
          <button className="nav-btn logout-btn" onClick={handleLogout}>
            🚪 Déconnexion
          </button>
        </div>
      </nav>

      {showProfile && (
        <div className="profile-modal">
          <div className="profile-content">
            <div className="profile-header">
              <h2>Mon Profil</h2>
              <button className="close-btn" onClick={() => setShowProfile(false)}>
                ×
              </button>
            </div>
            
            {editingProfile ? (
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">💾 Enregistrer</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditingProfile(false)}>
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="label">Prénom:</span>
                  <span className="value">{user?.prenom}</span>
                </div>
                <div className="info-row">
                  <span className="label">Nom:</span>
                  <span className="value">{user?.nom}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Téléphone:</span>
                  <span className="value">{user?.telephone || "Non renseigné"}</span>
                </div>
                <div className="info-row">
                  <span className="label">Rôle:</span>
                  <span className="value badge-admin">Administrateur</span>
                </div>
                <button className="btn-primary" onClick={() => setEditingProfile(true)}>
                  ✏️ Modifier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h2>Tableau de bord - Administrateur</h2>
          <p className="welcome-text">
            Bienvenue, {user?.prenom} {user?.nom}
          </p>
        </div>

        <div className="stats-grid">
          {dashboardData?.stats.map((stat, index) => (
            <div key={index} className={`stat-card ${stat.color}`}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="actions-grid">
          {dashboardData?.actions.map((action, index) => (
            <button
              key={index}
              className="action-card"
              onClick={() => handleAction(action.action)}
            >
              <div className="action-icon">{action.label.split(" ")[0]}</div>
              <div className="action-content">
                <h3>{action.label.substring(action.label.indexOf(" ") + 1)}</h3>
                <p>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
