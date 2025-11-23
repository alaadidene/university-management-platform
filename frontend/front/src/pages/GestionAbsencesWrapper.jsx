import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GestionAbsences from '../components/Directeur/GestionAbsences';

function GestionAbsencesWrapper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Impossible de charger vos données</p>
        <button onClick={() => navigate('/login')}>Retour à la connexion</button>
      </div>
    );
  }
  
  return <GestionAbsences token={token} />;
}

export default GestionAbsencesWrapper;
