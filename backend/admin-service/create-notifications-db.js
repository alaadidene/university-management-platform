const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'university_db_2',
  user: 'postgres',
  password: '0000',
});

async function createNotificationsTable() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        etudiant_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        titre VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        lu BOOLEAN DEFAULT FALSE,
        matiere_nom VARCHAR(255),
        date VARCHAR(50),
        enseignant_nom VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_etudiant_id ON notifications(etudiant_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_lu ON notifications(lu);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `;

    await client.query(createTableQuery);
    console.log('✅ Table notifications créée avec succès');

    // Vérifier la table
    const checkQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(checkQuery);
    console.log('📋 Structure de la table notifications:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('👋 Connexion fermée');
  }
}

createNotificationsTable();
