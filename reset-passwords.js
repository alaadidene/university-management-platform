const bcrypt = require('bcrypt');
const { Client } = require('pg');

// Liste des utilisateurs avec leurs nouveaux mots de passe
const users = [
  { email: 'mohamed.bensalem@iset-tozeur.tn', password: 'admin123', role: 'administratif' },
  { email: 'director@isett.com', password: 'director123', role: 'directeur_departement' },
  { email: 'haithemhafsi@gmail.com', password: 'director123', role: 'directeur_departement' },
  { email: 'admin@isett.com', password: 'admin123', role: 'admin' },
  { email: 'prof@isett.com', password: 'prof123', role: 'enseignant' },
  { email: 'etudiant@isett.com', password: 'etudiant123', role: 'etudiant' },
  { email: 'Manel@isett.com', password: 'prof123', role: 'enseignant' }
];

async function resetPasswords() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'university_db'
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');
    
    // Vérifier la structure de la table
    const tableInfo = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'utilisateur'
    `);
    console.log('\n📋 Colonnes de la table utilisateur:');
    tableInfo.rows.forEach(row => console.log('  -', row.column_name));
    
    console.log('\n📝 Réinitialisation des mots de passe...\n');

    for (const user of users) {
      // Générer le hash du mot de passe
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Mettre à jour dans la base de données
      const result = await client.query(
        'UPDATE utilisateur SET mdp_hash = $1, doit_changer_mdp = false WHERE email = $2',
        [hashedPassword, user.email]
      );

      if (result.rowCount > 0) {
        console.log(`✅ ${user.role.padEnd(25)} | ${user.email.padEnd(35)} | Mot de passe: ${user.password}`);
      } else {
        console.log(`❌ ${user.role.padEnd(25)} | ${user.email.padEnd(35)} | Utilisateur non trouvé`);
      }
    }

    console.log('\n✅ Réinitialisation terminée!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 RÉSUMÉ DES COMPTES DE TEST:\n');
    console.log('┌─────────────────────────┬─────────────────────────────────────┬─────────────────┐');
    console.log('│ Rôle                    │ Email                               │ Mot de passe    │');
    console.log('├─────────────────────────┼─────────────────────────────────────┼─────────────────┤');
    users.forEach(user => {
      console.log(`│ ${user.role.padEnd(23)} │ ${user.email.padEnd(35)} │ ${user.password.padEnd(15)} │`);
    });
    console.log('└─────────────────────────┴─────────────────────────────────────┴─────────────────┘');
    console.log('\n💡 Utilisez ces identifiants pour vous connecter à l\'application.\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

resetPasswords();
