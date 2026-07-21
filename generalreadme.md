# Sodalis

**Sodalis** est une application mobile-first (PWA) de gestion de colocation : utilisateurs & colocs, tâches ménagères, tickets de maintenance, et notifications temps réel.

- **Frontend** : React 18 + Vite + TailwindCSS
- **Backend** : microservices Node.js/Express + API Gateway GraphQL
- **Temps réel** : Socket.io (service Concordia)
- **Données** : PostgreSQL (Domus/Labor), MongoDB (Concordia), Redis (cache + Pub/Sub)

## Auteur

Linerol Tchecounnou

## Dépôts

- **Frontend** : `sodalis-frontend`
- **Backend** : `sodalis-backend`

## Architecture (vue d’ensemble)

```
Client (PWA)
   │
   ▼
API Gateway (GraphQL) :4000   ← point d’entrée unique
   ┌───────────────┬───────────────┐
   ▼               ▼               ▼
service-domus      service-labor   service-concordia
:3001 (Postgres)   :3002 (Postgres) :3003 (Mongo + Socket.io)
        │                │
        └──── gRPC ──────┘
                 │
                 ▼
            Redis Pub/Sub + cache
```

### Ports (par défaut)

- **Frontend (Vite)** : `http://localhost:5173`
- **GraphQL (Gateway)** : `http://localhost:4000/graphql`
- **Domus** : `http://localhost:3001`
- **Labor** : `http://localhost:3002`
- **Concordia (REST + WS)** : `http://localhost:3003`

## Démarrage rapide (dev local)

### 1) Lancer le backend (Docker)

Dans `sodalis-backend/` :

```bash
cp .env.example .env
# Renseigner au minimum JWT_SECRET et POSTGRES_PASSWORD dans .env
docker-compose up -d --build
```

Endpoints utiles :
- GraphQL : `http://localhost:4000/graphql`
- Healthchecks : `http://localhost:3001/health`, `http://localhost:3002/health`, `http://localhost:3003/health`

### 2) Lancer le frontend

Dans `sodalis-frontend/` :

```bash
npm install
npm run dev
```

## Règles d’intégration Front ↔ Back

### Point d’entrée unique

Le frontend **ne contacte jamais** `service-domus` ou `service-labor` directement : tout passe par la **Gateway GraphQL** (`:4000/graphql`).

### Auth (JWT)

- Le frontend stocke le JWT localement et l’envoie sur chaque requête :
  - `Authorization: Bearer <token>`
- Après `createColoc` et `joinColoc`, le token doit être **remplacé** (un nouveau token est renvoyé avec un `coloc_id` mis à jour).

### Temps réel (Socket.io)

- Le service Concordia écoute Redis et pousse des événements via Socket.io sur `http://localhost:3003`.
- Les événements contiennent un champ `type`. Le catalogue est documenté dans `APIDOCUMENTATION.md` côté frontend.

## Conventions de code (frontend)

Le frontend suit un MVC strict :
- **Model** : `src/graphql/`, `src/context/`
- **View** : `src/pages/`, `src/components/`
- **Controller** : `src/hooks/`

Règle : les pages/composants n’importent pas `src/graphql/` directement ; ils passent par des hooks (`src/hooks/`).

## Documentation API

- **Référence GraphQL + events** : `APIDOCUMENTATION.md` (dans `sodalis-frontend/`) fait foi.

## Variables d’environnement (backend)

Dans `sodalis-backend/.env` (Docker Compose) :
- `JWT_SECRET` (obligatoire)
- `POSTGRES_PASSWORD` (obligatoire)
- `CORS_ORIGINS` conseillé en dev : inclure `http://localhost:5173`

Exemple génération `JWT_SECRET` :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Licence

Voir `LICENSE` dans le dépôt concerné.
