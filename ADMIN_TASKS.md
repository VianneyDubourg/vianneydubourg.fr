# Liste des tâches - Tableau de bord Admin

## 📊 PAGE APERÇU (Overview)

### ✅ Déjà implémenté
- Chargement des stats de base (vues, spots, abonnés)
- Affichage des stats dans les cards

### 🔴 À faire

#### 1. Stats Cards - Tendances
- [ ] Calculer les pourcentages de variation (vs mois dernier)
- [ ] API: Ajouter `trend_views`, `trend_spots`, `trend_subscribers` dans `/api/admin/stats`
- [ ] Frontend: Afficher les tendances avec icônes up/down selon le signe

#### 2. Tableau Articles - Données dynamiques
- [ ] API: Utiliser `/api/admin/articles` existant
- [ ] Frontend: Remplacer données statiques par appel API
- [ ] Afficher cover_image, auteur avec avatar, statut avec badge coloré
- [ ] Formater les dates (ex: "12 Oct 2023", "Aujourd'hui")

#### 3. Tableau Articles - Sélection multiple
- [ ] Gérer état des checkboxes (sélection individuelle + tout sélectionner)
- [ ] API: Créer `/api/admin/articles/bulk-delete` (suppression multiple)
- [ ] Frontend: Afficher barre d'actions quand items sélectionnés

#### 4. Tableau Articles - Filtres
- [ ] Bouton filtre: Ouvrir modal/dropdown avec options (Statut, Catégorie, Date)
- [ ] API: Ajouter params `status`, `category`, `date_from`, `date_to` à `/api/admin/articles`
- [ ] Frontend: Appliquer filtres et recharger tableau

#### 5. Tableau Articles - Actions
- [ ] Bouton "Éditer": Ouvrir modal/rediriger vers formulaire édition
- [ ] API: Utiliser `/api/articles/{id}` (GET/PUT) existant
- [ ] Frontend: Formulaire modal pour éditer article

#### 6. Tableau Articles - Pagination
- [ ] API: Ajouter `skip`, `limit`, `total` dans réponse `/api/admin/articles`
- [ ] Frontend: Calculer nombre de pages, activer/désactiver boutons Préc/Suiv
- [ ] Gérer changement de page

#### 7. Boutons Header
- [ ] "Exporter": Générer CSV/JSON des articles, télécharger fichier
- [ ] "Créer": Ouvrir modal formulaire création article
- [ ] API: Utiliser `/api/articles/` (POST) existant

---

## 📝 PAGE ARTICLES

### 🔴 À créer complètement

#### 1. Navigation & Layout
- [ ] Créer vue `view-admin-articles` dans HTML
- [ ] Router: Ajouter `switchAdminSection('articles')` dans `app.js`
- [ ] Sidebar: Activer lien "Articles" avec état actif

#### 2. Liste Articles
- [ ] Tableau similaire à Aperçu mais plus complet
- [ ] Colonnes: Image, Titre, Slug, Auteur, Statut, Vues, Date création, Actions
- [ ] API: Utiliser `/api/admin/articles` avec pagination
- [ ] Tri: Par date, vues, titre (cliquable sur en-têtes)

#### 3. Recherche & Filtres
- [ ] Barre de recherche (titre, slug, contenu)
- [ ] Filtres: Statut (draft/published/review), Catégorie, Auteur
- [ ] API: Ajouter param `search` à `/api/admin/articles`

#### 4. Actions CRUD
- [ ] Créer: Modal formulaire (titre, contenu, catégorie, statut, image)
- [ ] Éditer: Modal pré-rempli avec données article
- [ ] Supprimer: Confirmation puis appel API
- [ ] Publier/Dépublier: Toggle rapide statut

#### 5. Actions groupées
- [ ] Sélection multiple + barre actions (Publier, Dépublier, Supprimer)
- [ ] API: `/api/admin/articles/bulk-update` (status, delete)

---

## 📍 PAGE SPOTS

### 🔴 À créer complètement

#### 1. Navigation & Layout
- [ ] Créer vue `view-admin-spots` dans HTML
- [ ] Router: Ajouter `switchAdminSection('spots')` dans `app.js`
- [ ] Sidebar: Activer lien "Spots"

#### 2. Liste Spots
- [ ] Tableau: Image, Nom, Localisation, Coordonnées, Catégorie, Note, Tags, Actions
- [ ] API: Utiliser `/api/spots/` existant avec pagination
- [ ] Carte mini: Afficher spot sélectionné sur carte Leaflet

#### 3. Recherche & Filtres
- [ ] Recherche: Nom, localisation
- [ ] Filtres: Catégorie, Note min, Tags
- [ ] API: Utiliser params existants `search`, `category`

#### 4. Actions CRUD
- [ ] Créer: Modal formulaire (nom, location, lat/lng, catégorie, tags, image, rating)
- [ ] Éditer: Modal pré-rempli
- [ ] Supprimer: Confirmation
- [ ] Sélection coordonnées: Clic sur carte pour définir lat/lng

#### 5. Actions groupées
- [ ] Sélection multiple + Supprimer en masse
- [ ] API: `/api/admin/spots/bulk-delete`

---

## 💬 PAGE COMMENTAIRES

### ✅ Déjà implémenté (API)
- `/api/admin/comments` (GET)
- `/api/admin/comments/{id}/approve` (POST)
- `/api/admin/comments/{id}` (DELETE)

### 🔴 À faire

#### 1. Navigation & Layout
- [ ] Créer vue `view-admin-comments` dans HTML
- [ ] Router: Ajouter `switchAdminSection('comments')`
- [ ] Sidebar: Badge dynamique avec compteur pending (utiliser `pending_comments` des stats)

#### 2. Liste Commentaires
- [ ] Tableau: Auteur, Contenu, Article (lien), Date, Statut, Actions
- [ ] API: Utiliser `/api/admin/comments` existant
- [ ] Filtrer: Afficher pending en premier, puis tous

#### 3. Actions Modération
- [ ] Bouton "Approuver": Appel `/api/admin/comments/{id}/approve`
- [ ] Bouton "Supprimer": Confirmation puis `/api/admin/comments/{id}`
- [ ] Actions groupées: Approuver/Supprimer sélection multiple
- [ ] API: `/api/admin/comments/bulk-approve`, `/api/admin/comments/bulk-delete`

#### 4. Badge Compteur
- [ ] Mettre à jour badge sidebar en temps réel après modération
- [ ] Recharger stats après chaque action

---

## 👥 PAGE UTILISATEURS

### 🔴 À créer complètement

#### 1. Navigation & Layout
- [ ] Créer vue `view-admin-users` dans HTML
- [ ] Router: Ajouter `switchAdminSection('users')`
- [ ] Sidebar: Activer lien "Utilisateurs"

#### 2. API Routes
- [ ] `/api/admin/users` (GET) - Liste avec pagination
- [ ] `/api/admin/users/{id}` (GET) - Détails
- [ ] `/api/admin/users/{id}` (PUT) - Modifier (nom, email, rôle)
- [ ] `/api/admin/users/{id}` (DELETE) - Supprimer
- [ ] `/api/admin/users/{id}/toggle-admin` (POST) - Toggle rôle admin

#### 3. Liste Utilisateurs
- [ ] Tableau: Avatar, Username, Email, Nom, Rôle, Date inscription, Articles, Actions
- [ ] Stats: Nombre d'articles par utilisateur
- [ ] Badge admin visible

#### 4. Recherche & Filtres
- [ ] Recherche: Username, email
- [ ] Filtre: Rôle (admin/user), Date inscription

#### 5. Actions
- [ ] Éditer: Modal (nom, email, rôle admin)
- [ ] Supprimer: Confirmation (vérifier articles liés)
- [ ] Toggle Admin: Bouton rapide pour changer rôle

---

## 🔧 FONCTIONNALITÉS GLOBALES

### 🔴 À faire

#### 1. Router Admin
- [ ] Fonction `switchAdminSection(section)` dans `app.js`
- [ ] Gérer états actifs dans sidebar (highlight lien actif)
- [ ] Masquer/afficher vues selon section

#### 2. Modals Réutilisables
- [ ] Modal générique (titre, contenu, actions)
- [ ] Modal formulaire article (créer/éditer)
- [ ] Modal formulaire spot (créer/éditer)
- [ ] Modal confirmation suppression

#### 3. Gestion Erreurs
- [ ] Toasts/notifications pour succès/erreur
- [ ] Messages d'erreur API affichés à l'utilisateur
- [ ] Loading states (spinners) pendant requêtes

#### 4. Authentification Admin
- [ ] Vérifier token admin au chargement dashboard
- [ ] Rediriger si non-admin
- [ ] Gérer expiration token (refresh ou logout)

---

## 📋 RÉSUMÉ PAR PRIORITÉ

### Priorité 1 (Essentiel)
1. Tableau Articles - Données dynamiques
2. Page Commentaires - Interface complète
3. Router Admin - Navigation entre sections
4. Actions CRUD Articles (créer/éditer/supprimer)

### Priorité 2 (Important)
5. Stats Cards - Tendances
6. Tableau Articles - Pagination
7. Page Articles - Liste complète
8. Page Spots - Liste complète

### Priorité 3 (Amélioration)
9. Actions groupées (bulk operations)
10. Recherche & Filtres avancés
11. Page Utilisateurs
12. Modals réutilisables

### Priorité 4 (Nice to have)
13. Export CSV/JSON
14. Tri colonnes
15. Carte interactive dans admin spots
