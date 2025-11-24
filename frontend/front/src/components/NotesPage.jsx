import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, TrendingUp, Award, AlertCircle, Download } from 'lucide-react';

const NotesPage = () => {
  const { user } = useAuth();
  const [semestre, setSemestre] = useState(1);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [semestre]);

  const loadNotes = async () => {
    setLoading(true);
    // Simulation de chargement depuis l'API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Données simulées
    const notesData = semestre === 1 ? [
      { id: 1, matiere: 'Mathématiques', note: 15.5, coef: 3, status: 'Validé', enseignant: 'Dr. Ahmed Ben Salem', date: '2024-10-15' },
      { id: 2, matiere: 'Programmation Avancée', note: 17, coef: 4, status: 'Validé', enseignant: 'Prof. Fatma Touati', date: '2024-10-20' },
      { id: 3, matiere: 'Base de données', note: 13, coef: 3, status: 'Validé', enseignant: 'Dr. Mohamed Trabelsi', date: '2024-10-18' },
      { id: 4, matiere: 'Réseaux Informatiques', note: 14.5, coef: 2, status: 'Validé', enseignant: 'Dr. Salma Karoui', date: '2024-10-22' },
      { id: 5, matiere: 'Architecture des Ordinateurs', note: 16, coef: 3, status: 'Validé', enseignant: 'Prof. Karim Gharbi', date: '2024-10-25' },
      { id: 6, matiere: 'Systèmes d\'Exploitation', note: 12, coef: 3, status: 'Validé', enseignant: 'Dr. Leila Mansour', date: '2024-10-28' },
    ] : [
      { id: 7, matiere: 'Algorithmes Avancés', note: 16.5, coef: 4, status: 'Validé', enseignant: 'Prof. Nizar Hamdi', date: '2024-03-10' },
      { id: 8, matiere: 'Génie Logiciel', note: 15, coef: 3, status: 'Validé', enseignant: 'Dr. Amira Bouaziz', date: '2024-03-15' },
      { id: 9, matiere: 'Intelligence Artificielle', note: 18, coef: 4, status: 'Validé', enseignant: 'Prof. Youssef Mejri', date: '2024-03-20' },
      { id: 10, matiere: 'Sécurité Informatique', note: 14, coef: 3, status: 'Validé', enseignant: 'Dr. Sonia Jebali', date: '2024-03-18' },
      { id: 11, matiere: 'Développement Web', note: 17.5, coef: 3, status: 'Validé', enseignant: 'Prof. Riadh Khelifi', date: '2024-03-22' },
    ];
    
    setNotes(notesData);
    setLoading(false);
  };

  const calculateMoyenne = () => {
    if (notes.length === 0) return 0;
    const totalPoints = notes.reduce((sum, note) => sum + (note.note * note.coef), 0);
    const totalCoef = notes.reduce((sum, note) => sum + note.coef, 0);
    return (totalPoints / totalCoef).toFixed(2);
  };

  const getStatusColor = (note) => {
    if (note >= 16) return 'bg-green-100 text-green-700';
    if (note >= 12) return 'bg-blue-100 text-blue-700';
    if (note >= 10) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const downloadNotes = () => {
    const moyenne = calculateMoyenne();
    const modulesValides = notes.filter(n => n.note >= 10).length;
    
    // Créer le contenu CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "RELEVE DE NOTES\n";
    csvContent += `Etudiant: ${user?.prenom || ''} ${user?.nom || ''}\n`;
    csvContent += `Semestre: ${semestre}\n`;
    csvContent += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;
    csvContent += "Matière,Enseignant,Note,Coefficient,Date,Statut\n";
    
    notes.forEach(note => {
      csvContent += `"${note.matiere}","${note.enseignant}",${note.note},${note.coef},"${new Date(note.date).toLocaleDateString('fr-FR')}","${note.status}"\n`;
    });
    
    csvContent += `\nMoyenne Générale:,${moyenne}/20\n`;
    csvContent += `Modules Validés:,${modulesValides}/${notes.length}\n`;
    csvContent += `Taux de Réussite:,${((modulesValides / notes.length) * 100).toFixed(0)}%\n`;
    
    // Créer le lien de téléchargement
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `releve_notes_semestre${semestre}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de vos notes...</p>
        </div>
      </div>
    );
  }

  const moyenne = calculateMoyenne();

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Mes Notes
          </h1>
          <p className="text-gray-600">Consultez vos résultats et bulletins</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Moyenne Générale</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{moyenne}/20</div>
            <div className="text-xs text-gray-500 mt-1">Semestre {semestre}</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Modules Validés</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{notes.filter(n => n.note >= 10).length}/{notes.length}</div>
            <div className="text-xs text-gray-500 mt-1">Taux: {((notes.filter(n => n.note >= 10).length / notes.length) * 100).toFixed(0)}%</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Total Modules</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{notes.length}</div>
            <div className="text-xs text-gray-500 mt-1">Modules évalués</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-600">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-sm font-semibold text-gray-500">À Améliorer</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{notes.filter(n => n.note < 12).length}</div>
            <div className="text-xs text-gray-500 mt-1">Notes &lt; 12/20</div>
          </div>
        </div>

        {/* Sélecteur de semestre */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Détails des notes</h2>
          <div className="flex gap-3 items-center">
            <select
              value={semestre}
              onChange={(e) => setSemestre(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value={1}>Semestre 1</option>
              <option value={2}>Semestre 2</option>
            </select>
            <button 
              onClick={downloadNotes}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>

        {/* Table des notes */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Matière</th>
                <th className="px-6 py-4 text-left font-semibold">Enseignant</th>
                <th className="px-6 py-4 text-center font-semibold">Note</th>
                <th className="px-6 py-4 text-center font-semibold">Coef.</th>
                <th className="px-6 py-4 text-center font-semibold">Date</th>
                <th className="px-6 py-4 text-center font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, idx) => (
                <tr key={note.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{note.matiere}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{note.enseignant}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-4 py-2 rounded-full font-bold text-lg ${getStatusColor(note.note)}`}>
                      {note.note}/20
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-semibold">
                      {note.coef}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {new Date(note.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      note.note >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {note.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Légende des couleurs</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Excellent (≥ 16)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Bien (12-16)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Passable (10-12)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Insuffisant (&lt; 10)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;