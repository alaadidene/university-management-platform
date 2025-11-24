-- Création de la table seances
CREATE TABLE IF NOT EXISTS seances (
    id SERIAL PRIMARY KEY,
    matiere_id INTEGER NOT NULL,
    classe_id INTEGER NOT NULL,
    enseignant_id INTEGER NOT NULL,
    date DATE NOT NULL,
    jour VARCHAR(20) NOT NULL,
    horaire VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matiere_id) REFERENCES matiere(id),
    FOREIGN KEY (classe_id) REFERENCES classe(id),
    FOREIGN KEY (enseignant_id) REFERENCES enseignant(id)
);

-- Création de la table presences
CREATE TABLE IF NOT EXISTS presences (
    id SERIAL PRIMARY KEY,
    seance_id INTEGER NOT NULL,
    etudiant_id INTEGER NOT NULL,
    statut VARCHAR(10) NOT NULL CHECK (statut IN ('present', 'absent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
    FOREIGN KEY (etudiant_id) REFERENCES etudiant(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_seances_matiere_classe ON seances(matiere_id, classe_id);
CREATE INDEX IF NOT EXISTS idx_seances_date ON seances(date);
CREATE INDEX IF NOT EXISTS idx_presences_seance ON presences(seance_id);
CREATE INDEX IF NOT EXISTS idx_presences_etudiant ON presences(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presences_statut ON presences(statut);