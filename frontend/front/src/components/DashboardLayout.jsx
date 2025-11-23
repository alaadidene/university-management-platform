import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [showProfile, setShowProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    departement: user?.departement || "",
  });

  const services = [
    { 
      label: "Tableau de bord", 
      description: "Vue d'ensemble",
      icon: "📊",
      path: "/student-dashboard"
    },
    { 
      label: "Mon emploi du temps", 
      description: "Consulter mon planning",
      icon: "📅",
      path: "/my-schedule"
    },
    { 
      label: "Mes notes", 
      description: "Résultats et bulletins",
      icon: "📚",
      path: "/notes"
    },
    { 
      label: "Statistiques", 
      description: "Analyse de performance",
      icon: "📈",
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
      icon: "✉️",
      path: "/messagerie",
      badge: "7"
    },
    { 
      label: "Bibliothèque", 
      description: "Ressources pédagogiques",
      icon: "📖",
      path: "/bibliotheque"
    },
    { 
      label: "Scolarité", 
      description: "Documents administratifs",
      icon: "📋",
      path: "/scolarite"
    },
  ];

  const handleServiceClick = (service) => {
    navigate(service.path);
  };

  const handleProfileUpdate = () => {
    if (!profileData.prenom || !profileData.nom || !profileData.email) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }
    alert("Profil mis à jour avec succès!");
    setEditingProfile(false);
  };

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #eff6ff)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '280px' : '0',
        transition: 'width 0.3s',
        background: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Sidebar */}
        <div style={{ padding: '6px', background: 'linear-gradient(to right, #4f46e5, #4f46e5)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: '0 0 4px 0' }}>
            Espace Étudiant
          </h1>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#bfdbfe', margin: 0 }}>
            Services
          </h2>
        </div>
        
        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {services.map((service, index) => {
            const isActive = location.pathname === service.path;
            return (
              <button
                key={index}
                onClick={() => handleServiceClick(service)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: 'none',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isActive ? 'linear-gradient(to right, #3b82f6, #6366f1)' : 'transparent',
                  color: isActive ? 'white' : '#374151',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : '#eff6ff',
                  fontSize: '20px'
                }}>
                  {service.icon}
                </div>
                
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {service.label}
                    {service.badge && (
                      <span style={{
                        padding: '2px 6px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        borderRadius: '9999px',
                        fontWeight: 'bold'
                      }}>
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px', color: isActive ? '#bfdbfe' : '#6b7280' }}>
                    {service.description}
                  </div>
                </div>
                
                <span style={{ fontSize: '16px', transition: 'transform 0.2s', transform: isActive ? 'translateX(4px)' : 'translateX(0)' }}>
                  ›
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: 'linear-gradient(to right, #eff6ff, #eef2ff)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
              👤
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.prenom} {user?.nom}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{user?.departement}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ background: 'linear-gradient(to right, #4f46e5, #4f46e5, #4f46e5)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '20px',
                  transition: 'all 0.2s'
                }}
              >
                {sidebarOpen ? '✕' : '☰'}
              </button>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: 'white' }}>
                    {user?.prenom} {user?.nom}
                  </span>
                  <span style={{
                    padding: '4px 12px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    borderRadius: '9999px'
                  }}>
                    Étudiant
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                👤 <span>Profil</span>
              </button>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2563eb',
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                🚪 <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Modal Profil */}
        {showProfile && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50
            }}
            onClick={() => setShowProfile(false)}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                maxWidth: '448px',
                width: '100%',
                margin: '16px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '24px',
                borderBottom: '1px solid #e5e7eb',
                background: 'linear-gradient(to right, #eff6ff, #eef2ff)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
                    👤
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Mon Profil</h3>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  style={{
                    color: '#9ca3af',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px',
                    padding: '4px',
                    borderRadius: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ padding: '24px' }}>
                {editingProfile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Prénom <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.prenom}
                        onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Nom <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Email <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={profileData.telephone}
                        onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Département
                      </label>
                      <input
                        type="text"
                        value={profileData.departement}
                        onChange={(e) => setProfileData({ ...profileData, departement: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                        placeholder="Votre département"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                      <button
                        onClick={handleProfileUpdate}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Prénom:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{user?.prenom}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Nom:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{user?.nom}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Email:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{user?.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Téléphone:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{user?.telephone || "Non spécifié"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Département:</span>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{user?.departement || "Non spécifié"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Rôle:</span>
                      <span style={{
                        padding: '4px 12px',
                        background: 'linear-gradient(to right, #dbeafe, #e0e7ff)',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: '9999px'
                      }}>
                        Étudiant
                      </span>
                    </div>
                    <button
                      onClick={() => setEditingProfile(true)}
                      style={{
                        width: '100%',
                        marginTop: '16px',
                        padding: '10px 16px',
                        background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s'
                      }}
                    >
                      Modifier le profil
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Area - Les pages s'affichent ici */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;