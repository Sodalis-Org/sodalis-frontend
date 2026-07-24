// Cinq teintes distinctes pour différencier les personnes en un coup d'œil —
// trois dérivées de la palette (primary/secondary/accent), un neutre (muted),
// et un bleu poussière hors-palette pour garder assez de variété visuelle.
const COLORS = [
  'bg-primary/15 text-primary',
  'bg-secondary/15 text-secondary',
  'bg-accent/25 text-accent-foreground',
  'bg-muted text-foreground',
  'bg-[#dce3ea] text-[#3d5266]',
]

export function getInitials(name) {
  return name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
}

export function getAvatarColorClass(name) {
  return COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
}
