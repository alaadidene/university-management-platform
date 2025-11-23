import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './MarquerAbsences.css';

function MarquerAbsences({
  seanceId,
  classeId,
  matiereId,
  classeNom,
  matiereNom,
  seanceDate,
  heureDebut,
  heureFin,
  token
}) {
  const [etudiants, setEtudiants] = useState([]);
  const [absents, setAbsents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [commentaire, setCommentaire] = useState('');
  const [etudiantsWithAbsences, setEtudiantsWithAbsences] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  const absenceDate = seanceDate || new Date().toISOString().split('T')[0];

  const nbHeuresSeance = useMemo(() => {
    if (!heureDebut || !heureFin) return 2;
    const [sh, sm] = heureDebut.split(':').map(Number);
    const [eh, em] = heureFin.split(':').map(Number);
    const diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMinutes <= 0) {
      return 2;
    }
    return Math.max(1, Math.round(diffMinutes / 60));
  }, [heureDebut, heureFin]);

  useEffect(() => {
    if (!token) {
      alert('❌ Token manquant. Veuillez vous reconnecter.');
      setLoadingData(false);
      return;
    }

    if (!classeId) {
      alert('❌ Classe introuvable. Veuillez revenir à votre emploi du temps.');
      setLoadingData(false);
      return;
    }
    
    // Charger la liste des étudiants de la classe
    axios.get(`http://localhost:3002/etudiants`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Filtrer les étudiants de cette classe
      const etudiantsClasse = res.data.filter(etu => 
        etu.classeId === classeId || etu.classe?.id === classeId
      );
      setEtudiants(etudiantsClasse);
      // Charger les absences pour chaque étudiant
      loadAbsencesForStudents(etudiantsClasse);
      setLoadingData(false);
    })
    .catch(err => {
      console.error('Erreur chargement étudiants:', err);
      if (err.response?.status === 401) {
        alert('❌ Session expirée. Veuillez vous reconnecter.');
      } else {
        alert('❌ Erreur lors du chargement des étudiants: ' + (err.response?.data?.message || err.message));
      }
      setLoadingData(false);
    });
  }, [classeId, token]);

  const loadAbsencesForStudents = async (students) => {
    if (!matiereId || students.length === 0) return;
    
    try {
      const promises = students.map(etu => 
        axios.get(`http://localhost:3003/absences/etudiant/${etu.id}/total-heures?matiereId=${matiereId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => ({
          etudiantId: etu.id,
          totalHeures: res.data.totalHeures || 0,
          totalAbsences: res.data.count || 0
        }))
        .catch(() => ({
          etudiantId: etu.id,
          totalHeures: 0,
          totalAbsences: 0
        }))
      );
      
      const absencesData = await Promise.all(promises);
      setEtudiantsWithAbsences(absencesData);
    } catch (err) {
      console.error('Erreur chargement absences:', err);
    }
  };

  const toggleAbsent = (etudiantId) => {
    if (absents.includes(etudiantId)) {
      setAbsents(absents.filter(id => id !== etudiantId));
    } else {
      setAbsents([...absents, etudiantId]);
    }
  };

  const handleSubmit = async () => {
    if (absents.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un étudiant absent');
      return;
    }

    if (!token) {
      alert('❌ Token manquant. Veuillez vous reconnecter.');
      return;
    }

    setLoading(true);
    try {
      for (const etudiantId of absents) {
        await axios.post('http://localhost:3003/absences', {
          etudiantId: Number(etudiantId),
          matiereId: Number(matiereId),
          dateAbsence: absenceDate,
          nbHeures: nbHeuresSeance,
          heureDebut,
          heureFin,
          commentaire: commentaire || undefined,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      const etudiantsNames = etudiants
        .filter(e => absents.includes(e.id))
        .map(e => `${e.nom} ${e.prenom}`)
        .join(', ');
      
      alert(`✅ ${absents.length} absence(s) enregistrée(s) avec succès!\n\nÉtudiants: ${etudiantsNames}\n\nℹ️ Les étudiants peuvent maintenant consulter leurs absences dans leur compte.`);
      setAbsents([]);
      setCommentaire('');
      // Recharger les absences après enregistrement
      loadAbsencesForStudents(etudiants);
      setShowSummary(true);
    } catch (err) {
      console.error('Erreur enregistrement absences:', err);
      if (err.response?.status === 401) {
        alert('❌ Session expirée. Veuillez vous reconnecter.');
      } else {
        alert('❌ Erreur: ' + (err.response?.data?.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="loading">Chargement des étudiants...</div>;
  }

  const getAbsenceInfo = (etudiantId) => {
    return etudiantsWithAbsences.find(a => a.etudiantId === etudiantId) || { totalHeures: 0, totalAbsences: 0 };
  };

  return (
    <div className="marquer-absences">
      <h2>📝 Marquer les absences</h2>
      
      <div className="info-section">
        <p><strong>Séance:</strong> {seanceDate 
          ? new Date(seanceDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : new Date().toLocaleDateString('fr-FR')}</p>
        <p><strong>Horaire:</strong> {heureDebut || '--:--'} - {heureFin || '--:--'} ({nbHeuresSeance}h)</p>
        <p><strong>Classe:</strong> {classeNom || classeId}</p>
        <p><strong>Matière:</strong> {matiereNom || matiereId}</p>
        <p><strong>Étudiants dans la classe:</strong> {etudiants.length}</p>
        <p><strong>Absents sélectionnés:</strong> {absents.length}</p>
      </div>

      <div className="etudiants-list">
        {etudiants.length === 0 ? (
          <p className="no-data">Aucun étudiant trouvé dans cette classe</p>
        ) : (
          etudiants.map(etu => {
            const absenceInfo = getAbsenceInfo(etu.id);
            return (
              <label key={etu.id} className={absents.includes(etu.id) ? 'selected' : ''}>
                <input
                  type="checkbox"
                  checked={absents.includes(etu.id)}
                  onChange={() => toggleAbsent(etu.id)}
                />
                <span className="student-info">
                  <strong>{etu.nom} {etu.prenom}</strong>
                  <small>{etu.email}</small>
                  <small className="absence-stats">
                    📊 {absenceInfo.totalAbsences} absence(s) · {absenceInfo.totalHeures}h total
                  </small>
                </span>
              </label>
            );
          })
        )}
      </div>

      <div className="form-group">
        <label>Commentaire (optionnel):</label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Raison de l'absence, contexte..."
          rows="3"
        />
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={loading || absents.length === 0}
        className="btn-primary"
      >
        {loading ? '⏳ Enregistrement...' : `✅ Enregistrer ${absents.length > 0 ? `(${absents.length})` : ''}`}
      </button>

      {showSummary && etudiantsWithAbsences.length > 0 && (
        <div className="absence-summary">
          <h3>📊 Récapitulatif des absences (cette matière)</h3>
          <div className="summary-grid">
            {etudiants.map(etu => {
              const info = getAbsenceInfo(etu.id);
              if (info.totalAbsences === 0) return null;
              return (
                <div key={etu.id} className="summary-card">
                  <strong>{etu.nom} {etu.prenom}</strong>
                  <div className="stats">
                    <span>📅 {info.totalAbsences} absence(s)</span>
                    <span>⏱️ {info.totalHeures} heures</span>
                    {info.totalHeures >= 10 && (
                      <span className="warning">⚠️ Risque d'élimination</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MarquerAbsences;
