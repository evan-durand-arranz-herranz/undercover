# 👁️ Undercover — Application Web PWA

Jeu de l'Undercover jouable sur iPhone (et Android) sans App Store, via une Progressive Web App.

## 🎮 Modes de jeu

- **Mode Solo** : Un seul téléphone, on se le passe à chaque tour pour voir son rôle
- **Mode Multi** : Chacun joue sur son propre téléphone via Wi-Fi ou données mobiles

---

## 🚀 Déploiement en 10 minutes (Render — gratuit)

### Étape 1 — Compte Render
1. Crée un compte gratuit sur [render.com](https://render.com)
2. Connecte ton compte GitHub

### Étape 2 — Push le code sur GitHub
```bash
cd undercover
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TON_USER/undercover.git
git push -u origin main
```

### Étape 3 — Déployer le backend (serveur)
1. Dans Render → **New → Web Service**
2. Sélectionne ton repo GitHub
3. Paramètres :
   - **Name** : `undercover-server`
   - **Root Directory** : `server`
   - **Build Command** : `npm install`
   - **Start Command** : `node index.js`
   - **Plan** : Free
4. Clique **Create Web Service**
5. Note l'URL générée, ex : `https://undercover-server.onrender.com`

### Étape 4 — Déployer le frontend (client)
1. Dans Render → **New → Static Site**
2. Sélectionne le même repo
3. Paramètres :
   - **Name** : `undercover-client`
   - **Root Directory** : `client`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
4. Ajoute une variable d'environnement :
   - Key : `VITE_SERVER_URL`
   - Value : l'URL de ton serveur (ex: `https://undercover-server.onrender.com`)
5. Clique **Create Static Site**

### Étape 5 — Installer sur iPhone
1. Ouvre l'URL du frontend dans **Safari** (ex: `https://undercover-client.onrender.com`)
2. Appuie sur le bouton **Partager** (icône carré avec flèche)
3. Sélectionne **"Sur l'écran d'accueil"**
4. L'app s'installe comme une vraie application !

> ⚠️ Doit être ouvert dans **Safari** sur iPhone pour l'installation PWA. Chrome iOS ne supporte pas l'installation.

---

## 💻 Développement local

### Prérequis
- Node.js 18+

### Backend
```bash
cd server
npm install
npm run dev
# Serveur sur http://localhost:3001
```

### Frontend
```bash
cd client
npm install
# Crée un fichier .env.local :
echo "VITE_SERVER_URL=http://localhost:3001" > .env.local
npm run dev
# App sur http://localhost:5173
```

Pour tester sur iPhone en local, utilise [ngrok](https://ngrok.com) :
```bash
ngrok http 3001  # expose le serveur
# Met l'URL ngrok dans VITE_SERVER_URL du client
ngrok http 5173  # expose le frontend
```

---

## 📁 Structure du projet

```
undercover/
├── server/
│   ├── index.js        # Serveur Socket.io + logique de jeu
│   ├── words.js        # 100+ paires de mots français
│   ├── package.json
│   └── Dockerfile
├── client/
│   ├── src/
│   │   ├── App.jsx              # Routeur principal
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Écran d'accueil
│   │   │   ├── SoloSetup.jsx    # Config partie solo
│   │   │   ├── SoloGame.jsx     # Jeu solo (pass & play)
│   │   │   ├── MultiLobby.jsx   # Lobby multijoueur
│   │   │   └── MultiGame.jsx    # Jeu multijoueur
│   │   ├── components/
│   │   │   ├── RoleReveal.jsx   # Révélation du rôle
│   │   │   ├── VotePanel.jsx    # Interface de vote
│   │   │   ├── VoteResult.jsx   # Résultats du vote
│   │   │   └── GameOver.jsx     # Fin de partie
│   │   └── utils/
│   │       └── soloGame.js      # Logique locale solo
│   ├── public/icons/            # Icônes PWA
│   ├── vite.config.js           # Config Vite + PWA
│   └── package.json
└── render.yaml                  # Config déploiement Render
```

---

## 🎭 Règles du jeu

1. Un mot secret est choisi, les **civils** reçoivent le même mot
2. L'**undercover** reçoit un mot légèrement différent
3. Le **Mr White** (optionnel) ne reçoit aucun mot
4. Chacun donne à tour de rôle un indice sur son mot, sans le révéler
5. On vote pour éliminer le suspect le plus crédible
6. **Civils gagnent** si tous les undercovers sont éliminés
7. **Undercover gagne** s'il est en minorité égale ou supérieure
8. **Mr White** gagne s'il est éliminé mais parvient à deviner le mot civil

---

## ⚙️ Configuration

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port du serveur | `3001` |
| `VITE_SERVER_URL` | URL du backend | `http://localhost:3001` |

---

## 📝 Ajouter des mots

Édite `server/words.js` pour ajouter tes propres paires :
```js
{ civil: "Ton mot", undercover: "Mot similaire" },
```

---

## 🔧 Notes techniques

- **PWA** : Installable sur iOS/Android via Safari, sans App Store
- **WebSockets** : Socket.io pour la synchronisation temps réel
- **Rooms** : Code à 4 caractères, max 12 joueurs
- **Reconnexion** : Automatique si coupure réseau
- **Données** : Stockées en mémoire (reset au redémarrage du serveur)
