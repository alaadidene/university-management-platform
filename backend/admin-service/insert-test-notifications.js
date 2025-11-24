const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'university_db_2',
  user: 'postgres',
  password: '0000',
});

async function insertTestNotification() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    const insertQuery = `
      INSERT INTO notifications (etudiant_id, type, titre, message, lu, matiere_nom, date, enseignant_nom, created_at)
      VALUES 
        (23, 'absence', 'Absence enregistrée', 'Vous avez été marqué absent au cours de Base de données le 24/11/2025 (08:00-09:30).', false, 'Base de données', '24/11/2025', 'Manel Chakroun', NOW()),
        (23, 'absence', 'Absence enregistrée', 'Vous avez été marqué absent au cours de Algorithmique le 23/11/2025 (10:00-11:30).', false, 'Algorithmique', '23/11/2025', 'Ahmed Ben Ali', NOW())
      RETURNING *;
    `;

    const result = await client.query(insertQuery);
    console.log('✅ Notifications de test insérées:');
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID ${row.id}: ${row.titre} pour étudiant ${row.etudiant_id}`);
    });

    // Vérifier le total
    const countQuery = `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE lu = false) as non_lues FROM notifications WHERE etudiant_id = 23`;
    const countResult = await client.query(countQuery);
    console.log(`\n📊 Statistiques pour étudiant 23:`);
    console.log(`  Total: ${countResult.rows[0].total}`);
    console.log(`  Non lues: ${countResult.rows[0].non_lues}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('\n👋 Connexion fermée');
  }
}

insertTestNotification();
