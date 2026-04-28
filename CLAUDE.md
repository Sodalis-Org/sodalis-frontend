# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build locally
```

No test runner or linter is configured yet.

## Architecture

**Sodalis** is a mobile-first PWA (React 18 + Vite) for colocation management. The UI is split into four modules matching the backend's domain structure.

### Backend connections

| Service | Address | Usage |
|---|---|---|
| API Gateway (GraphQL) | `http://localhost:4000/graphql` | All data queries and mutations |
| Concordia (WebSocket) | `http://localhost:3003` | Real-time push via Socket.io |

The frontend **never** calls service-domus (:3001), service-labor (:3002), or any gRPC port directly — everything goes through the gateway.

### Data flow

- **Apollo Client** (`src/lib/apolloClient.js`) handles all GraphQL calls.
- **Socket.io-client** (not yet wired) will connect to `:3003` for real-time notifications. Set it up in `src/context/`.
- **Authentication**: JWT stored locally. The token must be replaced after `createColoc` and `joinColoc` mutations — both return a new token with an updated `coloc_id`. Pass the token as `Authorization: Bearer <token>` on every request (wire this as an Apollo auth link in `apolloClient.js`).

### Routing & layout

`src/App.jsx` contains the root layout: a full-height container with a fixed **Bottom Navigation Bar** (height `h-16`, padding-bottom `pb-16`) and a `<Routes>` outlet above it. The four top-level routes are:

| Path | Page | Domain |
|---|---|---|
| `/` | Dashboard | Aggregated view (cached 30 s on gateway side) |
| `/domus` | Domus | Users, colocation profile, maintenance tickets |
| `/labor` | Labor | Household tasks, scheduling |
| `/concordia` | Concordia | Chat, polls, complaints, karma |

### MVC pattern

The codebase follows MVC. Each layer has a strict role — never mix them.

| Layer | Maps to | Location | Responsibility |
|---|---|---|---|
| **Model** | Data | `src/graphql/`, `src/context/` | GraphQL operations, global state, Socket.io events |
| **View** | UI | `src/pages/`, `src/components/` | Rendering only — receives props, emits callbacks, no business logic |
| **Controller** | Logic | `src/hooks/` | Custom hooks that call Model and return shaped data + handlers to View |

**Rule**: pages and components never import from `src/graphql/` directly. They call a hook from `src/hooks/` which owns the Apollo call or context read.

### Folder conventions

```
src/
├── components/        # (View) Shared, stateless UI primitives
├── pages/             # (View) One folder per route — index.jsx calls hooks, renders components
│   ├── Dashboard/
│   ├── Domus/
│   ├── Labor/
│   └── Concordia/
├── hooks/             # (Controller) One file per domain — useAuth, useTasks, useMaintenance…
├── graphql/           # (Model) gql query/mutation definitions, grouped by domain
├── context/           # (Model) React context providers — AuthContext, SocketContext
└── lib/               # Apollo client instance, utility singletons
```

Each page folder may contain sub-components scoped to that page; only truly shared components live in `src/components/`.

### Key domain concepts

- **Harmony Score** — reliability metric per user, lives in PostgreSQL via Domus. Incremented when tasks are marked DONE.
- **Karma Score** — social metric per user, lives in MongoDB via Concordia. Incremented (+5) when a user resolves a complaint.
- **MaintenanceTicket.id** is a PostgreSQL `SERIAL` integer, not a UUID. Use `String(ticket.id)` if a string is needed.
- **TaskStatus** enum: `TODO` → `IN_PROGRESS` → `DONE`
- **MaintenancePriority** `URGENT` automatically triggers a task creation in Labor (backend side, transparent to the frontend).
- Polls (`PollStatus: OPEN | CLOSED`) reject votes once closed — handle this gracefully in the UI.

### Real-time events (Socket.io)

Connect to `http://localhost:3003`. Events arrive as JSON with a `type` field. The full event catalogue is documented in `APIDOCUMENTATION.md` (section 15).

### API reference

`APIDOCUMENTATION.md` at the repo root is the authoritative reference for all GraphQL queries, mutations, input shapes, response types, enums, error formats, and Socket.io event payloads.
