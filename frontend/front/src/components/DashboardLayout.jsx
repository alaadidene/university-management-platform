import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from './NotificationPanel';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  MessageSquare, 
  Library, 
  FileText, 
  User, 
  LogOut,
  Bell
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'etudiant') {
      loadNotifications();
      // Actualiser les notifications toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Charger les notifications depuis l'API
  const loadNotifications = async () => {
    if (!user?.id || user?.role !== 'etudiant') return;

    try {
      const response = await fetch(`http://localhost:3002/api/notifications/etudiant/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const services = [
    { 
      label: "Tableau de bord", 
      description: "Vue d'ensemble",
      icon: LayoutDashboard,
      path: "/student-dashboard"
    },
    { 
      label: "Mon emploi du temps", 
      description: "Consulter mon planning",
      icon: Calendar,
      path: "/my-schedule"
    },
    { 
      label: "Mes notes", 
      description: "Résultats et bulletins",
      icon: BookOpen,
      path: "/notes"
    },
    { 
      label: "Statistiques", 
      description: "Analyse de performance",
      icon: BarChart3,
      path: "/statistiques"
    },
    { 
      label: "Mes Absences", 
      description: "Consulter mes absences",
      icon: "🕐",
      path: "/mes-absences"
    },
    { 
      label: "Messagerie", 
      description: "Messages et notifications",
      icon: MessageSquare,
      path: "/messagerie"
    },
    { 
      label: "Bibliothèque", 
      description: "Ressources pédagogiques",
      icon: Library,
      path: "/bibliotheque"
    },
    { 
      label: "Scolarité", 
      description: "Documents administratifs",
      icon: FileText,
      path: "/scolarite"
    },
    { 
      label: "Notifications", 
      description: "Alertes et messages",
      icon: Bell,
      path: "/notifications",
      badge: user?.role === 'etudiant' ? (unreadCount > 0 ? unreadCount : null) : null
    },
  ];

  const handleServiceClick = (service) => {
    navigate(service.path);
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <aside className={`bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">ISET Tozeur</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {services.map((service, index) => {
            const isActive = location.pathname === service.path;
            const IconComponent = service.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(service.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                  isActive ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
                }`}
              >
                <IconComponent size={20} />
                <span className="text-sm font-medium">{service.label}</span>
              </button>
            );
          })}
          
          {/* Profile Button */}
          <button
            onClick={() => navigate('/student-profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mt-2 ${
              location.pathname === '/student-profile' ? 'bg-blue-700 shadow-lg' : 'hover:bg-blue-800'
            }`}
          >
            <User size={20} />
            <span className="text-sm font-medium">Mon Profil</span>
          </button>
        </nav>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-blue-700 relative">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
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
                {location.pathname === '/student-dashboard' && 'Tableau de bord'}
                {location.pathname === '/my-schedule' && 'Mon Emploi du Temps'}
                {location.pathname === '/notes' && 'Mes Notes'}
                {location.pathname === '/statistiques' && 'Statistiques'}
                {location.pathname === '/messagerie' && 'Messagerie'}
                {location.pathname === '/bibliotheque' && 'Bibliothèque'}
                {location.pathname === '/scolarite' && 'Scolarité'}
                {location.pathname === '/student-profile' && 'Mon Profil'}
              </h2>
              <p className="text-sm text-gray-500">
                {location.pathname === '/student-dashboard' && 'Bienvenue dans votre espace étudiant'}
                {location.pathname === '/my-schedule' && 'Consultez votre planning hebdomadaire'}
                {location.pathname === '/notes' && 'Consultez vos résultats et bulletins'}
                {location.pathname === '/statistiques' && 'Analysez vos performances académiques'}
                {location.pathname === '/messagerie' && 'Gérez vos messages et communications'}
                {location.pathname === '/bibliotheque' && 'Accédez aux ressources pédagogiques'}
                {location.pathname === '/scolarite' && 'Consultez vos documents administratifs'}
                {location.pathname === '/student-profile' && 'Gérez vos informations personnelles'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationPanel />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;