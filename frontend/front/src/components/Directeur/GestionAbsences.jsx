import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GestionAbsences.css';

function GestionAbsences({ token }) {
  const [absences, setAbsences] = useState([]);
  const [etudiantsARisque, setEtudiantsARisque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('absences'); // 'absences' ou 'risque'
  const [filter, setFilter] = useState('all'); // 'all', 'non_justifiee', 'en_attente', 'justifiee'

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    if (!token) {
      alert('❌ Token manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const [absencesRes, risqueRes] = await Promise.all([
        axios.get('http://localhost:3003/absences', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3003/absences/etudiants-a-risque', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAbsences(absencesRes.data);
      setEtudiantsARisque(risqueRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      if (err.response?.status === 401) {
        alert('❌ Session expirée. Veuillez vous reconnecter.');
      } else {
        alert('Erreur lors du chargement des données: ' + (err.response?.data?.message || err.message));
      }
      setLoading(false);
    }
  };

  const validerJustification = async (absenceId, valide) => {
    if (!token) {
      alert('❌ Token manquant. Veuillez vous reconnecter.');
      return;
    }
    
    try {
      await axios.patch(`http://localhost:3003/absences/${absenceId}/valider`, {
        valide,
        commentaireDirecteur: valide ? 'Justification acceptée' : 'Justification refusée'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(valide ? '✅ Justification validée' : '❌ Justification refusée');
      loadData();
    } catch (err) {
      console.error('Erreur validation:', err);
      if (err.response?.status === 401) {
        alert('❌ Session expirée. Veuillez vous reconnecter.');
      } else {
        alert('Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
      }
    }
  };

  const filteredAbsences = absences.filter(abs => {
    if (filter === 'all') return true;
    return abs.statut === filter;
  });

  const absencesEnAttente = absences.filter(abs => abs.statut === 'en_attente').length;

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="gestion-absences">
      <h1>🎓 Gestion des Absences</h1>

      <div className="dashboard">
        <div className="stat-card">
          <div className="stat-value">{absences.length}</div>
          <div className="stat-label">Total absences</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{absencesEnAttente}</div>
          <div className="stat-label">En attente</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{etudiantsARisque.length}</div>
          <div className="stat-label">Étudiants à risque</div>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'absences' ? 'active' : ''}
          onClick={() => setActiveTab('absences')}
        >
          📋 Toutes les absences
        </button>
        <button 
          className={activeTab === 'risque' ? 'active' : ''}
          onClick={() => setActiveTab('risque')}
        >
          ⚠️ Étudiants à risque ({etudiantsARisque.length})
        </button>
      </div>

      {activeTab === 'absences' && (
        <div className="absences-section">
          <div className="filters">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              Toutes
            </button>
            <button 
              className={filter === 'non_justifiee' ? 'active' : ''}
              onClick={() => setFilter('non_justifiee')}
            >
              Non justifiées
            </button>
            <button 
              className={filter === 'en_attente' ? 'active' : ''}
              onClick={() => setFilter('en_attente')}
            >
              En attente
            </button>
            <button 
              className={filter === 'justifiee' ? 'active' : ''}
              onClick={() => setFilter('justifiee')}
            >
              Justifiées
            </button>
          </div>

          <div className="absences-table">
            {filteredAbsences.length === 0 ? (
              <p className="no-data">Aucune absence trouvée</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Étudiant</th>
                    <th>Matière</th>
                    <th>Heures</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbsences.map(abs => (
                    <tr key={abs.id}>
                      <td>{new Date(abs.dateAbsence).toLocaleDateString('fr-FR')}</td>
                      <td>Étudiant #{abs.etudiantId}</td>
                      <td>Matière #{abs.matiereId}</td>
                      <td>{abs.nbHeures}h</td>
                      <td>
                        <span className={`status-badge ${abs.statut}`}>
                          {abs.statut === 'non_justifiee' && '❌ Non justifiée'}
                          {abs.statut === 'justifiee' && '✅ Justifiée'}
                          {abs.statut === 'en_attente' && '⏳ En attente'}
                          {abs.statut === 'refusee' && '🚫 Refusée'}
                        </span>
                      </td>
                      <td>
                        {abs.statut === 'en_attente' && (
                          <div className="action-buttons">
                            <button 
                              className="btn-valider"
                              onClick={() => validerJustification(abs.id, true)}
                            >
                              ✅ Valider
                            </button>
                            <button 
                              className="btn-refuser"
                              onClick={() => validerJustification(abs.id, false)}
                            >
                              ❌ Refuser
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'risque' && (
        <div className="risque-section">
          {etudiantsARisque.length === 0 ? (
            <div className="no-data">
              <p>✅ Aucun étudiant à risque</p>
            </div>
          ) : (
            <div className="etudiants-risque-grid">
              {etudiantsARisque.map(etu => (
                <div key={`${etu.etudiantId}-${etu.matiereId}`} className="etudiant-card">
                  <div className="card-header">
                    <h3>Étudiant #{etu.etudiantId}</h3>
                    <span className="badge danger">⚠️ RISQUE</span>
                  </div>
                  
                  <div className="card-body">
                    <p><strong>Matière:</strong> #{etu.matiereId}</p>
                    <p><strong>Absences non justifiées:</strong> {etu.nbAbsences}</p>
                    <p><strong>Pourcentage:</strong> {etu.pourcentage}%</p>
                    
                    <div className="progress-bar">
                      <div 
                        className="progress-fill danger"
                        style={{ width: `${etu.pourcentage}%` }}
                      />
                    </div>
                    
                    <p className="message">{etu.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GestionAbsences;
