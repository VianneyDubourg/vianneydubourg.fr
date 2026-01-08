# LUMIÈRE - Blog Voyage & Photographie

Backend Python avec FastAPI pour le blog de voyage et photographie.

## Installation

1. Créer un environnement virtuel Python :
```bash
python -m venv venv
```

2. Activer l'environnement virtuel :
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

## Configuration

Le backend utilise SQLite par défaut. Pour utiliser PostgreSQL, définissez la variable d'environnement `DATABASE_URL` :

```bash
export DATABASE_URL="postgresql://user:password@localhost/lumiere"
```

## Lancer l'application

```bash
python backend/run.py
```

L'API sera accessible sur `http://localhost:8000`

## Documentation API

Une fois l'application lancée, accédez à :
- Documentation interactive : `http://localhost:8000/docs`
- Documentation alternative : `http://localhost:8000/redoc`

## Structure du projet

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # Application principale
│   ├── database.py      # Configuration base de données
│   ├── models.py        # Modèles SQLAlchemy
│   ├── schemas.py       # Schémas Pydantic
│   ├── auth.py          # Utilitaires d'authentification
│   └── routers/
│       ├── __init__.py
│       ├── articles.py  # Routes articles
│       ├── spots.py     # Routes spots
│       ├── admin.py     # Routes admin
│       └── auth.py      # Routes authentification
└── run.py               # Script de lancement
```

## Endpoints principaux

### Articles
- `GET /api/articles/` - Liste des articles
- `GET /api/articles/{id}` - Détails d'un article
- `POST /api/articles/` - Créer un article (authentifié)
- `PUT /api/articles/{id}` - Modifier un article
- `DELETE /api/articles/{id}` - Supprimer un article (admin)

### Spots
- `GET /api/spots/` - Liste des spots
- `GET /api/spots/{id}` - Détails d'un spot
- `POST /api/spots/` - Créer un spot (admin)
- `PUT /api/spots/{id}` - Modifier un spot (admin)
- `DELETE /api/spots/{id}` - Supprimer un spot (admin)

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/token` - Connexion (obtenir token)
- `GET /api/auth/me` - Informations utilisateur actuel

### Admin
- `GET /api/admin/stats` - Statistiques du dashboard
- `GET /api/admin/articles` - Tous les articles
- `GET /api/admin/comments` - Commentaires à modérer

## Créer un utilisateur admin

Pour créer un utilisateur admin, vous pouvez utiliser l'API ou créer un script d'initialisation.
