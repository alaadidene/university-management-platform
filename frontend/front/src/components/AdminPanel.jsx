import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DirectorSidebar from "./DirectorSidebar";
import { 
  Users, 
  Search, 
  UserCheck,
} from "lucide-react";
import { safeDisplay } from "../utils/display";

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "enseignants");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    if (user?.role !== "directeur_departement") {
      navigate("/dashboard");
      return;
    }
    loadUsers();
  }, [user, navigate, activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      if (activeTab === "enseignants") {
        const res = await fetch("http://localhost:3002/enseignant", { headers });
        const enseignants = await res.json();

        setUsers(
          enseignants.map((e) => ({
            id: e.id,
            prenom: e.prenom,
            nom: e.nom,
            email: e.email,
            telephone: e.telephone || "",
            departement: e.departement?.nom || "",
            role: e.role || "enseignant",
            cin: e.cin,
          }))
        );
      } else if (activeTab === "etudiants") {
        const res = await fetch("http://localhost:3002/etudiants", { headers });
        const etudiants = await res.json();

        setUsers(
          etudiants.map((e) => ({
            id: e.id,
            prenom: e.prenom,
            nom: e.nom,
            email: e.email,
            telephone: e.telephone || "",
            departement: e.classe?.specialite?.departement?.nom || "",
            role: "etudiant",
            cin: e.cin,
            classe: e.classe?.nom || "",
          }))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleLabel = (role) => {
    const map = {
      etudiant: "Étudiant",
      enseignant: "Enseignant",
      directeur_departement: "Directeur de Département",
      administratif: "Administratif",
    };
    return map[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const map = {
      etudiant: "bg-blue-100 text-blue-700",
      enseignant: "bg-green-100 text-green-700",
      directeur_departement: "bg-purple-100 text-purple-700",
      administratif: "bg-orange-100 text-orange-700",
    };
    return map[role] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <DirectorSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-blue-600" size={28} />
                Panneau d'Administration
              </h1>
              <p className="text-sm text-gray-500 mt-1">Gestion des utilisateurs</p>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* TABS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("enseignants");
                setSearchParams({ tab: "enseignants" });
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "enseignants"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              👨‍🏫 Enseignants
            </button>
            <button
              onClick={() => {
                setActiveTab("etudiants");
                setSearchParams({ tab: "etudiants" });
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "etudiants"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              👨‍🎓 Étudiants
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Search */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500"
                />
              </div>

              {/* Filter Role */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="etudiant">Étudiants</option>
                <option value="enseignant">Enseignants</option>
                <option value="administratif">Administratifs</option>
                <option value="directeur_departement">Directeurs</option>
              </select>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nom complet</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Téléphone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Département</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rôle</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                          {user.prenom?.charAt(0)}
                          {user.nom?.charAt(0)}
                        </div>
                        <div className="font-medium text-gray-900">
                          {user.prenom} {user.nom}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.telephone || "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {safeDisplay(user.departement, "-")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>

                    {/* Actions supprimées */}
                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserCheck size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
              <p className="text-sm text-gray-400 mt-1">
                Aucun utilisateur correspondant aux filtres.
              </p>
            </div>
          )}
        </div>

      </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
