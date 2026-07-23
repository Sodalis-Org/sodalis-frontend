import { contrast } from '../../src/lib/contrast'

// Gate CI réel pour RGAA 3.2 : axe-core ne peut pas juger le contraste sous
// jsdom (pas de rendu visuel), donc cette vérification calculée est le seul
// filet de non-régression pour les couleurs de badges/texte corrigées en 5.2e.
const PALETTE = {
  white: '#FFFFFF',
  'gray-600': '#4B5563',
  'gray-100': '#F3F4F6',
  'gray-200': '#E5E7EB',
  'red-50': '#FEF2F2',
  'red-700': '#B91C1C',
  'red-100': '#FEE2E2',
  'orange-100': '#FFEDD5',
  'orange-700': '#C2410C',
  'yellow-100': '#FEF9C3',
  'yellow-700': '#A16207',
  'green-100': '#DCFCE7',
  'green-700': '#15803D',
  'blue-100': '#DBEAFE',
  'blue-700': '#1D4ED8',
}

// Combinaisons réellement utilisées pour des badges/texte (RGAA 3.2, seuil
// texte normal 4,5:1) — voir scripts/check-contrast.mjs pour la liste
// complète et les combinaisons d'icônes seules (seuil 3:1 non-texte).
const TEXT_COMBOS = [
  ['gray-600', 'white'],
  ['gray-600', 'gray-100'],
  ['gray-600', 'gray-200'],
  ['red-700', 'red-50'],
  ['red-700', 'red-100'],
  ['orange-700', 'orange-100'],
  ['yellow-700', 'yellow-100'],
  ['green-700', 'green-100'],
  ['blue-700', 'blue-100'],
]

describe('contrastes de badges (RGAA 3.2)', () => {
  it.each(TEXT_COMBOS)('text-%s sur bg-%s atteint au moins 4.5:1', (fg, bg) => {
    const ratio = contrast(PALETTE[fg], PALETTE[bg])
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})
