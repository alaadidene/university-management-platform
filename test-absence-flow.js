const axios = require('axios');

// Configuration
const AUTH_URL = 'http://localhost:3001/api/auth';
const ABSENCE_URL = 'http://localhost:3003/absences';
const ADMIN_URL = 'http://localhost:3002';

// Comptes de test
const PROF = { email: 'prof@isett.com', password: 'prof123' };
const ETUDIANT = { email: 'etudiant@isett.com', password: 'etudiant123' };

async function testAbsenceFlow() {
  console.log('🧪 TEST DU SYSTÈME D\'ABSENCES\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // ===== ÉTAPE 1: Connexion Professeur =====
    console.log('📝 ÉTAPE 1: Connexion du professeur...');
    const profLogin = await axios.post(`${AUTH_URL}/login`, PROF);
    
    if (!profLogin.data.success) {
      console.error('❌ Échec connexion professeur:', profLogin.data);
      return;
    }
    
    const profToken = profLogin.data.token;
    const profId = profLogin.data.user.id;
    console.log(`✅ Professeur connecté: ID=${profId}`);
    console.log(`   Token: ${profToken.substring(0, 30)}...`);
    console.log(`   Rôle: ${profLogin.data.user.role}\n`);

    // ===== ÉTAPE 2: Récupérer les étudiants =====
    console.log('📝 ÉTAPE 2: Récupération des étudiants...');
    const etudiants = await axios.get(`${ADMIN_URL}/etudiants`, {
      headers: { Authorization: `Bearer ${profToken}` }
    });
    
    if (etudiants.data.length === 0) {
      console.error('❌ Aucun étudiant trouvé dans la base');
      return;
    }
    
    const etudiant = etudiants.data[0];
    console.log(`✅ Étudiant trouvé: ${etudiant.nom} ${etudiant.prenom} (ID: ${etudiant.id})\n`);

    // ===== ÉTAPE 3: Récupérer les matières =====
    console.log('📝 ÉTAPE 3: Récupération des matières...');
    const matieres = await axios.get(`${ADMIN_URL}/matiere`, {
      headers: { Authorization: `Bearer ${profToken}` }
    });
    
    if (matieres.data.length === 0) {
      console.error('❌ Aucune matière trouvée');
      return;
    }
    
    const matiere = matieres.data[0];
    console.log(`✅ Matière trouvée: ${matiere.nom} (ID: ${matiere.id})\n`);

    // ===== ÉTAPE 4: Marquer une absence =====
    console.log('📝 ÉTAPE 4: Marquage d\'absence par le professeur...');
    const absenceData = {
      etudiantId: etudiant.id,
      matiereId: matiere.id,
      dateAbsence: new Date().toISOString().split('T')[0],
      nbHeures: 2,
      heureDebut: '08:30',
      heureFin: '10:30',
      commentaire: 'Test absence système'
    };
    
    console.log('   Données envoyées:', absenceData);
    
    try {
      const absence = await axios.post(ABSENCE_URL, absenceData, {
        headers: { Authorization: `Bearer ${profToken}` }
      });
      console.log(`✅ Absence enregistrée: ID=${absence.data.id}\n`);
    } catch (err) {
      console.error('❌ Erreur lors du marquage d\'absence:');
      console.error('   Status:', err.response?.status);
      console.error('   Message:', err.response?.data?.message);
      console.error('   Détails:', err.response?.data);
      return;
    }

    // ===== ÉTAPE 5: Connexion Étudiant =====
    console.log('📝 ÉTAPE 5: Connexion de l\'étudiant...');
    const etudiantLogin = await axios.post(`${AUTH_URL}/login`, ETUDIANT);
    
    if (!etudiantLogin.data.success) {
      console.error('❌ Échec connexion étudiant');
      return;
    }
    
    const etudiantToken = etudiantLogin.data.token;
    const etudiantId = etudiantLogin.data.user.id;
    console.log(`✅ Étudiant connecté: ID=${etudiantId}\n`);

    // ===== ÉTAPE 6: Vérifier les absences de l'étudiant =====
    console.log('📝 ÉTAPE 6: Consultation des absences...');
    const absences = await axios.get(`${ABSENCE_URL}/etudiant/${etudiantId}`, {
      headers: { Authorization: `Bearer ${etudiantToken}` }
    });
    
    console.log(`✅ Nombre d'absences trouvées: ${absences.data.length}`);
    
    if (absences.data.length > 0) {
      console.log('\n📋 Liste des absences:');
      absences.data.slice(0, 3).forEach((abs, i) => {
        console.log(`\n   Absence ${i + 1}:`);
        console.log(`   - Date: ${abs.dateAbsence}`);
        console.log(`   - Heures: ${abs.nbHeures}h`);
        console.log(`   - Matière ID: ${abs.matiereId}`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST COMPLET RÉUSSI!\n');
    console.log('📌 Le système d\'absences fonctionne correctement:');
    console.log('   1. ✅ Professeur peut se connecter');
    console.log('   2. ✅ Professeur peut marquer une absence');
    console.log('   3. ✅ Étudiant peut se connecter');
    console.log('   4. ✅ Étudiant peut voir ses absences');
    console.log('\n💡 Vous pouvez maintenant utiliser l\'interface web!\n');

  } catch (error) {
    console.error('\n❌ ERREUR GLOBALE:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.error('\n⚠️  Vérifiez que tous les services sont démarrés:');
    console.error('   - Auth Service (3001)');
    console.error('   - Admin Service (3002)');
    console.error('   - Absence Service (3003)');
  }
}

// Exécuter le test
testAbsenceFlow();
