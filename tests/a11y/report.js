// Transforme les violations brutes d'axe-core en lignes exploitables pour le
// tableau d'audit RGAA (ACCESSIBILITE.md). Le mapping vers un critère RGAA
// précis n'est pas automatique (pas de correspondance 1:1 entre les règles
// Deque/axe-core et les critères RGAA 4.1) : il reste à compléter à la main.
export function formatViolations(label, violations) {
  return violations.map((v) => ({
    page: label,
    critere_rgaa: '(à mapper manuellement)',
    regle_axe: v.id,
    impact: v.impact,
    description: v.description,
    noeuds: v.nodes.length,
  }))
}
