# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et ce projet respecte le
[Semantic Versioning](https://semver.org/lang/fr/).

## Règle d'incrémentation retenue

- **MAJEUR** : rupture de compatibilité (changement de contrat avec l'API gateway, changement
  structurel de routage cassant des liens existants).
- **MINEUR** : nouvelle fonctionnalité rétrocompatible (nouvelle page, nouveau composant partagé,
  nouvelle intégration).
- **CORRECTIF** : correction de bug, durcissement, documentation, outillage ou refactoring interne
  n'affectant pas le comportement visible.

## [Non publié]

### Changed

- Mise à jour de `CLAUDE.md` : les affirmations sur l'absence de runner de tests, sur Socket.io
  « non câblé » et sur l'auth link Apollo « à câbler » ne sont plus d'actualité.

## [1.0.0] - 2026-07-23

Première version considérée prête pour un déploiement en production, alignée sur la version 1.0.0
du backend.

### Changed

- CI restructurée en jobs distincts `quality`, `test`, `security`, `build`, `lighthouse`
  (`ci.yml`) ; le job Lighthouse (auparavant un workflow manuel séparé) tourne désormais
  automatiquement à chaque push/PR, en mode non bloquant (`continue-on-error`) jusqu'au chantier 5.

## [0.4.0] - 2026-07-23

### Changed

- Amélioration du routage et de la structure des composants (garde-fous de route, avatar).

## [0.3.0] - 2026-07-23

### Added

- Suite de tests Vitest (hooks, contextes, client Apollo), configuration ESLint avec
  `eslint-plugin-jsx-a11y`, workflow d'intégration continue, configuration Lighthouse CI,
  `QUALITY.md` (chantiers 1 et 2 — socle qualité et tests unitaires).

## [0.2.0] - 2026-07-21

### Added

- Documentation du projet : README du frontend et README général de l'application Sodalis.

## [0.1.0] - 2026-04-28

### Added

- Version initiale de l'application : pages Dashboard, Domus, Labor, Concordia et Onboarding,
  mise en page Tailwind, client Apollo.
