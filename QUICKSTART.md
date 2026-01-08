# Guide de démarrage rapide

## Installation et lancement

### 1. Installer les dépendances Python

```bash
# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

### 2. Initialiser la base de données

```bash
python backend/init_db.py
```

Cela créera :
- Un utilisateur admin (username: `admin`, password: `admin123`)
- Un utilisateur démo (username: `demo`, password: `demo123`)
- Des articles de démonstration
- Des spots de démonstration

### 3. Lancer le serveur

```bash
python backend/run.py
```

Le serveur sera accessible sur `http://localhost:8000`

### 4. Accéder à l'application

- **Interface web** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **Documentation alternative** : http://localhost:8000/redoc

## Utilisation

### Se connecter en tant qu'admin

1. Utilisez l'API pour obtenir un token :
```bash
curl -X POST "http://localhost:8000/api/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

2. Utilisez le token retourné pour les requêtes authentifiées

### Tester l'API

Exemples de requêtes :

```bash
# Récupérer tous les articles
curl http://localhost:8000/api/articles/

# Récupérer tous les spots
curl http://localhost:8000/api/spots/

# Récupérer les statistiques admin (nécessite authentification)
curl -H "Authorization: Bearer VOTRE_TOKEN" http://localhost:8000/api/admin/stats
```

## Structure du projet

```
vianneydubourg.fr/
├── backend/
│   ├── app/
│   │   ├── main.py          # Application FastAPI
│   │   ├── database.py      # Configuration DB
│   │   ├── models.py        # Modèles SQLAlchemy
│   │   ├── schemas.py       # Schémas Pydantic
│   │   └── routers/         # Routes API
│   ├── init_db.py           # Script d'initialisation
│   └── run.py               # Script de lancement
├── static/
│   └── js/
│       └── api.js           # Client API JavaScript
├── generated-page.html      # Interface frontend
├── requirements.txt         # Dépendances Python
└── README.md               # Documentation complète
```

## Prochaines étapes

- Configurer une base de données PostgreSQL pour la production
- Ajouter la gestion des fichiers (upload d'images)
- Implémenter la recherche avancée
- Ajouter des tests unitaires
- Configurer le déploiement (Docker, etc.)
