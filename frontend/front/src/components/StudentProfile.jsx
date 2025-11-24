import React, { useState } from "react";
import { User } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';

const StudentProfile = () => {
  const { user } = useAuth();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    prenom: user?.prenom || "",
    nom: user?.nom || "",
    email: user?.email || "",
    cin: user?.cin || "",
    classe: user?.classe?.nom || "",
  });

  const handleProfileUpdate = () => {
    if (!profileData.prenom || !profileData.nom || !profileData.email) {
      // Validation silencieuse - les champs requis sont marqués avec *
      return;
    }

    // Mise à jour réussie - pas d'alert
    setEditingProfile(false);
    // Ici on pourrait ajouter la logique pour sauvegarder les données
  };

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
              <p className="text-blue-100 mt-1">Étudiant</p>
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
                <User size={18} />
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
                disabled={!editingProfile}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !editingProfile ? 'bg-gray-50 text-gray-600' : ''
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
              <input
                type="text"
                value={profileData.classe || "Chargement..."}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
              <input
                type="text"
                value="Étudiant"
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

export default StudentProfile;