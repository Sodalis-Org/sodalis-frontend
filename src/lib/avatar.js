const COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
]

export function getInitials(name) {
  return name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
}

export function getAvatarColorClass(name) {
  return COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
}
