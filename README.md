# Trackify - Application de Gestion de Flotte

Application web complète pour la gestion de flotte de véhicules, permettant d'automatiser le suivi des camions, remorques, trajets, maintenance et chauffeurs.

## 🚀 Fonctionnalités

### Administration
- **Gestion des camions** : CRUD complet avec suivi du kilométrage et de l'état
- **Gestion des remorques** : CRUD complet avec suivi de la capacité et de l'état
- **Gestion des pneus** : CRUD avec association aux véhicules (camions/remorques)
- **Gestion des trajets** : Création, modification, assignation aux chauffeurs, génération PDF
- **Gestion de la maintenance** : Planification et suivi des maintenances périodiques
- **Rapports** : 
  - Rapport de consommation (gasoil par camion)
  - Rapport de kilométrage (distance parcourue par camion)
  - Rapport de maintenance (état des maintenances)

### Chauffeur
- Visualisation des trajets assignés
- Mise à jour du statut des trajets (à faire, en cours, terminé)
- Saisie des données de trajet (kilométrage, gasoil, remarques)
- Téléchargement de l'ordre de mission en PDF
- Filtres pour faciliter la recherche des trajets

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec Express.js
- **MongoDB** avec Mongoose (ODM)
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **PDFKit** pour la génération de PDF
- **Jest** et **Supertest** pour les tests unitaires

### Frontend
- **React.js** avec Vite
- **React Router DOM** pour la navigation
- **Context API** pour la gestion d'état globale
- **Axios** pour les appels API
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes

## 📋 Prérequis

- Node.js (v18 ou supérieur)
- MongoDB (ou Docker pour utiliser MongoDB via Docker Compose)
- npm ou yarn

## 🚀 Installation et Démarrage

### Option 1 : Avec Docker (Recommandé)

1. **Cloner le repository**
```bash
git clone "https://github.com/Safaa-Ettalhi/Trackify"
cd Trackify
```

2. **Démarrer tous les services avec Docker Compose**
```bash
docker-compose up -d
```

3. **Accéder à l'application**
- Frontend : http://localhost:3001
- Backend API : http://localhost:5000
- MongoDB : localhost:27019

### Option 2 : Installation Manuelle

#### Backend

1. **Aller dans le dossier backend**
```bash
cd backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Créer un fichier .env**
```env
MONGODB_URI=mongodb://localhost:27017/trackify
JWT_SECRET=ma_cle_secrete_12345
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

4. **Démarrer le serveur**
```bash
npm run dev
```

#### Frontend

1. **Aller dans le dossier frontend**
```bash
cd frontend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer l'application**
```bash
npm run dev
```

4. **Accéder à l'application**
- Frontend : http://localhost:5173

## 🧪 Tests

### Backend

```bash
cd backend
npm test
```

Les tests couvrent tous les controllers .

## 📁 Structure du Projet

```
Trackify/
├── backend/
│   ├── config/          # Configuration (DB)
│   ├── controllers/      # Controllers (logique métier)
│   ├── middlewares/      # Middlewares (auth, error handling)
│   ├── models/          # Modèles Mongoose
│   ├── routes/          # Routes Express
│   ├── services/        # Services (PDF generation)
│   ├── tests/           # Tests unitaires
│   └── server.js        # Point d'entrée
├── frontend/
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── context/     # Context API (Auth)
│   │   ├── pages/       # Pages principales
│   │   ├── services/    # Services API
│   │   └── App.jsx      # Composant principal
│   └── vite.config.js   # Configuration Vite
└── docker-compose.yml   # Configuration Docker
```

## 🔐 Authentification

L'application utilise JWT (JSON Web Tokens) pour l'authentification. Deux rôles sont disponibles :
- **Admin** : Accès complet à toutes les fonctionnalités
- **Chauffeur** : Accès limité à ses trajets assignés

## 📝 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Camions
- `GET /api/trucks` - Liste des camions
- `POST /api/trucks` - Créer un camion
- `GET /api/trucks/:id` - Détails d'un camion
- `PUT /api/trucks/:id` - Modifier un camion
- `DELETE /api/trucks/:id` - Supprimer un camion

### Remorques
- `GET /api/trailers` - Liste des remorques
- `POST /api/trailers` - Créer une remorque
- `GET /api/trailers/:id` - Détails d'une remorque
- `PUT /api/trailers/:id` - Modifier une remorque
- `DELETE /api/trailers/:id` - Supprimer une remorque

### Pneus
- `GET /api/tires` - Liste des pneus
- `POST /api/tires` - Créer un pneu
- `GET /api/tires/:id` - Détails d'un pneu
- `PUT /api/tires/:id` - Modifier un pneu
- `DELETE /api/tires/:id` - Supprimer un pneu

### Trajets
- `GET /api/trips` - Liste des trajets
- `POST /api/trips` - Créer un trajet
- `GET /api/trips/:id` - Détails d'un trajet
- `PUT /api/trips/:id` - Modifier un trajet
- `DELETE /api/trips/:id` - Supprimer un trajet
- `GET /api/trips/:id/pdf` - Télécharger le PDF d'un trajet

### Maintenance
- `GET /api/maintenance` - Liste des maintenances
- `POST /api/maintenance` - Créer une maintenance
- `PUT /api/maintenance/:id` - Modifier une maintenance
- `GET /api/maintenance/upcoming` - Maintenances à venir

### Rapports
- `GET /api/reports/consumption` - Rapport de consommation
- `GET /api/reports/kilometrage` - Rapport de kilométrage
- `GET /api/reports/maintenance` - Rapport de maintenance

### Chauffeur
- `GET /api/driver/trips` - Trajets du chauffeur
- `PUT /api/driver/trips/:id/status` - Mettre à jour le statut
- `PUT /api/driver/trips/:id/update` - Mettre à jour les données

## 🐳 Docker

### Commandes Docker

**Démarrer tous les services**
```bash
docker-compose up -d
```

**Arrêter tous les services**
```bash
docker-compose down
```

**Voir les logs**
```bash
docker-compose logs -f
```

**Rebuild les images**
```bash
docker-compose build --no-cache
```

**Supprimer les volumes (⚠️ supprime les données)**
```bash
docker-compose down -v
```

## 📦 Dépendances Principales

### Backend
- `express` : Framework web
- `mongoose` : ODM pour MongoDB
- `jsonwebtoken` : Gestion des tokens JWT
- `bcryptjs` : Hachage des mots de passe
- `pdfkit` : Génération de PDF
- `cors` : Gestion CORS
- `dotenv` : Variables d'environnement

### Frontend
- `react` : Bibliothèque UI
- `react-router-dom` : Routing
- `axios` : Client HTTP
- `tailwindcss` : Framework CSS
- `lucide-react` : Icônes

## screnshot 
<img width="1889" height="875" alt="image" src="https://github.com/user-attachments/assets/05010415-061c-4453-a1da-6da66745e483" />
<img width="1889" height="875" alt="image" src="https://github.com/user-attachments/assets/c92e2938-06c4-4021-a680-27e8ef8f101c" />



