import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import MarquerAbsences from '../components/Enseignant/MarquerAbsences';

function MarquerAbsencesWrapper() {
  const { user } = useAuth();
  const { seanceId } = useParams();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  
  // Ces valeurs devraient normalement venir de l'emploi du temps
  // Pour l'instant, on les passe par l'URL ou on les récupère du contexte
  const searchParams = new URLSearchParams(window.location.search);
  const classeId = searchParams.get('classeId');
  const matiereId = searchParams.get('matiereId');
  const seanceDate = searchParams.get('date');
  const heureDebut = searchParams.get('heureDebut');
  const heureFin = searchParams.get('heureFin');
  const classeNom = searchParams.get('classeNom');
  const matiereNom = searchParams.get('matiereNom');
  
  if (!user || !token) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Impossible de charger vos données</p>
        <button onClick={() => navigate('/login')}>Retour à la connexion</button>
      </div>
    );
  }
  
  if (!classeId || !matiereId) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>⚠️ Informations manquantes (classe ou matière)</p>
        <p>Veuillez accéder à cette page depuis l'emploi du temps</p>
        <button onClick={() => navigate('/my-schedule')}>Voir mon emploi du temps</button>
      </div>
    );
  }
  
  return (
    <MarquerAbsences 
      seanceId={seanceId} 
      classeId={classeId} 
      matiereId={matiereId} 
      classeNom={classeNom}
      matiereNom={matiereNom}
      seanceDate={seanceDate}
      heureDebut={heureDebut}
      heureFin={heureFin}
      token={token} 
    />
  );
}

export default MarquerAbsencesWrapper;
