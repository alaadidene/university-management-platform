import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DirectorSidebar = ({ onDashboardAction }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="w-64 bg-gradient-to-br from-blue-900 to-blue-800 text-white flex flex-col shadow-2xl">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-blue-800">
        <div className="text-xl font-bold text-white">
          ISET Tozeur
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Menu Principal */}
        <div className="px-3 mb-4">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 px-3">
            Menu Principal
          </div>
          <button
            onClick={() => handleNavigation('/director-dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/director-dashboard')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="font-medium">Tableau de bord</span>
          </button>

          <button
            onClick={() => {
              if (onDashboardAction) {
                onDashboardAction('mySchedule');
              } else {
                handleNavigation('/my-schedule');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mt-1 ${
              isActive('/my-schedule')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="font-medium">Mon Emploi du Temps</span>
          </button>
        </div>

        {/* Gestion Emplois du Temps */}
        <div className="px-3 mb-4">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 px-3">
            Emplois du Temps
          </div>
          <button
            onClick={() => handleNavigation('/schedule-builder')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/schedule-builder')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span className="font-medium">Créer emploi du temps</span>
          </button>

          <button
            onClick={() => handleNavigation('/schedule-viewer')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mt-1 ${
              isActive('/schedule-viewer')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="font-medium">Voir emplois classes</span>
          </button>

          <button
            onClick={() => {
              if (onDashboardAction) {
                onDashboardAction('teacherSchedules');
              } else {
                handleNavigation('/teacher-schedules');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mt-1 ${
              isActive('/teacher-schedules')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium">Emplois enseignants</span>
          </button>

          <button
            onClick={() => {
              if (onDashboardAction) {
                onDashboardAction('roomSchedules');
              } else {
                handleNavigation('/room-schedules');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mt-1 ${
              isActive('/room-schedules')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <span className="font-medium">Emplois salles</span>
          </button>
        </div>

        {/* Gestion Utilisateurs */}
        <div className="px-3 mb-4">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 px-3">
            Gestion Utilisateurs
          </div>
          <button
            onClick={() => handleNavigation('/admin')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/admin')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="font-medium">Gérer utilisateurs</span>
          </button>
        </div>

        {/* Outils */}
        <div className="px-3 mb-4">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-2 px-3">
            Outils
          </div>
          <button
            onClick={() => {
              if (onDashboardAction) {
                onDashboardAction('messaging');
              } else {
                handleNavigation('/messagerie');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/messagerie')
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="font-medium">Messagerie</span>
          </button>

          <button
            onClick={() => {
              if (onDashboardAction) {
                onDashboardAction('profile');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 mt-1 ${
              false // Profile n'a pas d'état actif basé sur l'URL
                ? 'bg-blue-700 shadow-lg'
                : 'hover:bg-blue-800'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="font-medium">Mon Profil</span>
          </button>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
            {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-base">{user?.prenom} {user?.nom}</h3>
            <p className="text-blue-300 text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DirectorSidebar;
