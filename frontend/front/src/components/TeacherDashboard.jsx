import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Users, 
  FileText, 
  MessageSquare, 
  LogOut, 
  User, 
  Edit,
  BarChart3,
  GraduationCap
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    departement: user?.departement?.nom || "",
    specialite: user?.specialite || "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setTimeout(() => {
      const data = {
        title: "Espace Enseignant",
        stats: [
          { 
            label: "Mes cours", 
            value: "4", 
            color: "blue",
            description: "Cours actifs"
          },
          { 
            label: "Étudiants", 
            value: "156", 
            color: "green",
            description: "Total inscrits"
          },
          { 
            label: "Évaluations", 
            value: "12", 
            color: "orange",
            description: "En attente"
          },
          { 
            label: "Réussite", 
            value: "87%", 
            color: "purple",
            description: "Taux moyen"
          },
        ],
        quickActions: [
          { 
            title: "Mon Emploi du Temps", 
            description: "Consulter mon planning hebdomadaire",
            action: "viewSchedule",
          },
          { 
            title: "Évaluer les Étudiants", 
            description: "Saisir les notes et évaluations",
            action: "gradeStudents",
          },
          { 
            title: "Mes Statistiques", 
            description: "Analyser les performances",
            action: "statistics",
          },
        ],
      };
      setDashboardData(data);
      setLoading(false);
    }, 800);
  };

  const handleAction = (action) => {
    setActiveNav(action);
    switch (action) {
      case "dashboard":
        break;
      case "manageCourses":
        alert("Ouverture de la gestion des cours...");
        break;
      case "gradeStudents":
        alert("Ouverture des évaluations...");
        break;
      case "viewSchedule":
        navigate("/my-schedule");
        break;
      case "statistics":
        alert("Ouverture des statistiques...");
        break;
      case "messaging":
        navigate('/messagerie');
        break;
      case "resources":
        alert("Ouverture des ressources pédagogiques...");
        break;
      case "profile":
        // Le profil s'ouvre dans le contenu principal
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

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/");
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
                <p className="text-blue-100 mt-1">Enseignant</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={profileData.telephone}
                  onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
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
                  value={profileData.departement || "Chargement..."}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                <input
                  type="text"
                  value={profileData.specialite || "Non spécifiée"}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {editingProfile && (
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
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">ISET Tozeur</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Menu Principal */}
          <div>
            <div className="text-xs font-semibold text-blue-300 uppercase mb-2">Menu Principal</div>
            <button
              onClick={() => handleAction('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === 'dashboard' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="text-sm font-medium">Tableau de bord</span>
            </button>

            <button
              onClick={() => handleAction('viewSchedule')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
                activeNav === 'viewSchedule' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <Calendar size={20} />
              <span className="text-sm font-medium">Mon Emploi du Temps</span>
            </button>
          </div>

          {/* Cours & Étudiants */}
          <div>
            <div className="text-xs font-semibold text-blue-300 uppercase mb-2">Cours & Étudiants</div>
            <button
              onClick={() => handleAction('manageCourses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === 'manageCourses' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <BookOpen size={20} />
              <span className="text-sm font-medium">Mes cours</span>
            </button>

            <button
              onClick={() => handleAction('gradeStudents')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
                activeNav === 'gradeStudents' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <FileText size={20} />
              <span className="text-sm font-medium">Évaluations</span>
            </button>

            <button
              onClick={() => handleAction('statistics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
                activeNav === 'statistics' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <BarChart3 size={20} />
              <span className="text-sm font-medium">Statistiques</span>
            </button>
          </div>

          {/* Outils */}
          <div>
            <div className="text-xs font-semibold text-blue-300 uppercase mb-2">Outils</div>
            <button
              onClick={() => handleAction('messaging')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeNav === 'messaging' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <MessageSquare size={20} />
              <span className="text-sm font-medium">Messagerie</span>
            </button>

            <button
              onClick={() => handleAction('resources')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
                activeNav === 'resources' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <GraduationCap size={20} />
              <span className="text-sm font-medium">Ressources</span>
            </button>

            <button
              onClick={() => handleAction('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
                activeNav === 'profile' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
              }`}
            >
              <User size={20} />
              <span className="text-sm font-medium">Mon Profil</span>
            </button>
          </div>
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {activeNav === 'dashboard' && 'Tableau de bord'}
                {activeNav === 'viewSchedule' && 'Mon Emploi du Temps'}
                {activeNav === 'manageCourses' && 'Mes Cours'}
                {activeNav === 'gradeStudents' && 'Évaluations'}
                {activeNav === 'statistics' && 'Statistiques'}
                {activeNav === 'messaging' && 'Messagerie'}
                {activeNav === 'resources' && 'Ressources'}
                {activeNav === 'profile' && 'Mon Profil'}
              </h2>
              <p className="text-sm text-gray-500">
                {activeNav === 'dashboard' && 'Bienvenue dans votre espace enseignant'}
                {activeNav === 'viewSchedule' && 'Consultez votre planning hebdomadaire'}
                {activeNav === 'manageCourses' && 'Gérez vos cours et matières'}
                {activeNav === 'gradeStudents' && 'Saisissez les notes et évaluations'}
                {activeNav === 'statistics' && 'Analysez vos performances pédagogiques'}
                {activeNav === 'messaging' && 'Gérez vos messages et communications'}
                {activeNav === 'resources' && 'Accédez aux ressources pédagogiques'}
                {activeNav === 'profile' && 'Gérez vos informations personnelles'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="p-8">
          {activeNav === 'profile' ? (
            renderProfile()
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardData?.stats.map((stat, index) => {
                  const percentage = Math.min(95, parseInt(stat.value) * 2 || 75);
                  
                  // Icônes professionnelles selon le type de stat
                  const getIcon = () => {
                    switch(stat.label) {
                      case "Mes cours":
                        return <BookOpen className="text-white" size={24} />;
                      case "Étudiants":
                        return <Users className="text-white" size={24} />;
                      case "Évaluations":
                        return <FileText className="text-white" size={24} />;
                      case "Réussite":
                        return <BarChart3 className="text-white" size={24} />;
                      default:
                        return <LayoutDashboard className="text-white" size={24} />;
                    }
                  };
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      {/* Header avec icône professionnelle */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getStatColorClasses(stat.color)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          {getIcon()}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          +12%
                        </div>
                      </div>

                      {/* Valeur principale */}
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500">{stat.description}</div>
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
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;