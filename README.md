# Sodalis Frontend

Frontend de **Sodalis**, application mobile-first (PWA) de gestion de colocation.

- **Stack** : React 18 + Vite + TailwindCSS
- **Données** : GraphQL via l’API Gateway
- **Temps réel** : Socket.io (Concordia)

## Prérequis

- Node.js 22+ (recommandé)
- npm

## Installation

```bash
npm install
```

## Démarrage (dev)

```bash
npm run dev
```

L’application tourne sur `http://localhost:5173`.

## Build & preview

```bash
npm run build
npm run preview
```

## Connexions backend

Le frontend ne contacte **jamais** les services `service-domus` / `service-labor` directement. Tout passe par la Gateway.

- **API Gateway (GraphQL)** : `http://localhost:4000/graphql`
- **Concordia (Socket.io)** : `http://localhost:3003`

## Authentification

- Le JWT vit dans un cookie `httpOnly`/`SameSite=Strict` posé par la Gateway (`login`, `createColoc`, `joinColoc`) : le frontend ne le lit ni ne le stocke jamais lui-même.
- Toutes les requêtes envoient `credentials: 'include'` pour que le cookie parte automatiquement — aucun header `Authorization` géré côté client.
- Après un rechargement de page, la query `me` réhydrate l'état de connexion depuis le cookie (le token n'est pas lisible en JavaScript).
- Après `createColoc` et `joinColoc`, le cookie est déjà mis à jour côté serveur avec le `coloc_id` courant ; le frontend appelle simplement `refreshUser()` (relance `me`) plutôt que de décoder un token retourné.

L’intégration est centralisée dans `src/lib/apolloClient.js` (Apollo Client) et `src/context/AuthContext.jsx` (réhydratation, `refreshUser`, `logout`).

## Architecture (MVC)

Le codebase suit un pattern MVC strict :

- **Model** : `src/graphql/`, `src/context/`
- **View** : `src/pages/`, `src/components/`
- **Controller** : `src/hooks/`

Règle : les pages et composants **n’importent pas** `src/graphql/` directement ; ils passent par un hook dans `src/hooks/`.

## Routing

Le layout racine est dans `src/App.jsx` avec une barre de navigation basse fixe. Les routes principales :

- `/onboarding` : connexion / inscription
- `/onboarding/coloc` : créer ou rejoindre une colocation (étape suivant l'inscription si l'utilisateur n'a pas encore de `coloc_id`)
- `/` : Dashboard (tableau de bord agrégé)
- `/chores` : Corvées & maintenance (tickets de maintenance et tâches ménagères — Domus et Labor sont fusionnés dans cette page unique côté frontend)
- `/concordia` : plaintes, sondages, karma
- `/profile` : informations du compte, de la colocation (code d'invitation, membres) et actions ADMIN

Chaque route sous `/`, `/chores`, `/concordia`, `/profile` est protégée par `PrivateRoute` (`src/App.jsx`), qui redirige vers `/onboarding` ou `/onboarding/coloc` selon `src/lib/routeGuard.js`.

## Référence API

Le fichier `APIDOCUMENTATION.md` à la racine du repo est la référence (queries/mutations, enums, erreurs, events Socket.io).

## Support utilisateur

Un problème en utilisant Sodalis ? Les signalements passent par le dépôt backend : [`SUPPORT.md`](https://github.com/Sodalis-Org/sodalis-backend/blob/main/SUPPORT.md) (formulaire GitHub ou e-mail).

