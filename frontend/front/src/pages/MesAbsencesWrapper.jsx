import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MesAbsences from '../components/Etudiant/MesAbsences';

function MesAbsencesWrapper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  
  if (!user || !user.id) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Impossible de charger vos données</p>
        <button onClick={() => navigate('/login')}>Retour à la connexion</button>
      </div>
    );
  }
  
  return <MesAbsences etudiantId={user.id} token={token} />;
}

export default MesAbsencesWrapper;
