# 🎯 Guide d'utilisation des Absences

## ✅ Fonctionnalité Complètement Intégrée!

Toutes les interfaces d'absence sont maintenant **accessibles depuis les dashboards** de chaque rôle.

---

## 📱 Pour les ÉTUDIANTS

### Comment accéder:

1. **Via le Dashboard:**
   - Connectez-vous → Dashboard Étudiant
   - Cliquez sur **"Mes Absences"** dans les actions disponibles
   - OU naviguez vers: `http://localhost:3000/etudiant/absences`

2. **Fonctionnalités:**
   - ✅ Voir toutes vos absences par matière
   - ✅ Statut d'élimination en temps réel (règle des 3 absences)
   - ✅ Badges de couleur:
     - 🟢 **OK** - Moins de 2 absences
     - 🟡 **RISQUE** - 2 absences (attention!)
     - 🔴 **ÉLIMINÉ** - 3 absences ou plus
   - ✅ Justifier vos absences avec raison
   - ✅ Voir le statut de vos justifications

### Interface:

```
┌──────────────────────────────────────────┐
│  📊 MES ABSENCES                         │
├──────────────────────────────────────────┤
│  Dashboard:                              │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │  5   │  │  2   │  │  1   │          │
│  │Total │  │Risque│  │Élim. │          │
│  └──────┘  └──────┘  └──────┘          │
│                                          │
│  📚 Programmation Web                    │
│  ┌────────────────────────────────────┐ │
│  │ 🚫 ÉLIMINÉ - 3/3 absences          │ │
│  │ ━━━━━━━━━━━━━━━━━━━━ 100%        │ │
│  │ Non justifiées: 3 | Justifiées: 0 │ │
│  │                                    │ │
│  │ Détail:                            │ │
│  │ • 15 Nov - 2h ❌ [Justifier]      │ │
│  │ • 18 Nov - 2h ❌ [Justifier]      │ │
│  │ • 20 Nov - 2h ❌ [Justifier]      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  📖 Base de données                      │
│  ┌────────────────────────────────────┐ │
│  │ ⚠️ RISQUE - 2/3 absences           │ │
│  │ ━━━━━━━━━━━━   66%                │ │
│  │ Non justifiées: 2 | Justifiées: 0 │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 👨‍🏫 Pour les ENSEIGNANTS

### Comment accéder:

1. **Via le Dashboard:**
   - Connectez-vous → Dashboard Enseignant
   - Cliquez sur **"Gérer les Absences"** (quick action avec icône 📋)
   - OU naviguez vers: `http://localhost:3000/enseignant/absences`

2. **Fonctionnalités:**
   - ✅ Marquer les absences pour vos étudiants
   - ✅ Sélectionner plusieurs étudiants absents à la fois
   - ✅ Ajouter des commentaires
   - ✅ Voir toutes les absences que vous avez enregistrées
   - ✅ Statistiques par classe/matière

### Interface de marquage:

```
┌──────────────────────────────────────────┐
│  📝 MARQUER LES ABSENCES                 │
├──────────────────────────────────────────┤
│  Date: 22 novembre 2025                  │
│  Étudiants: 24 | Absents: 2              │
│                                          │
│  Liste des étudiants:                    │
│  ☐ Ahmed Ben Ali                        │
│  ☑ Fatma Ben Salem    ← ABSENT          │
│  ☐ Mohamed Trabelsi                     │
│  ☑ Sarah Miled         ← ABSENT          │
│  ☐ Youssef Gharbi                       │
│  ...                                     │
│                                          │
│  Commentaire (optionnel):                │
│  ┌────────────────────────────────────┐ │
│  │ Cours du matin - 2h                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [✅ Enregistrer (2 absences)]          │
└──────────────────────────────────────────┘
```

### Marquer depuis l'emploi du temps:

**URL Format:**
```
/enseignant/marquer-absences/:seanceId?classeId=1&matiereId=2
```

**Exemple:**
```
http://localhost:3000/enseignant/marquer-absences/123?classeId=1&matiereId=2
```

---

## 👔 Pour les DIRECTEURS

### Comment accéder:

1. **Via le Dashboard:**
   - Connectez-vous → Dashboard Directeur
   - Cliquez sur **"📋 Gérer absences"** dans la liste des actions
   - OU naviguez vers: `http://localhost:3000/directeur/absences`

2. **Fonctionnalités:**
   - ✅ Voir toutes les absences du département
   - ✅ Valider ou refuser les justifications
   - ✅ Voir les étudiants à risque d'élimination
   - ✅ Statistiques globales
   - ✅ Filtres (toutes, non justifiées, en attente, justifiées)

### Interface:

```
┌──────────────────────────────────────────┐
│  🎓 GESTION DES ABSENCES                 │
├──────────────────────────────────────────┤
│  Statistiques:                           │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ 156  │  │  12  │  │  8   │          │
│  │Total │  │Attente│ │Risque│          │
│  └──────┘  └──────┘  └──────┘          │
│                                          │
│  [📋 Toutes] [⚠️ Étudiants à risque]   │
│                                          │
│  Justifications en attente:              │
│  ┌────────────────────────────────────┐ │
│  │ 20 Nov | Fatma Ben Salem            │ │
│  │ Matière: Programmation Web          │ │
│  │ Raison: Certificat médical          │ │
│  │ [✅ Valider] [❌ Refuser]           │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 18 Nov | Ahmed Ben Ali              │ │
│  │ Matière: Base de données            │ │
│  │ Raison: Urgence familiale           │ │
│  │ [✅ Valider] [❌ Refuser]           │ │
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 🔥 Règle des 3 Absences (Automatique!)

### Comment ça marche:

```
┌─────────────────────────────────────┐
│ Absence 1 → ✅ OK                   │
│ Absence 2 → ⚠️ RISQUE              │
│ Absence 3 → 🚫 ÉLIMINÉ             │
└─────────────────────────────────────┘
```

### Workflow:

1. **Enseignant** marque 3 absences → État: **ÉLIMINÉ**
2. **Étudiant** voit son statut → Badge rouge 🚫
3. **Étudiant** peut justifier une absence
4. **Directeur** valide la justification
5. **Système** recalcule → 2 absences → État: **RISQUE** ⚠️

### API qui gère l'élimination:

```http
GET /absences/etudiant/:id/statut-matieres
```

**Réponse:**
```json
[
  {
    "matiereId": 1,
    "matiereNom": "Programmation Web",
    "elimine": true,
    "risque": true,
    "nbAbsencesNonJustifiees": 3,
    "nbAbsencesJustifiees": 0,
    "message": "🚫 ÉLIMINÉ: 3 absences non justifiées"
  }
]
```

---

## 🧪 Test Complet du Système

### Scénario 1: Marquer des absences

1. **Login Enseignant:**
   ```
   http://localhost:3000/login
   Email: enseignant@example.com
   ```

2. **Accéder à la gestion des absences:**
   - Dashboard → "Gérer les Absences"
   - OU directement: `/enseignant/absences`

3. **Marquer 3 absences pour un étudiant:**
   - Avec classe et matière

### Scénario 2: Consulter son statut (Étudiant)

1. **Login Étudiant:**
   ```
   http://localhost:3000/login
   Email: etudiant@example.com
   ```

2. **Voir ses absences:**
   - Dashboard → "Mes Absences"
   - Vérifier: Badge 🚫 ÉLIMINÉ si 3 absences

3. **Justifier une absence:**
   - Cliquer sur "Justifier"
   - Saisir la raison
   - Soumettre

### Scénario 3: Valider une justification (Directeur)

1. **Login Directeur:**
   ```
   http://localhost:3000/login
   Email: directeur@example.com
   ```

2. **Gérer les justifications:**
   - Dashboard → "Gérer absences"
   - Onglet: Justifications en attente
   - Cliquer "✅ Valider"

3. **Résultat:**
   - Étudiant passe de 🚫 ÉLIMINÉ à ⚠️ RISQUE
   - Absence compte maintenant comme justifiée

---

## 🌐 URLs Complètes

### Frontend (Navigateur):

```
Login:              http://localhost:3000/login

Étudiant:
- Dashboard:        http://localhost:3000/dashboard
- Mes absences:     http://localhost:3000/etudiant/absences

Enseignant:
- Dashboard:        http://localhost:3000/dashboard
- Gérer absences:   http://localhost:3000/enseignant/absences
- Marquer absences: http://localhost:3000/enseignant/marquer-absences/:seanceId?classeId=X&matiereId=Y

Directeur:
- Dashboard:        http://localhost:3000/dashboard
- Gérer absences:   http://localhost:3000/directeur/absences
```

### Backend API:

```
Base URL:           http://localhost:3003

Endpoints clés:
- POST   /absences                                    (Créer une absence)
- GET    /absences                                    (Liste toutes)
- GET    /absences/etudiant/:id                       (Absences d'un étudiant)
- GET    /absences/etudiant/:id/statut-matieres      (Statut élimination)
- POST   /absences/:id/justifier                     (Justifier)
- PATCH  /absences/:id/valider                       (Valider justification)
- GET    /absences/etudiants-a-risque                (Étudiants en danger)
```

---

## 🎨 Personnalisation des Couleurs

### CSS Variables:

```css
/* OK - Moins de 2 absences */
.matiere-card.ok {
  border-left: 4px solid #48bb78;
  background: #f0fff4;
}

/* RISQUE - 2 absences */
.matiere-card.risque {
  border-left: 4px solid #ed8936;
  background: #fffaf0;
}

/* ÉLIMINÉ - 3+ absences */
.matiere-card.elimine {
  border-left: 4px solid #f56565;
  background: #fff5f5;
}
```

---

## 🐛 Dépannage

### Problème: "Impossible de charger vos données"

**Solution:**
- Vérifiez que vous êtes connecté
- Token présent dans localStorage
- Service absence-service actif sur port 3003

### Problème: "Informations manquantes (classe ou matière)"

**Solution:**
- Marquer absences depuis emploi du temps
- OU ajouter `?classeId=X&matiereId=Y` à l'URL

### Problème: Aucune absence affichée

**Solution:**
- Vérifier que des absences existent en base
- Tester l'API: `GET http://localhost:3003/absences/etudiant/1`
- Vérifier que l'ID étudiant est correct

---

## ✅ Checklist de Vérification

- [x] Services backend actifs (admin, auth, absence)
- [x] Frontend React lancé (port 3000)
- [x] Routes configurées dans App.js
- [x] Wrappers créés pour chaque rôle
- [x] Composants avec API calls fonctionnels
- [x] CSS styling appliqué
- [x] Boutons d'accès dans dashboards
- [x] Règle des 3 absences implémentée
- [x] Justifications et validations opérationnelles

---

## 🎉 Résumé

**Tout est prêt!** Les 3 rôles ont maintenant accès aux absences:

1. **Étudiants** → Voir leurs absences + statut élimination + justifier
2. **Enseignants** → Marquer les absences de leurs étudiants
3. **Directeurs** → Gérer toutes les absences + valider les justifications

**Pour commencer:** Connectez-vous et cliquez sur le bouton d'absence dans votre dashboard! 🚀
