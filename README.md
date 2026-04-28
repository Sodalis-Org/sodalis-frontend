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

- Le JWT est stocké localement.
- Le token doit être **remplacé** après les mutations `createColoc` et `joinColoc` (elles renvoient un nouveau token avec un `coloc_id` mis à jour).
- Toutes les requêtes authentifiées doivent envoyer :

```
Authorization: Bearer <token>
```

L’intégration est centralisée dans `src/lib/apolloClient.js`.

## Architecture (MVC)

Le codebase suit un pattern MVC strict :

- **Model** : `src/graphql/`, `src/context/`
- **View** : `src/pages/`, `src/components/`
- **Controller** : `src/hooks/`

Règle : les pages et composants **n’importent pas** `src/graphql/` directement ; ils passent par un hook dans `src/hooks/`.

## Routing

Le layout racine est dans `src/App.jsx` avec une barre de navigation basse fixe. Les routes principales :

- `/` : Dashboard
- `/domus` : Domus
- `/labor` : Labor
- `/concordia` : Concordia

## Référence API

Le fichier `APIDOCUMENTATION.md` à la racine du repo est la référence (queries/mutations, enums, erreurs, events Socket.io).

