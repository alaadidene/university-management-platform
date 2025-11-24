import React, { useState, useEffect } from "react";
import { User, Calendar, BookOpen, BarChart3, Mail, Library, FileText, Award, Clock, TrendingUp } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    // Component mounted
  }, []);

  const services = [
    {
      label: "Tableau de bord",
      action: "dashboard",
      description: "Vue d'ensemble",
      icon: TrendingUp,
      path: "/dashboard"
    },
    {
      label: "Mon emploi du temps",
      action: "viewSchedule",
      description: "Consulter mon planning",
      icon: Calendar,
      path: "/my-schedule"
    },
    {
      label: "Mes notes",
      action: "viewGrades",
      description: "Résultats et bulletins",
      icon: BookOpen,
      path: "/notes"
    },
    {
      label: "Statistiques",
      action: "statistics",
      description: "Analyse de performance",
      icon: BarChart3,
      path: "/statistiques"
    },
    {
      label: "Messagerie",
      action: "messaging",
      description: "Communications",
      icon: Mail,
      path: "/messages"
    },
    {
      label: "Ressources",
      action: "resources",
      description: "Documents et supports",
      icon: Library,
      path: "/resources"
    }
  ];

  const getStatColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600",
      orange: "from-orange-500 to-orange-600"
    };
    return colors[color] || colors.blue;
  };

  // Composant pour afficher le contenu selon la page
  const PageContent = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <div className="pt-3 pb-6">
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Moyenne générale",
                    value: "14.5",
                    description: "Sur 20",
                    color: "green",
                    icon: TrendingUp
                  },
                  {
                    label: "Crédits validés",
                    value: "120/180",
                    description: "66% complété",
                    color: "blue",
                    icon: BookOpen
                  },
                  {
                    label: "Absences ce mois",
                    value: "2",
                    description: "Jours d'absence",
                    color: "orange",
                    icon: Clock
                  },
                  {
                    label: "Messages non lus",
                    value: "3",
                    description: "À consulter",
                    color: "purple",
                    icon: Mail
                  }
                ].map((stat, index) => {
                  const percentage = stat.label === "Moyenne générale" ? 72 : 
                                   stat.label === "Crédits validés" ? 66 : 
                                   stat.label === "Absences ce mois" ? 15 : 25;
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all group"
                    >
                      {/* Header avec icône professionnelle */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getStatColorClasses(stat.color)} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                          <stat.icon className="text-white" size={18} />
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          +{stat.label === "Absences ce mois" ? "5%" : "12%"}
                        </div>
                      </div>

                      {/* Valeur principale */}
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
                        <div className="text-3xl font-bold text-gray-900 mb-1">
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
                      <div className="flex items-end justify-between h-6 gap-1">
                        {[65, 70, 68, 75, 80, 78, 85, 90, 88, percentage].map((height, i) => (
                          <div 
                            key={i}
                            className={`flex-1 bg-gradient-to-t ${getStatColorClasses(stat.color)} rounded-t opacity-30 hover:opacity-60 transition-all`}
                            style={{ height: `${(height / 100) * 24}px` }}
                          ></div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
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

              {/* Recent Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Prochains cours</h3>
                  <div className="space-y-3">
                    {[
                      { subject: "Algorithmique", time: "08:00 - 10:00", room: "Salle A101" },
                      { subject: "Base de données", time: "10:30 - 12:30", room: "Salle B205" },
                      { subject: "Réseaux", time: "14:00 - 16:00", room: "Salle C103" }
                    ].map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{course.subject}</p>
                          <p className="text-sm text-gray-600">{course.time} • {course.room}</p>
                        </div>
                        <Calendar className="w-5 h-5 text-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières notes</h3>
                  <div className="space-y-3">
                    {[
                      { subject: "Mathématiques", grade: "15.5/20", date: "15 Déc" },
                      { subject: "Physique", grade: "14.0/20", date: "12 Déc" },
                      { subject: "Informatique", grade: "16.5/20", date: "10 Déc" }
                    ].map((grade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">{grade.subject}</p>
                          <p className="text-sm text-gray-600">{grade.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{grade.grade}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "viewSchedule":
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mon emploi du temps</h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">L'emploi du temps sera bientôt disponible.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "viewGrades":
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Mes notes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Matière</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Note</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Coefficient</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-800">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { subject: "Algorithmique", grade: "15.5", coeff: "3", date: "15/12/2024", status: "Validé" },
                        { subject: "Base de données", grade: "14.0", coeff: "2", date: "12/12/2024", status: "Validé" },
                        { subject: "Réseaux", grade: "16.5", coeff: "3", date: "10/12/2024", status: "Validé" },
                        { subject: "Mathématiques", grade: "13.5", coeff: "4", date: "08/12/2024", status: "En attente" }
                      ].map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-800">{item.subject}</td>
                          <td className="py-3 px-4 text-gray-800 font-medium">{item.grade}/20</td>
                          <td className="py-3 px-4 text-gray-800">{item.coeff}</td>
                          <td className="py-3 px-4 text-gray-600">{item.date}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="mb-4">
                  <div className="inline-block p-4 bg-blue-100 rounded-full">
                    {services.find(s => s.action === currentPage)?.icon &&
                      React.createElement(services.find(s => s.action === currentPage).icon, {
                        className: "w-12 h-12 text-blue-600"
                      })
                    }
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {services.find(s => s.action === currentPage)?.label}
                </h2>
                <p className="text-gray-600 mb-6">
                  {services.find(s => s.action === currentPage)?.description}
                </p>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                  Cette section sera bientôt disponible
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto">
      {/* Page Content - DashboardLayout fournit déjà la sidebar */}
      <main className="p-6">
        <PageContent />
      </main>
    </div>
  );
};

export default StudentDashboard;