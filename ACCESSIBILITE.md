# Accessibilité — Sodalis (frontend)

Ce document couvre le chantier 5 (accessibilité) du Bloc 2 « Concevoir et développer des applications logicielles » (RNCP39583). Il décrit le référentiel retenu, la méthodologie d'audit, les non-conformités corrigées et celles qui restent, ainsi que le dispositif de non-régression mis en place.

## 1. Référentiel retenu et justification

**Référentiel retenu : RGAA 4.1** (Référentiel Général d'Amélioration de l'Accessibilité, version 4.1).

Trois référentiels étaient envisageables pour ce chantier : RGAA, OPQUAST, ou les WCAG seules. Le choix du RGAA se justifie ainsi :

- **RGAA opérationnalise les WCAG.** Les WCAG 2.1 (niveau AA, visé implicitement ici) définissent des critères de succès mais ne fournissent pas de méthode de test uniforme — deux auditeurs peuvent appliquer les WCAG différemment. Le RGAA 4.1 traduit ces critères de succès en 106 critères de contrôle numérotés, chacun assorti de tests techniques précis (« le lien a-t-il un intitulé ? », « chaque champ de formulaire a-t-il une étiquette ? »). C'est ce qui permet d'annoncer un taux de conformité chiffré et reproductible, contrairement à une simple check-list de bonnes pratiques.
- **RGAA est le référentiel légal français.** Il est obligatoire pour les services publics (décret n° 2019-768) et sert de référence de fait pour la conformité accessibilité en France, y compris dans le secteur privé. Un projet visé par une certification professionnelle française gagne à s'aligner sur ce référentiel plutôt que sur un référentiel étranger ou non normatif.
- **OPQUAST écarté** : c'est un référentiel de bonnes pratiques qualité web (dont une partie touche à l'accessibilité), plus large que l'accessibilité seule mais moins normatif et moins testable spécifiquement sur ce sujet — il ne permet pas le même niveau de preuve chiffrée.
- **WCAG seules écartées** : robustes sur le fond, mais sans méthode de test officielle unique, ce qui rend la mesure d'un taux de conformité moins reproductible d'un audit à l'autre.

## 2. Méthodologie

### Échantillon audité

Cinq pages/états représentatifs, retenus pour couvrir l'ensemble des composants partagés corrigés dans ce chantier :

| Échantillon | Justification |
|---|---|
| **Dashboard** (`/`) | Page d'accueil, aucun formulaire mais boutons icône-seule, badges, états de chargement/vide |
| **Onboarding en mode connexion** (`/onboarding`) | Authentification — formulaire, `InputField` |
| **Domus, modale de création de ticket ouverte** | Proxy le plus riche du texte source (« création de tâche ») : réunit `Modal`, `SelectField`, formulaire dans une seule vue |
| **Labor** (`/labor`) | Liste des tâches — badges de statut, boutons d'action |
| **`NotificationDrawer` ouvert** | Panneau de notifications — modale secondaire, contenu dynamique |

Le choix de la modale de création de ticket dans Domus plutôt que dans Labor pour représenter « création de tâche » a été validé explicitement avant l'exécution du chantier : Domus concentre les trois composants partagés (`Modal`, `SelectField`, formulaire) dans une seule vue, ce qui maximise la couverture de l'échantillon.

### Outils utilisés

| Outil | Rôle |
|---|---|
| `eslint-plugin-jsx-a11y` (ruleset `recommended`) | Lint statique en continu (`npm run lint`, job CI `quality`) |
| `vitest-axe` + React Testing Library (`tests/a11y/pages.audit.test.jsx`) | Audit automatisé chiffré des 5 échantillons, rejouable à l'identique entre 5.1 et 5.4 |
| `@axe-core/react` (dev uniquement, `src/main.jsx`) | Audit runtime en conditions réelles de rendu (navigateur, CSS, contraste réel) — complément manuel, pas une mesure chiffrée |
| `scripts/check-contrast.mjs` + `src/lib/contrast.js` | Calcul du ratio de contraste WCAG sur les combinaisons fond/texte réellement utilisées |
| Relecture manuelle ciblée du code | Pour les critères non automatisables par les outils ci-dessus (structure du document, hiérarchie des titres, information par la couleur) |

### Limite méthodologique de `vitest-axe` sous jsdom

`axe-core` exécuté sous jsdom (environnement de test, pas un navigateur) ne fait **aucun rendu visuel** : la règle `color-contrast` d'axe est donc systématiquement rapportée `incomplete`, jamais comme violation exploitable. **Le contraste n'est donc jamais prouvé par `tests/a11y/pages.audit.test.jsx`** — il est vérifié séparément par `scripts/check-contrast.mjs`, qui calcule le ratio WCAG sur les valeurs hexadécimales réelles de la palette Tailwind utilisée dans le dépôt.

### Périmètre de critères retenu

Le RGAA 4.1 complet compte 106 critères ; les auditer intégralement sur 5 pages avec preuve à l'appui dépasse le périmètre raisonnable de ce chantier (un audit RGAA complet est normalement un travail d'expert de plusieurs jours). **Le taux de conformité de ce document porte donc sur un périmètre restreint** : les critères explicitement cités par la spécification du chantier 5 (11.1, 7.1, 12.7, 3.1, 3.2, 8.3, 8.5, 9.1, 10.7), plus un item thématique « états de chargement » ajouté pour couvrir un défaut réel trouvé en cours d'audit (perte du nom accessible des boutons pendant le chargement — rattaché à 7.1 dans l'esprit, non numéroté séparément par la spec). Ce n'est **pas** un audit RGAA complet des 106 critères — voir §6.

Formule : `taux = critères conformes / (critères conformes + critères non conformes)`, critères non applicables exclus du dénominateur.

## 3. Tableau avant/après

| # | Critère RGAA | État initial | Correction | Fichier(s) | État final |
|---|---|---|---|---|---|
| 1 | 11.1 | `InputField` (Onboarding) et `SelectField` (dupliqué 3×) : `<label>` sans `htmlFor`, champ sans `id` — aucune association programmatique. Confirmé par la règle axe `select-name` sur l'échantillon Domus | `useId()` génère un id stable, `htmlFor`/`id` lient label et champ | `src/components/InputField.jsx`, `SelectField.jsx` | Conforme |
| 2 | 11.1 | Champ « Option N » du sondage (Concordia) sans label, seulement un `placeholder` | Label visuellement masqué (`sr-only`) lié par `useId()` | `src/pages/Concordia/index.jsx` | Conforme |
| 3 | 7.1 | Croix de fermeture de `Modal` (icône seule) sans nom accessible. Confirmé par la règle axe `button-name` | `aria-label="Fermer"` | `src/components/Modal.jsx` | Conforme |
| 4 | 7.1 | `NotificationBell` : le badge de compteur, à l'intérieur du bouton, devenait son nom accessible par défaut (ex. bouton annoncé « 99 » sans contexte) | `aria-label` contextualisé (« Notifications, N non lues »), badge et icône passés en `aria-hidden` | `src/components/NotificationDrawer.jsx` | Conforme |
| 5 | 7.1 | Boutons refresh/fermeture du panneau de notifications sans nom accessible | `aria-label` explicites | `src/components/NotificationDrawer.jsx` | Conforme |
| 6 | 7.1 | Bouton de suppression d'option de sondage (icône seule) sans nom accessible | `aria-label` dynamique (« Supprimer l'option N ») | `src/pages/Concordia/index.jsx` | Conforme |
| 7 | 7.1 | Boutons refresh/déconnexion (Dashboard), retour en arrière d'une tâche et bascule de statut (Labor), suppression de plainte ×2 (Concordia) : icônes seules sans nom accessible. Confirmé par la règle axe `button-name` | `aria-label` explicites | `src/pages/Dashboard/index.jsx`, `Labor/index.jsx`, `Concordia/index.jsx` | Conforme |
| 8 | 7.1 / 12.7 | Aucune modale (`Modal`, `NotificationDrawer`) n'avait `role="dialog"`, `aria-modal`, de piège de focus, de fermeture par Échap ou de restauration du focus — un utilisateur clavier pouvait tabuler directement dans la page derrière | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, hook `useFocusTrap` (piège Tab/Shift+Tab, Échap, restauration du focus au déclencheur) | `src/components/Modal.jsx`, `src/hooks/useFocusTrap.js`, `src/components/NotificationDrawer.jsx` | Conforme |
| 9 | 3.2 | `text-gray-400` sur blanc : 2,54:1. `text-red-400` sur `bg-red-50` : 2,53:1. Cinq autres combinaisons (`text-gray-500`/`text-red-600` sur fonds gris/rouge clairs) entre 3,90:1 et 4,41:1 — toutes sous le seuil 4,5:1 pour du texte | Recoloration en `text-gray-600` / `text-red-700`, vérifiée par `scripts/check-contrast.mjs` | 9 fichiers (`src/components/*`, `src/pages/*/index.jsx`) | Conforme |
| 10 | 8.5 | `<title>` statique (« Sodalis ») pour toutes les routes — aucun moyen de distinguer les pages depuis l'historique ou les onglets du navigateur | `useDocumentTitle(title)` appelé en tête de chaque page, titre distinct par route | `src/hooks/useDocumentTitle.js` + les 5 pages | Conforme |
| 11 | 12.7 | Aucun lien d'évitement — un utilisateur clavier devait tabuler à travers la cloche de notification et la navigation basse avant d'atteindre le contenu | Lien « Aller au contenu principal », premier élément tabulable, visible au focus, cible un `<main id="main-content">` | `src/App.jsx`, `src/pages/Onboarding/index.jsx` | Conforme |
| 12 | États de chargement | `<Loader2 className="animate-spin" />` remplaçait entièrement le contenu textuel d'un bouton pendant le chargement — perte totale du nom accessible, aucune annonce du changement d'état pour les squelettes de page | `LoadingSpinner` (`role="status"` `aria-live="polite"`, icône `aria-hidden`, texte masqué) ; `role="status"`/`aria-live` sur les squelettes pleine page | `src/components/LoadingSpinner.jsx` + `Domus/`, `Labor/`, `Concordia/`, `Onboarding/index.jsx`, `Dashboard/index.jsx`, `NotificationDrawer.jsx` | Conforme |
| 13 | 1.1 / 1.2 (icônes décoratives) | Icônes `lucide-react` décoratives (à côté d'un texte porteur de sens, ou à l'intérieur d'un bouton déjà nommé par `aria-label`) exposées sans raison aux technologies d'assistance | `aria-hidden="true"` systématique | Tous les fichiers touchés par ce chantier | Conforme |

### Critères déjà conformes à l'audit initial (aucun correctif nécessaire)

| Critère RGAA | Constat | Preuve |
|---|---|---|
| 3.1 | Les badges de priorité/statut (`PRIORITIES`, `TICKET_STATUSES`, `STATUS_META`) portent systématiquement un libellé textuel distinct par valeur — l'information n'est jamais portée par la seule couleur | Lecture de code (`src/pages/Domus/index.jsx`, `Labor/index.jsx`) |
| 8.3 | `lang="fr"` présent sur `<html>` | `index.html` |
| 9.1 | Un seul `<h1>` par page, hiérarchie `h1` → `h2` cohérente, aucun saut de niveau détecté | Lecture des 5 fichiers de page |
| 10.7 | Chaque `focus:outline-none` est compensé par un `focus:ring` sur le même élément — 9/9 après le regroupement des composants partagés (`InputField`, `SelectField`) qui a déduplié plusieurs occurrences | `grep focus:outline-none` rejoué après le refactor de la tâche 5.2a |

**Point méthodologique à noter** : deux combinaisons repérées par le premier passage du script de contraste (icône seule dans le bouton de suppression de plainte — `text-red-600` sur `bg-red-50`, 4,41:1 — et icône de catégorie dans `TicketCard` — `text-gray-500` sur `bg-gray-100`, 4,39:1) avaient été provisoirement classées comme non conformes en appliquant partout le seuil texte (4,5:1). Une relecture plus précise du RGAA 3.2 / WCAG 1.4.11 a montré qu'il s'agit d'icônes seules, sans texte visible à côté : le seuil applicable est celui des objets graphiques non-décoratifs (3:1), déjà atteint. Elles ont été reclassées « conforme » sans modification de couleur — `scripts/check-contrast.mjs` distingue désormais explicitement les deux seuils (`largeText`/`nonText`).

## 4. Taux de conformité

Périmètre : 10 items (11.1, 7.1, 12.7, 3.1, 3.2, 8.3, 8.5, 9.1, 10.7, états de chargement). Formule : conformes ÷ (conformes + non conformes), non applicables exclus.

- **Taux initial (tâche 5.1) : 4 / 10 = 40 %** — conformes : 3.1, 8.3, 9.1, 10.7.
- **Taux final (tâche 5.4) : 10 / 10 = 100 %** — les 6 items non conformes de l'audit initial (11.1, 7.1, 12.7, 3.2, 8.5, états de chargement) sont désormais corrigés et vérifiés (lint, `vitest-axe` sur les 5 échantillons, `scripts/check-contrast.mjs`, tests de non-régression).

Ce taux porte sur le périmètre défini en §2, **pas** sur les 106 critères RGAA — voir §6.

## 5. Dispositif de non-régression

| Mécanisme | Portée | Job CI |
|---|---|---|
| `eslint-plugin-jsx-a11y` (`recommended`) | Lint statique à chaque push/PR | `quality` (`sodalis-frontend/.github/workflows/ci.yml`) |
| `tests/a11y/InputField.test.jsx`, `SelectField.test.jsx`, `Modal.test.jsx` | Gate strict `toHaveNoViolations()` sur les composants partagés corrigés, plus des assertions ciblées (association label/champ, `required` propagé, sémantique dialog, piège de focus, Échap) | `test` |
| `tests/a11y/badges.contrast.test.js` | Gate strict sur les ratios de contraste des combinaisons de badges (axe-core ne peut pas juger le contraste sous jsdom — c'est le seul filet de non-régression réel pour RGAA 3.2) | `test` |
| `tests/a11y/pages.audit.test.jsx` | Rapport (non bloquant) sur les 5 échantillons — permet de rejouer l'audit dans les mêmes conditions à chaque évolution | `test` |
| Score Lighthouse accessibilité (`lighthouserc.cjs`, seuil ≥ 0,95) | Mesure globale en conditions réelles de rendu | `lighthouse` — **non bloquant tant que la tâche 5.5 n'a pas confirmé un score ≥ 0,95 reproductible** (voir §6) |

## 6. Limites connues

- **jsdom ne mesure pas le contraste réel.** `axe-core` sous jsdom ne fait aucun rendu visuel ; la règle `color-contrast` reste `incomplete`. Mitigé par `scripts/check-contrast.mjs` (calcul déterministe sur les valeurs Tailwind) et par `@axe-core/react` en développement (audit en conditions réelles, mais manuel, non chiffré en CI).
- **Périmètre restreint, pas un audit RGAA complet.** Le taux de conformité de ce document porte sur 10 critères explicitement liés à la spécification du chantier, pas sur les 106 critères officiels du RGAA 4.1. Un audit RGAA complet nécessiterait un travail d'expert dédié, hors du périmètre de ce chantier.
- **Échantillon de 5 pages/états, pas l'application entière.** D'autres vues (ex. l'étape « configurer ma colocation » de l'Onboarding, les onglets Plaintes/Sondages/Karma de Concordia autres que ceux couverts) n'ont pas été passées individuellement dans `tests/a11y/pages.audit.test.jsx`, même si les corrections de composants partagés (`InputField`, `SelectField`, `Modal`) s'y appliquent également par construction.
- **`@axe-core/react` est un outil de développement, pas un contrôle continu.** Il ne s'exécute qu'en `npm run dev`, est éliminé du build de production, et ne produit pas de rapport chiffré exploitable en CI.
- **Le score Lighthouse réel n'a pas encore été mesuré à ce stade du chantier.** La tâche 5.5 (verrouillage du job `lighthouse` en CI) est conditionnelle à l'obtention d'un score ≥ 0,95 reproductible — voir le commit correspondant et `QUALITY.md` pour l'état réel.
- **Zoom, orientation, réduction du mouvement (RGAA chapitres 4, 11.10, 13) non audités.** Ce chantier s'est concentré sur les critères explicitement cités par la spécification ; d'autres chapitres du RGAA (zoom texte 200 %, orientation d'écran, `prefers-reduced-motion` pour les animations `animate-pulse`/`animate-bounce`) n'ont pas été évalués et restent un travail futur.
