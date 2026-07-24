export function isTaskOverdue(dueAt) {
  if (!dueAt) return false
  return new Date() > new Date(dueAt)
}

export function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('fr', { day: 'numeric', month: 'short' })
}

export function isItemOverdue(item) {
  return item.kind === 'task' && item.status !== 'DONE' && isTaskOverdue(item.dueAt)
}
