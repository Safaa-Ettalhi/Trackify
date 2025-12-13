# Guide Docker - Trackify

Ce guide explique comment déployer l'application Trackify avec Docker.

## 📋 Prérequis

- Docker installé (version 20.10 ou supérieure)
- Docker Compose installé (version 2.0 ou supérieure)

## 🚀 Démarrage Rapide

### 1. Démarrer tous les services

```bash
docker-compose up -d
```

Cette commande va :
- Créer un réseau Docker `trackify-network`
- Démarrer MongoDB sur le port 27017
- Démarrer le backend sur le port 5000
- Démarrer le frontend sur le port 3000
- Créer un volume pour persister les données MongoDB

### 2. Vérifier que les services sont démarrés

```bash
docker-compose ps
```

Vous devriez voir 3 services en cours d'exécution :
- `trackify-mongodb`
- `trackify-backend`
- `trackify-frontend`

### 3. Accéder à l'application

- **Frontend** : http://localhost:3001
- **Backend API** : http://localhost:5000
- **MongoDB** : localhost:27019

## 🔧 Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Arrêter les services

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ supprime les données)

```bash
docker-compose down -v
```

### Rebuild les images

```bash
# Rebuild toutes les images
docker-compose build --no-cache

# Rebuild une image spécifique
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Redémarrer un service

```bash
docker-compose restart backend
docker-compose restart frontend
```

## 🏗️ Architecture Docker

### Services

1. **mongodb** : Base de données MongoDB
   - Image : `mongo:7`
   - Port externe : 27019 (port interne : 27017)
   - Volume : `mongodb_data` (persistance des données)

2. **backend** : API Node.js/Express
   - Port : 5000
   - Variables d'environnement :
     - `MONGO_URI=mongodb://mongodb:27017/trackify`
     - `JWT_SECRET=ma_cle_secrete_12345`
     - `JWT_EXPIRE=7d`
     - `PORT=5000`
     - `NODE_ENV=production`

3. **frontend** : Application React
   - Port externe : 3001 (nginx sur le port 80 dans le conteneur)
   - Build avec Vite
   - Servi par nginx

### Réseau

Tous les services sont connectés au réseau `trackify-network` pour communiquer entre eux.

## 🔍 Dépannage

### Le backend ne se connecte pas à MongoDB

Vérifiez que MongoDB est démarré :
```bash
docker-compose ps mongodb
```

Vérifiez les logs :
```bash
docker-compose logs mongodb
docker-compose logs backend
```

### Le frontend ne peut pas accéder au backend

Vérifiez que l'URL de l'API dans le frontend est correcte. Par défaut, elle pointe vers `http://localhost:5000/api`.

Si vous accédez au frontend depuis un autre hôte, modifiez `VITE_API_URL` dans `docker-compose.yml`.

### Rebuild après modification du code

Si vous modifiez le code, vous devez rebuild les images :

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Vider complètement et redémarrer

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker rmi trackify-backend trackify-frontend

# Rebuild et démarrer
docker-compose up -d --build
```

## 📝 Notes

- Les données MongoDB sont persistées dans un volume Docker nommé `mongodb_data`
- Le backend utilise le nom du service `mongodb` pour se connecter (pas `localhost`)
- Le frontend est servi par nginx en production
- Les variables d'environnement peuvent être modifiées dans `docker-compose.yml`

## 🔐 Sécurité

⚠️ **Important** : Pour la production, modifiez les valeurs par défaut :
- `JWT_SECRET` : Utilisez une clé secrète forte
- `MONGO_URI` : Utilisez une connexion MongoDB sécurisée
- Ajoutez des variables d'environnement via un fichier `.env` (non versionné)


