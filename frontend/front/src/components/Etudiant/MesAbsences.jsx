import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './MesAbsences.css';

function MesAbsences() {
  const { user } = useAuth();
  const etudiantId = user?.id;
  const token = localStorage.getItem('token');
  
  const [statutMatieres, setStatutMatieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Charger les absences au montage et toutes les 10 secondes si autoRefresh est activé
  useEffect(() => {
    loadAbsences();
    
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        console.log('🔄 Rafraîchissement automatique des absences...');
        loadAbsences();
      }, 10000); // 10 secondes pour temps réel
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [etudiantId, token, autoRefresh]);

  const loadAbsences = () => {
    if (!token) {
      setError('Token d\'authentification manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }
    
    setLoading(false); // Ne pas afficher le loading à chaque refresh
    setError(null);
    
    // Utiliser l'endpoint qui existe vraiment
    axios.get(`http://localhost:3003/absences/etudiant/${etudiantId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Grouper les absences par matière
      const absencesParMatiere = {};
      res.data.forEach(absence => {
        const matiereId = absence.matiereId || absence.matiere?.id || 'Inconnu';
        const matiereNom = absence.matiere?.nom || `Matière ${matiereId}`;
        
        if (!absencesParMatiere[matiereId]) {
          absencesParMatiere[matiereId] = {
            matiereId,
            matiereNom,
            nbAbsencesNonJustifiees: 0,
            nbAbsencesJustifiees: 0,
            totalHeures: 0,
            absences: []
          };
        }
        
        absencesParMatiere[matiereId].absences.push(absence);
        absencesParMatiere[matiereId].totalHeures += absence.nbHeures || 0;
        
        if (absence.justifiee) {
          absencesParMatiere[matiereId].nbAbsencesJustifiees++;
        } else {
          absencesParMatiere[matiereId].nbAbsencesNonJustifiees++;
        }
      });
      
      // Calculer le statut d'élimination (3 absences = éliminé)
      const statutMatieres = Object.values(absencesParMatiere).map(matiere => ({
        ...matiere,
        elimine: matiere.absences.length >= 3,
        risque: matiere.absences.length === 2
      }));
      
      setStatutMatieres(statutMatieres);
    })
    .catch(err => {
      console.error('Erreur lors du chargement des absences:', err);
      if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
      } else if (err.response?.status === 403) {
        setError('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement des absences');
      }
    });
  };

  const justifierAbsence = async (absenceId) => {
    const raison = prompt('Raison de la justification:');
    if (!raison) return;

    if (!token) {
      alert('❌ Token manquant. Veuillez vous reconnecter.');
      return;
    }

    try {
      await axios.post(`http://localhost:3003/absences/${absenceId}/justifier`, {
        raison,
        typeJustificatif: 'medical' // ou 'administratif', 'autre'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Justification envoyée, en attente de validation');
      loadAbsences(); // Recharger les données
    } catch (err) {
      console.error('Erreur justification:', err);
      if (err.response?.status === 401) {
        alert('❌ Session expirée. Veuillez vous reconnecter.');
      } else {
        alert('❌ Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
      }
    }
  };

  if (loading) {
    return <div className="loading">⏳ Chargement de vos absences...</div>;
  }

  if (error) {
    return <div className="error">❌ {error}</div>;
  }

  const totalAbsences = statutMatieres.reduce((sum, m) => sum + m.nbAbsencesNonJustifiees + m.nbAbsencesJustifiees, 0);
  const matieresEliminees = statutMatieres.filter(m => m.elimine).length;
  const matieresARisque = statutMatieres.filter(m => m.risque && !m.elimine).length;

  return (
    <div className="mes-absences">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>📊 Mes Absences</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Actualisation auto (10s)
          </label>
          <button 
            onClick={() => loadAbsences()} 
            style={{
              padding: '8px 16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>
      
      <div className="dashboard">
        <div className="stat-card">
          <div className="stat-value">{totalAbsences}</div>
          <div className="stat-label">Total absences</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{matieresARisque}</div>
          <div className="stat-label">Matières à risque</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-value">{matieresEliminees}</div>
          <div className="stat-label">Matières éliminées</div>
        </div>
      </div>

      {statutMatieres.length === 0 ? (
        <div className="no-absences">
          <div className="success-icon">✅</div>
          <h2>Félicitations!</h2>
          <p>Vous n'avez aucune absence enregistrée</p>
        </div>
      ) : (
        <div className="matieres-list">
          {statutMatieres.map(matiere => (
            <div 
              key={matiere.matiereId} 
              className={`matiere-card ${matiere.elimine ? 'elimine' : matiere.risque ? 'risque' : 'ok'}`}
            >
              <div className="matiere-header">
                <h3>{matiere.matiereNom || `Matière #${matiere.matiereId}`}</h3>
                
                <div className="statut-badge">
                  {matiere.elimine ? (
                    <span className="badge elimine">🚫 ÉLIMINÉ</span>
                  ) : matiere.risque ? (
                    <span className="badge risque">⚠️ RISQUE</span>
                  ) : (
                    <span className="badge ok">✅ OK</span>
                  )}
                </div>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(matiere.nbAbsencesNonJustifiees / 3) * 100}%` }}
                />
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Absences non justifiées</span>
                  <span className="detail-value danger-text">{matiere.nbAbsencesNonJustifiees}/3</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Absences justifiées</span>
                  <span className="detail-value success-text">{matiere.nbAbsencesJustifiees}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total heures</span>
                  <span className="detail-value">{matiere.totalHeures}h ({matiere.pourcentage}%)</span>
                </div>
              </div>

              <div className={`message-box ${matiere.elimine ? 'elimine' : matiere.risque ? 'risque' : 'ok'}`}>
                {matiere.message}
              </div>

              {matiere.absences && matiere.absences.length > 0 && (
                <div className="absences-detail">
                  <h4>📋 Détail des absences:</h4>
                  <div className="absences-timeline">
                    {matiere.absences.map(abs => (
                      <div key={abs.id} className={`absence-item statut-${abs.statut}`}>
                        <div className="absence-date">
                          <strong>{new Date(abs.dateAbsence).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}</strong>
                          <span className="absence-hours">{abs.nbHeures}h</span>
                        </div>
                        
                        <div className="absence-status">
                          {abs.statut === 'non_justifiee' && (
                            <>
                              <span className="status-label">❌ Non justifiée</span>
                              <button 
                                className="btn-justify"
                                onClick={() => justifierAbsence(abs.id)}
                              >
                                Justifier
                              </button>
                            </>
                          )}
                          {abs.statut === 'justifiee' && (
                            <span className="status-label success">✅ Justifiée</span>
                          )}
                          {abs.statut === 'en_attente' && (
                            <span className="status-label warning">⏳ En attente de validation</span>
                          )}
                          {abs.statut === 'refusee' && (
                            <span className="status-label danger">🚫 Justification refusée</span>
                          )}
                        </div>
                        
                        {abs.commentaire && (
                          <div className="absence-comment">
                            <em>"{abs.commentaire}"</em>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MesAbsences;
