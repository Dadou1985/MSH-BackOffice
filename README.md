 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
new file mode 100644
index 0000000000000000000000000000000000000000..fc44fd83fdca5e5e7e3b609b83006b756d5aab8e
--- /dev/null
+++ b/README.md
@@ -0,0 +1,68 @@
+# MSH Back Office
+
+MSH Back Office est une API Node.js/TypeScript qui combine Express, Apollo Server (GraphQL) et Socket.IO pour piloter la plateforme MySweetHotel. L'application expose des mutations et requêtes GraphQL, fournit des web sockets pour les notifications temps réel et gère les tâches récurrentes (remise à zéro des invités, envoi d'emails, etc.).
+
+## Prérequis
+- Node.js 18+ et npm
+- Un accès à une base MongoDB
+- Un projet Firebase (Firestore + clés de service et API de traduction)
+- Un compte SMTP IONOS pour l'envoi d'emails
+- Des clés VAPID pour les notifications web push
+- (Optionnel) Une instance Redis si vous souhaitez activer la mise en liste noire des tokens
+
+## Installation
+1. Cloner le dépôt puis installer les dépendances :
+   ```bash
+   npm install
+   ```
+2. Compiler le projet TypeScript vers `dist/` :
+   ```bash
+   npm run build
+   ```
+
+## Configuration
+Les variables d'environnement sont chargées depuis un fichier `.env.<NODE_ENV>.local` (par exemple `.env.development.local`). Les clés principales à définir :
+- `PORT` : port HTTP (3000 par défaut)
+- `MONGODB_URI` et `MONGO_DB_NAME` : connexion MongoDB
+- `JWT_SECRET` : secret de signature des tokens
+- `REDIS_URL` : URL Redis pour la mise en liste noire des tokens
+- Clés Firebase : `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_CLIENT_ID`, `FIREBASE_AUTH_URI`, `FIREBASE_TOKEN_URI`, `FIREBASE_AUTH_PROVIDER_CERT_URL`, `FIREBASE_CLIENT_CERT_URL`
+- SMTP IONOS : `IONOS_SMTP_HOST`, `IONOS_SMTP_PORT`, `IONOS_AUTH`, `IONOS_PASSWORD`
+- Web push : `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`
+
+## Lancer le serveur
+- **Mode production** (après compilation) :
+  ```bash
+  npm start
+  ```
+- **Mode développement** (recharge via nodemon) :
+  ```bash
+  NODE_ENV=development npm run dev
+  ```
+
+L'API répond sur `http://localhost:<PORT>` et expose le playground GraphQL sur `/graphql`. Les sockets sont servis sur le même serveur HTTP et autorisent les origines configurées dans `app.ts`.
+
+## Fonctionnalités clés
+- Connexion MongoDB via Mongoose et migrations Firestore → MongoDB.
+- Authentification JWT avec mise en liste noire via Redis.
+- API GraphQL (Apollo Server) pour gérer hôtels, utilisateurs business/guest, feedbacks, supports, etc.
+- Web sockets (Socket.IO) pour les notifications applicatives et de chat.
+- Cron quotidien (14h) pour réinitialiser les profils invités et envoyer les emails de check-out.
+- Intégrations email (SMTP IONOS), web push (VAPID) et traduction (Google/Firebase).
+
+## Scripts utiles
+- `npm run lint` : linting ESLint
+- `npm run format` : formatage Prettier
+- `npm run build` : compilation TypeScript
+- `npm start` : démarrage de la version compilée
+
+## Structure du projet
+- `app.ts` : configuration Express, sockets et démarrage du serveur
+- `graphql/` : schéma GraphQL (`typeDefs`) et `resolvers`
+- `routes/` : routes REST (actuellement commentées dans `app.ts`)
+- `models/` : modèles Mongoose (hôtels, utilisateurs, feedbacks, etc.)
+- `utils/` : utilitaires (base de données, emails, JWT, Redis, traduction, web push)
+
+## Ressources complémentaires
+- Endpoint de santé : `GET /` renvoie `🟢 MSH Back Office API is running`
+- Le dépôt utilise ES modules, TypeScript strict et génère les builds dans `dist/`
 
EOF
)
