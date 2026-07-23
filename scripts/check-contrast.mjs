#!/usr/bin/env node
// Vérifie le ratio de contraste WCAG 2.1 (RGAA 3.2) de chaque combinaison
// fond/texte réellement utilisée dans src/ avec les classes Tailwind par
// défaut (pas de surcouche dans tailwind.config.js). Script autonome, aucune
// dépendance nouvelle. Exécution manuelle (tâches 5.1 et 5.4) :
//
//   node scripts/check-contrast.mjs
//
// Seuils RGAA 3.2 : 4,5:1 pour le texte normal (WCAG 1.4.3), 3:1 pour le
// texte large (>= 24px, ou >= 19px en gras) ou pour un composant d'interface
// / objet graphique non-décoratif (WCAG 1.4.11) — ex. une icône seule dans
// un bouton, sans texte visible à côté.

// Valeurs hexadécimales de la palette Tailwind par défaut (v3), pour les
// teintes réellement utilisées dans le dépôt.
const PALETTE = {
  white: '#FFFFFF',
  'gray-50': '#F9FAFB',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'gray-400': '#9CA3AF',
  'gray-500': '#6B7280',
  'gray-600': '#4B5563',
  'gray-700': '#374151',
  'red-50': '#FEF2F2',
  'red-100': '#FEE2E2',
  'red-400': '#F87171',
  'red-600': '#DC2626',
  'red-700': '#B91C1C',
  'orange-100': '#FFEDD5',
  'orange-700': '#C2410C',
  'amber-50': '#FFFBEB',
  'amber-100': '#FEF3C7',
  'amber-700': '#B45309',
  'yellow-100': '#FEF9C3',
  'yellow-700': '#A16207',
  'green-50': '#F0FDF4',
  'green-100': '#DCFCE7',
  'green-600': '#16A34A',
  'green-700': '#15803D',
  'blue-50': '#EFF6FF',
  'blue-100': '#DBEAFE',
  'blue-700': '#1D4ED8',
  'indigo-50': '#EEF2FF',
  'indigo-100': '#E0E7FF',
  'indigo-600': '#4F46E5',
  'indigo-700': '#4338CA',
  'indigo-800': '#3730A3',
  'purple-50': '#FAF5FF',
  'purple-100': '#F3E8FF',
  'purple-600': '#9333EA',
  'purple-700': '#7E22CE',
  'purple-800': '#6B21A8',
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(hexA, hexB) {
  const [l1, l2] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a)
  return (l1 + 0.05) / (l2 + 0.05)
}

// Une ligne par combinaison fond/texte distincte réellement trouvée dans
// src/ (grep `bg-*-50/100/200 text-*-400/500/600/700/800`, plus les
// occurrences de `text-gray-400`/`text-red-400` sur fond blanc ou gray-50
// sans classe bg-* explicite sur le même élément). `file` cite un exemple
// représentatif, pas toutes les occurrences (voir tableau d'audit pour la
// liste complète des lignes concernées par chaque correction).
const COMBOS = [
  // Texte gris clair sur fond blanc/quasi-blanc — le cas le plus répandu
  // (états vides, sous-titres, timestamps, emails) : ~40 occurrences,
  // corrigées en text-gray-600 dans src/components/NotificationDrawer.jsx et
  // src/pages/{Dashboard,Domus,Labor,Concordia,Onboarding}/index.jsx.
  { file: 'text-gray-400 sur blanc, ~40 occurrences — corrigé en text-gray-600', fg: 'gray-600', bg: 'white', largeText: false },

  // Badge "Annulé" / bouton suppression option de sondage — corrigés en text-red-700
  { file: 'src/pages/Domus/index.jsx:35 (badge CANCELLED)', fg: 'red-700', bg: 'red-50', largeText: false },
  { file: 'src/pages/Concordia/index.jsx:315 (bouton suppression option sondage, icône seule)', fg: 'red-700', bg: 'red-50', largeText: false },

  // Onglets inactifs (TabBar) et badges texte sur fond gris — corrigés en text-gray-600
  { file: 'src/pages/Domus/index.jsx:60 / src/pages/Labor/index.jsx:319 / src/pages/Concordia/index.jsx:598 (onglet inactif)', fg: 'gray-600', bg: 'gray-100', largeText: false },
  { file: 'src/pages/Domus/index.jsx:67 (compteur TabBar)', fg: 'gray-600', bg: 'gray-200', largeText: false },
  { file: 'src/pages/Domus/index.jsx:189-190 (Badge, valeur de secours) / :288 (badge "Membre")', fg: 'gray-600', bg: 'gray-100', largeText: false },
  { file: 'src/pages/Concordia/index.jsx:363 (badge "Fermé" d\'un sondage)', fg: 'gray-600', bg: 'gray-100', largeText: false },

  // Icônes seules (pas de texte visible à côté) : seuil non-texte 3:1 — déjà
  // conformes, aucune correction nécessaire (RGAA 3.2 ne s'applique au seuil
  // 4,5:1 qu'au texte, pas aux objets graphiques).
  { file: 'src/pages/Domus/index.jsx:177 (icône de catégorie, TicketCard)', fg: 'gray-500', bg: 'gray-100', nonText: true },
  { file: 'src/pages/Concordia/index.jsx:178 (bouton suppression plainte, icône Trash2 seule)', fg: 'red-600', bg: 'red-50', nonText: true },

  { file: 'src/components/NotificationDrawer.jsx:140,147 (boutons refresh/close, icônes seules)', fg: 'gray-500', bg: 'gray-50', nonText: true },
  { file: 'src/components/Modal.jsx (croix de fermeture, icône seule)', fg: 'gray-500', bg: 'gray-100', nonText: true },
  { file: 'src/pages/Concordia/index.jsx:115 (SelectField, texte anonyme)', fg: 'gray-700', bg: 'gray-50', largeText: false },
  { file: 'src/pages/Onboarding/index.jsx:44 (ErrorBanner) / src/pages/Domus/index.jsx:136 (alerte URGENT)', fg: 'red-700', bg: 'red-50', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:23 / src/pages/Domus/index.jsx:26 (priorité URGENT)', fg: 'red-700', bg: 'red-100', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:24 / src/pages/Domus/index.jsx:25 (priorité HIGH)', fg: 'orange-700', bg: 'orange-100', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:25 / src/pages/Domus/index.jsx:24 (priorité MEDIUM)', fg: 'yellow-700', bg: 'yellow-100', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:26,32 / src/pages/Domus/index.jsx:23,32 / src/pages/Labor/index.jsx:16 (statut DONE/RESOLVED)', fg: 'green-700', bg: 'green-100', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:31 / src/pages/Domus/index.jsx:31 / src/pages/Labor/index.jsx:15 (statut IN_PROGRESS)', fg: 'blue-700', bg: 'blue-100', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:223 (résumé colocation)', fg: 'blue-700', bg: 'blue-50', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:224 / src/pages/Concordia/index.jsx:203 (résolu)', fg: 'green-700', bg: 'green-50', largeText: false },
  { file: 'src/pages/Concordia/index.jsx:187 (statut ouverte)', fg: 'amber-700', bg: 'amber-100', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:233 (bandeau plaintes ouvertes)', fg: 'amber-700', bg: 'amber-50', largeText: false },
  { file: 'src/pages/Concordia/index.jsx:529 (encart Karma)', fg: 'purple-700', bg: 'purple-50', largeText: false },
  { file: 'src/pages/Concordia/index.jsx:550 (score Karma membre)', fg: 'purple-600', bg: 'purple-50', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:150 (ScoreCard Harmony)', fg: 'indigo-800', bg: 'indigo-50', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:156 (ScoreCard Karma)', fg: 'purple-800', bg: 'purple-50', largeText: false },
  { file: 'src/pages/Dashboard/index.jsx:256 / src/pages/Domus/index.jsx:311 (badge Admin)', fg: 'indigo-600', bg: 'indigo-100', largeText: false },
  { file: 'src/pages/Labor/index.jsx:224 (action "Démarrer/Terminer")', fg: 'indigo-600', bg: 'indigo-50', largeText: false },
  { file: 'src/pages/Domus/index.jsx:461 (libellé code invitation)', fg: 'indigo-700', bg: 'indigo-50', largeText: false },
]

let hasFailure = false
for (const { file, fg, bg, largeText, nonText } of COMBOS) {
  const ratio = contrast(PALETTE[fg], PALETTE[bg])
  const threshold = largeText || nonText ? 3 : 4.5
  const pass = ratio >= threshold
  if (!pass) hasFailure = true
  console.log(`${ratio.toFixed(2)}:1  ${pass ? 'PASS' : 'FAIL'}  text-${fg} sur bg-${bg}  (seuil ${threshold}:1${nonText ? ', objet non-texte' : ''})  — ${file}`)
}

if (hasFailure) {
  console.log('\nDes combinaisons sous le seuil WCAG AA ont été trouvées — voir ACCESSIBILITE.md (RGAA 3.2).')
}
