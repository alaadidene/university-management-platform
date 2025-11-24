import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { directorService } from "../services/directorService";
import { departementService } from "../services/adminServices";
import { 
  Edit,
  User,
  LogOut
} from 'lucide-react';

// Import components for inline rendering
import MySchedule from './MySchedule';
import MessagingPage from './MessagingPage';
import TeacherScheduleViewer from './TeacherScheduleViewer';
import RoomScheduleViewer from './RoomScheduleViewer';

// Import DirectorSidebar
import DirectorSidebar from './DirectorSidebar';

const DirectorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [userDepartement, setUserDepartement] = useState(null);
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || "",
    cin: user?.cin || "",
  });

  useEffect(() => {
    console.log('🚀 DirectorDashboard useEffect déclenché');
    console.log('👤 Utilisateur:', user);
    loadDashboardData();
    loadUserDepartement();
  }, [user]);

  const loadUserDepartement = async () => {
    // Essayer d'abord user.departement.id, puis user.departementId
    const departementId = user?.departement?.id || user?.departementId;
    
    if (departementId) {
      try {
        console.log('🔄 Chargement du département utilisateur avec ID:', departementId);
        const departement = await departementService.getById(departementId);
        console.log('✅ Département chargé:', departement);
        setUserDepartement(departement);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du département:', error);
        setUserDepartement(null);
      }
    } else {
      console.log('⚠️ Aucun ID de département trouvé pour l\'utilisateur');
      setUserDepartement(null);
    }
  };

  const loadDashboardData = async () => {
    console.log('🔄 Chargement des données du dashboard directeur...');
    
    try {
      const stats = await directorService.getStats();
      console.log('✅ Statistiques récupérées:', stats);

      const data = {
        title: "Espace Directeur de Département",
        stats: [
          { label: "Enseignants", value: stats.enseignants.toString(), icon: "👨‍🏫", color: "blue" },
          { label: "Étudiants", value: stats.etudiants.toString(), icon: "👥", color: "green" },
          { label: "Classes", value: stats.classes.toString(), icon: "📚", color: "purple" },
          { label: "Taux de réussite", value: `${stats.tauxReussite}%`, icon: "📊", color: "orange" },
        ],
        actions: [
          { label: "👥 Gérer utilisateurs", description: "Administration des comptes utilisateurs", action: "manageUsers" },
          { label: "👨‍🏫 Gérer enseignants", description: "Gestion du personnel enseignant", action: "manageTeachers" },
          { label: "👨‍🎓 Gérer étudiants", description: "Gestion des étudiants du département", action: "manageStudents" },
          { label: "💬 Messagerie", description: "Messagerie interne avec enseignants et étudiants", action: "messaging" },
          { label: "📊 Rapports", description: "Générer des rapports département", action: "reports" },
          { label: "💰 Budget", description: "Suivi budgétaire du département", action: "budget" },
          { label: "📝 Évaluations", description: "Gestion des évaluations", action: "evaluations" },
        ],
      };
      
      setDashboardData(data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des stats:', error);
      const data = {
        title: "Espace Directeur de Département",
        stats: [
          { label: "Enseignants", value: "—", icon: "👨‍🏫", color: "blue" },
          { label: "Étudiants", value: "—", icon: "👥", color: "green" },
          { label: "Classes", value: "—", icon: "📚", color: "purple" },
          { label: "Taux de réussite", value: "—", icon: "📊", color: "orange" },
        ],
        actions: [
          { label: "👥 Gérer utilisateurs", description: "Administration des comptes utilisateurs", action: "manageUsers" },
          { label: "👨‍🏫 Gérer enseignants", description: "Gestion du personnel enseignant", action: "manageTeachers" },
          { label: "👨‍🎓 Gérer étudiants", description: "Gestion des étudiants du département", action: "manageStudents" },
          { label: "💬 Messagerie", description: "Messagerie interne avec enseignants et étudiants", action: "messaging" },
          { label: "📊 Rapports", description: "Générer des rapports département", action: "reports" },
          { label: "💰 Budget", description: "Suivi budgétaire du département", action: "budget" },
          { label: "📝 Évaluations", description: "Gestion des évaluations", action: "evaluations" },
        ],
      };
      setDashboardData(data);
      setLoading(false);
    }
  };

  const handleAction = (action) => {
    setActiveNav(action);
    switch (action) {
      case "dashboard":
        break;
      case "mySchedule":
        // navigate("/my-schedule");
        break;
      case "createSchedule":
        navigate("/schedule-builder");
        break;
      case "viewSchedules":
        navigate("/schedule-viewer");
        break;
      case "teacherSchedules":
        // navigate("/teacher-schedules");
        break;
      case "roomSchedules":
        // navigate("/room-schedules");
        break;
      case "manageUsers":
        navigate("/admin");
        break;
      case "manageTeachers":
        navigate("/admin?tab=enseignants");
        break;
      case "manageStudents":
        navigate("/admin?tab=etudiants");
        break;
      case "messaging":
        // navigate('/messagerie');
        break;
      case "profile":
        // Le profil s'ouvre dans le contenu principal
        break;
      case "reports":
        alert("Ouverture des rapports...");
        break;
      case "budget":
        alert("Ouverture de la gestion budgétaire...");
        break;
      case "evaluations":
        alert("Ouverture des évaluations...");
        break;
      default:
        alert(`Action ${action} non implémentée`);
    }
  };

  const handleProfileUpdate = async () => {
    if (!profileData.prenom || !profileData.nom || !profileData.email) {
      // Validation silencieuse - les champs requis sont marqués avec *
      return;
    }

    try {
      const response = await updateUser({
        nom: profileData.nom,
        prenom: profileData.prenom,
        cin: user.cin,
      });

      if (response.success) {
        setEditingProfile(false);
        setProfileData({
          ...profileData,
          prenom: response.user.prenom,
          nom: response.user.nom,
        });
        // Mise à jour réussie - pas d'alert
      } else {
        // Erreur silencieuse - l'utilisateur voit que rien ne change
        console.error("Erreur lors de la mise à jour du profil:", response.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      // Erreur silencieuse
    }
  };

  // Rendu de la page Profil
  const renderProfile = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête du profil */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <User size={48} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{user?.prenom} {user?.nom}</h2>
                <p className="text-blue-100 mt-1">Directeur de Département</p>
                <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Contenu du profil */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Informations personnelles</h3>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={18} />
                  Modifier
                </button>
              )}
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editingProfile ? 'bg-gray-50 text-gray-600' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editingProfile ? 'bg-gray-50 text-gray-600' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editingProfile ? 'bg-gray-50 text-gray-600' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                  <input
                    type="text"
                    name="cin"
                    value={profileData.cin}
                    onChange={(e) => setProfileData({ ...profileData, cin: e.target.value })}
                    maxLength="8"
                    disabled={!editingProfile}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      !editingProfile ? 'bg-gray-50 text-gray-600' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                  <input
                    type="text"
                    value={userDepartement?.nom || "Chargement..."}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <input
                    type="text"
                    value="Directeur de Département"
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>            {editingProfile && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleProfileUpdate();
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Enregistrer les modifications
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getStatColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'espace directeur...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-600">Erreur de chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DirectorSidebar onDashboardAction={handleAction} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activeNav === 'dashboard' && 'Tableau de bord'}
                {activeNav === 'mySchedule' && 'Mon Emploi du Temps'}
                {activeNav === 'messaging' && 'Messagerie'}
                {activeNav === 'teacherSchedules' && 'Emplois des Enseignants'}
                {activeNav === 'roomSchedules' && 'Emplois des Salles'}
                {activeNav === 'profile' && 'Mon Profil'}
              </h2>
              <p className="text-sm text-gray-500">
                {activeNav === 'dashboard' && 'Espace Directeur de Département'}
                {activeNav === 'mySchedule' && 'Consultez votre planning hebdomadaire'}
                {activeNav === 'messaging' && 'Gérez vos messages et communications'}
                {activeNav === 'teacherSchedules' && 'Consultez les emplois du temps des enseignants'}
                {activeNav === 'roomSchedules' && 'Consultez les emplois du temps des salles'}
                {activeNav === 'profile' && 'Gérez vos informations personnelles'}
              </p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="p-8">
          {activeNav === 'dashboard' && (
            <>
              {/* Stats Grid with Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData?.stats.map((stat, index) => {
              // Calculer un pourcentage pour la barre de progression (simule une tendance)
              const percentage = stat.label === "Taux de réussite" 
                ? parseInt(stat.value) 
                : Math.min(95, parseInt(stat.value) * 2 || 75);
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      +12%
                    </div>
                  </div>

                  {/* Valeur principale */}
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progression</span>
                      <span className="font-semibold">{percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getStatColorClasses(stat.color)} transition-all duration-1000 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Mini graphique sparkline */}
                  <div className="flex items-end justify-between h-8 gap-1">
                    {[65, 70, 68, 75, 80, 78, 85, 90, 88, percentage].map((height, i) => (
                      <div 
                        key={i}
                        className={`flex-1 bg-gradient-to-t ${getStatColorClasses(stat.color)} rounded-t opacity-30 hover:opacity-60 transition-all`}
                        style={{ height: `${(height / 100) * 32}px` }}
                      ></div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStatColorClasses(stat.color)}`}></div>
                      Actif
                    </span>
                    <span>Mis à jour</span>
                  </div>
                </div>
              );
            })}
          </div>
            </>
          )}

          {activeNav === 'mySchedule' && <MySchedule />}
          {activeNav === 'messaging' && <MessagingPage />}
          {activeNav === 'teacherSchedules' && <TeacherScheduleViewer />}
          {activeNav === 'roomSchedules' && <RoomScheduleViewer />}
          {activeNav === 'profile' && renderProfile()}
        </main>
      </div>
    </div>
  );
};

export default DirectorDashboard;