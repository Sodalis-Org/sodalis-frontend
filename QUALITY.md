# Critères de qualité et de performance — sodalis-frontend

Ce document liste les seuils chiffrés retenus pour ce frontend, les outils qui les mesurent, et la commande exacte pour les vérifier.

| Critère | Seuil | Outil | Commande |
|---|---|---|---|
| Couverture de tests | ≥ 60% lignes (hooks/context/lib) | Vitest coverage (provider v8) | `npm run test:coverage` |
| Erreurs de lint | 0 | ESLint (`react`, `react-hooks`, `jsx-a11y`) | `npm run lint` |
| Vulnérabilités des dépendances | 0 high/critical | `npm audit` | `npm run audit` |
| Lighthouse — Performance | ≥ 90 | Lighthouse CI | `npm run lighthouse` |
| Lighthouse — Accessibilité | ≥ 95 | Lighthouse CI (+ `jsx-a11y` en garde-fou statique) | `npm run lighthouse` |

## Détails et prérequis

### Couverture de tests (≥ 60% lignes)

`vite.config.js` (bloc `test`) fixe le seuil de couverture sur les lignes à 60% (`coverage.thresholds.lines`), avec Vitest en environnement `jsdom` et React Testing Library. La commande échoue si le périmètre couvert passe en dessous.

**Stratégie de test : unitaire avec mocks.** Aucune requête réseau réelle n'est faite — les appels GraphQL sont mockés via `@apollo/client/testing` (`MockedProvider`), et `socket.io-client` est mocké globalement dans `tests/setup.js`.

**Périmètre couvert** (`coverage.include`) : `src/hooks/**`, `src/context/**`, `src/lib/**` — c'est la couche **Controller** (hooks, au sens du `CLAUDE.md` du projet) et **Model** (contextes React, client Apollo), la seule qui porte de la logique métier pure et testable en isolation.

`src/pages/**` et `src/components/**` sont volontairement exclus : ce sont des couches de composition/rendu (**View**), mieux validées par les tests manuels en navigateur (golden path + cas limites, déjà une pratique attendue sur ce projet) que par des tests unitaires qui devraient re-simuler tout l'arbre de rendu pour peu de valeur ajoutée.

État actuel (lignes) : `context` 97.2%, `hooks` 91.9%, `lib` 100%.

### Erreurs de lint (0)

`eslint.config.js` (flat config ESLint 9, syntaxe ESM car ce repo est `"type": "module"`) applique `@eslint/js` recommended + `eslint-plugin-react` + `eslint-plugin-react-hooks` + **`eslint-plugin-jsx-a11y`** (recommended) + `eslint-config-prettier` pour éviter les conflits avec Prettier. `npm run lint` doit rendre 0 erreur avant tout merge.

`jsx-a11y` sert de preuve automatisée et continue : toute régression d'accessibilité statique (label non associé, bouton sans nom accessible, gestionnaire de clic sur un élément non interactif, etc.) casse la CI immédiatement, sans attendre un audit Lighthouse.

`.prettierrc` définit le style de formatage (2 espaces, guillemets simples, pas de point-virgule — cohérent avec le style déjà en place dans le code existant). `npm run format` / `npm run format:check` sont disponibles mais ne bloquent pas la CI, comme sur `sodalis-backend` — seul ESLint est un gate dur.

### Vulnérabilités des dépendances (0 high/critical)

`npm run audit` exécute `npm audit --audit-level=high`. Les vulnérabilités `moderate` et en dessous sont tolérées (documentées ci-dessous si présentes) ; toute vulnérabilité `high` ou `critical` doit être corrigée avant merge.

Le champ `overrides` du `package.json` force `tmp@^0.2.7` et `uuid@^11.1.1` : ce sont des dépendances transitives de `@lhci/cli` (via son mode interactif `inquirer`, non utilisé par `lhci autorun`) dont les versions publiées par défaut embarquent des CVE hautes. Sans cet override, l'audit remonte 1 high + 2 moderate provenant uniquement de ce sous-arbre.

### Lighthouse — Performance ≥ 90 / Accessibilité ≥ 95

`lighthouserc.cjs` build l'application (`npm run build`), sert le résultat via `vite preview` sur le port 4173, puis lance Lighthouse 3 fois sur `/` et fait la moyenne. Le score minimum est vérifié par catégorie (`categories:performance`, `categories:accessibility`), pas sur le score global.

Mesuré en local sur la page d'onboarding (`/`, non authentifié), deux exécutions consécutives de 3 runs chacune : perf = 0.98 (6/6 runs), a11y = 1.0 (6/6 runs) — score reproductible et largement au-dessus du seuil.

**Le job `lighthouse` de la CI (`ci.yml`) est bloquant** depuis la clôture du chantier 5 (accessibilité) : le `continue-on-error` qui le neutralisait tant que l'audit RGAA n'était pas terminé a été retiré. Détail de l'audit, méthodologie et limites : [ACCESSIBILITE.md](./ACCESSIBILITE.md).

## Hors périmètre de ce document

Les critères P95 `getColocDashboard` (< 200ms) et démarrage de la stack complète (< 60s) concernent le backend (`sodalis-backend`, repo séparé) — voir son [QUALITY.md](../sodalis-backend/QUALITY.md).
