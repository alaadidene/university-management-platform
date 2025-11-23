# 🧪 GUIDE DE TEST COMPLET - SYSTÈME D'ABSENCES

## 🚀 ÉTAPE 1: Démarrer tous les services

### Option A: Avec le script PowerShell
```powershell
cd C:\Users\rayen\Desktop\tozeur
.\start-all-services.ps1
```

### Option B: Manuellement (5 terminaux)

**Terminal 1 - Admin Service:**
```powershell
cd C:\Users\rayen\Desktop\tozeur\backend\admin-service
npm run start:dev
```
✅ Attendez: `Nest application successfully started on port 3002`

**Terminal 2 - Auth Service:**
```powershell
cd C:\Users\rayen\Desktop\tozeur\backend\auth-service
npm run start:dev
```
✅ Attendez: `Nest application successfully started on port 3001`

**Terminal 3 - Absence Service:**
```powershell
cd C:\Users\rayen\Desktop\tozeur\backend\absence-service
npm run start:dev
```
✅ Attendez: `Nest application successfully started on port 3003`

**Terminal 4 - Emploi Service:**
```powershell
cd C:\Users\rayen\Desktop\tozeur\backend\emploi-service
npm run start:dev
```
✅ Attendez: `Nest application successfully started on port 3010`

**Terminal 5 - Frontend:**
```powershell
cd C:\Users\rayen\Desktop\tozeur\frontend\front
npm start
```
✅ Attendez: Le navigateur s'ouvre sur `http://localhost:3000`

---

## 🔧 ÉTAPE 2: Vérifier les services avec Postman/ThunderClient

### 1. Test Auth Service
```http
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "password123"
}
```
✅ **Réponse attendue:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@test.com",
    "role": "directeur_departement"
  }
}
```

### 2. Test Absence Service
```http
GET http://localhost:3003/absences
Authorization: Bearer {votre_token}
```
✅ **Réponse attendue:** `[]` ou liste d'absences

---

## 👥 ÉTAPE 3: Créer des utilisateurs de test

### 1. Créer un enseignant
```http
POST http://localhost:3002/enseignant
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "prof.dupont@test.com",
  "password": "Prof123!",
  "departementId": 1,
  "specialite": "Informatique"
}
```

### 2. Créer des étudiants
```http
POST http://localhost:3002/etudiant
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "nom": "Martin",
  "prenom": "Alice",
  "email": "alice.martin@test.com",
  "password": "Student123!",
  "classeId": 1,
  "niveauId": 1
}
```

**Créer 3-4 étudiants pour tester le système d'absences**

---

## ✅ ÉTAPE 4: Tester le flux ENSEIGNANT

### 1. Login enseignant
```http
POST http://localhost:3001/auth/login

{
  "email": "prof.dupont@test.com",
  "password": "Prof123!"
}
```
**Copier le token reçu**

### 2. Marquer 1ère absence pour un étudiant
```http
POST http://localhost:3003/absences
Authorization: Bearer {prof_token}

{
  "etudiantId": 1,
  "matiereId": 1,
  "dateAbsence": "2025-01-22",
  "nbHeures": 2,
  "statut": "non_justifiee",
  "sujet": "etudiant"
}
```
✅ **Attendu:** Absence créée

### 3. Marquer 2ème absence (même étudiant, même matière)
```http
POST http://localhost:3003/absences
Authorization: Bearer {prof_token}

{
  "etudiantId": 1,
  "matiereId": 1,
  "dateAbsence": "2025-01-23",
  "nbHeures": 2,
  "statut": "non_justifiee",
  "sujet": "etudiant"
}
```
✅ **Attendu:** ⚠️ L'étudiant devrait voir un avertissement

### 4. Marquer 3ème absence (ÉLIMINATION)
```http
POST http://localhost:3003/absences
Authorization: Bearer {prof_token}

{
  "etudiantId": 1,
  "matiereId": 1,
  "dateAbsence": "2025-01-24",
  "nbHeures": 2,
  "statut": "non_justifiee",
  "sujet": "etudiant"
}
```
✅ **Attendu:** 🚫 L'étudiant est maintenant ÉLIMINÉ

---

## 📊 ÉTAPE 5: Tester le flux ÉTUDIANT

### 1. Login étudiant
```http
POST http://localhost:3001/auth/login

{
  "email": "alice.martin@test.com",
  "password": "Student123!"
}
```

### 2. Voir ses absences
```http
GET http://localhost:3003/absences/etudiant/1
Authorization: Bearer {etudiant_token}
```
✅ **Attendu:** Liste des 3 absences

### 3. Vérifier le statut d'élimination
```http
GET http://localhost:3003/absences/etudiant/1/statut-matieres
Authorization: Bearer {etudiant_token}
```
✅ **Réponse attendue:**
```json
[
  {
    "matiereId": 1,
    "matiereNom": "Programmation Web",
    "elimine": true,
    "risque": true,
    "nbAbsencesNonJustifiees": 3,
    "nbAbsencesJustifiees": 0,
    "totalHeures": 6,
    "pourcentage": 15,
    "message": "🚫 ÉLIMINÉ: 3 absences non justifiées (seuil: 3)",
    "absences": [...]
  }
]
```

### 4. Justifier une absence
```http
POST http://localhost:3003/absences/1/justifier
Authorization: Bearer {etudiant_token}

{
  "raison": "Certificat médical pour grippe",
  "typeJustificatif": "medical"
}
```
✅ **Attendu:** Statut passe à "en_attente"

---

## 👔 ÉTAPE 6: Tester le flux DIRECTEUR

### 1. Login directeur
```http
POST http://localhost:3001/auth/login

{
  "email": "admin@test.com",
  "password": "password123"
}
```

### 2. Voir toutes les absences
```http
GET http://localhost:3003/absences
Authorization: Bearer {directeur_token}
```

### 3. Voir les étudiants à risque
```http
GET http://localhost:3003/absences/etudiants-a-risque
Authorization: Bearer {directeur_token}
```
✅ **Attendu:** Liste avec l'étudiant ayant 3 absences

### 4. Valider une justification
```http
PATCH http://localhost:3003/absences/1/valider
Authorization: Bearer {directeur_token}

{
  "valide": true,
  "commentaireDirecteur": "Certificat médical accepté"
}
```
✅ **Attendu:** L'absence passe de 3 à 2 absences non justifiées → Plus éliminé!

---

## 🌐 ÉTAPE 7: Tester l'interface Frontend

### 1. Accéder au frontend
Ouvrir: `http://localhost:3000`

### 2. Login étudiant
- Email: `alice.martin@test.com`
- Password: `Student123!`
- Aller sur: `http://localhost:3000/etudiant/absences`

✅ **Vérifier:**
- Dashboard affiche: 3 absences totales
- Carte de la matière affiche: 🚫 ÉLIMINÉ
- Message: "🚫 ÉLIMINÉ: 3 absences non justifiées"
- Barre de progression à 100% (rouge)
- Bouton "Justifier" visible pour chaque absence

### 3. Login enseignant
- Email: `prof.dupont@test.com`
- Password: `Prof123!`
- Aller sur: `http://localhost:3000/enseignant/absences`

✅ **Vérifier:**
- Dashboard affiche le nombre total d'absences
- Filtres fonctionnent (toutes, non justifiées, en attente)
- Liste des absences avec dates et statuts

### 4. Marquer une absence (enseignant)
URL: `http://localhost:3000/enseignant/marquer-absences/1?classeId=1&matiereId=1`

✅ **Vérifier:**
- Liste des étudiants chargée
- Checkboxes fonctionnent
- Compteur d'absents se met à jour
- Bouton "Enregistrer" actif quand au moins 1 absent
- Message de succès après enregistrement

### 5. Login directeur
- Email: `admin@test.com`
- Password: `password123`
- Aller sur: `http://localhost:3000/directeur/absences`

✅ **Vérifier:**
- Onglet "Toutes les absences" affiche le tableau complet
- Onglet "Étudiants à risque" affiche les cartes des étudiants avec 3 absences
- Boutons "Valider" et "Refuser" visibles pour les justifications en attente
- Validation fonctionne et recharge les données

---

## 📋 CHECKLIST FINALE

### Backend
- [ ] Auth service répond sur port 3001
- [ ] Admin service répond sur port 3002
- [ ] Absence service répond sur port 3003
- [ ] Emploi service répond sur port 3010
- [ ] Connexion PostgreSQL OK
- [ ] JWT tokens générés correctement

### Logique métier
- [ ] 1 absence: Statut OK ✅
- [ ] 2 absences: Statut RISQUE ⚠️
- [ ] 3 absences: Statut ÉLIMINÉ 🚫
- [ ] Message automatique généré
- [ ] Pourcentage calculé correctement
- [ ] Distinction justifiée/non justifiée

### API Endpoints
- [ ] POST /absences (créer)
- [ ] GET /absences (toutes)
- [ ] GET /absences/etudiant/:id
- [ ] GET /absences/etudiant/:id/statut-matieres
- [ ] POST /absences/:id/justifier
- [ ] PATCH /absences/:id/valider
- [ ] GET /absences/etudiants-a-risque

### Frontend
- [ ] Page étudiant charge et affiche absences
- [ ] Dashboard avec statistiques
- [ ] Badges de statut (OK, RISQUE, ÉLIMINÉ)
- [ ] Bouton "Justifier" fonctionne
- [ ] Page enseignant pour marquer absences
- [ ] Checkboxes fonctionnent
- [ ] Page directeur pour valider justifications
- [ ] Filtres et onglets fonctionnent

### Flux complet
- [ ] Enseignant marque 3 absences
- [ ] Étudiant voit "ÉLIMINÉ"
- [ ] Étudiant justifie une absence
- [ ] Directeur valide la justification
- [ ] Étudiant voit maintenant "RISQUE" au lieu de "ÉLIMINÉ"

---

## 🐛 DÉPANNAGE

### Erreur: "Cannot connect to database"
```powershell
# Vérifier que PostgreSQL est démarré
Get-Process postgres
# Si pas de résultat, démarrer PostgreSQL
```

### Erreur: "CORS policy"
Vérifier dans chaque `.env`:
```
CORS_ORIGINS=http://localhost:3000
```

### Erreur: "401 Unauthorized"
- Vérifier que le token est bien dans le header: `Authorization: Bearer {token}`
- Token expiré? Refaire un login pour en obtenir un nouveau

### Erreur: "Cannot find module"
```powershell
# Réinstaller les dépendances
cd backend/[service-name]
npm install
```

### Frontend ne charge pas les données
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs dans l'onglet "Console"
3. Vérifier les appels API dans l'onglet "Network"
4. S'assurer que tous les backends sont démarrés

---

## ✨ TESTS DE VALIDATION FINALE

### Test 1: Règle des 3 absences
1. ✅ Créer un étudiant
2. ✅ Marquer 1 absence → Voir "OK"
3. ✅ Marquer 2 absences → Voir "RISQUE"
4. ✅ Marquer 3 absences → Voir "ÉLIMINÉ"

### Test 2: Justification
1. ✅ Étudiant justifie l'absence #1
2. ✅ Statut passe à "en_attente"
3. ✅ Directeur valide
4. ✅ Statut passe à "justifiee"
5. ✅ Compteur: 2 non justifiées → Plus éliminé!

### Test 3: Interface complète
1. ✅ Login étudiant → Dashboard charge
2. ✅ Voir absences par matière
3. ✅ Login enseignant → Marquer absences
4. ✅ Login directeur → Valider justifications

---

🎉 **Si tous les tests passent, le système est COMPLET et FONCTIONNEL!**
