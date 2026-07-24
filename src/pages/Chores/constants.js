import { Zap, AirVent, Sofa, Wifi, HelpCircle, Bath } from 'lucide-react'

export const CATEGORIES = [
  { value: 'PLUMBING', label: 'Plomberie', Icon: Bath },
  { value: 'ELECTRICITY', label: 'Électricité', Icon: Zap },
  { value: 'APPLIANCE', label: 'Électroménager', Icon: AirVent },
  { value: 'FURNITURE', label: 'Mobilier', Icon: Sofa },
  { value: 'INTERNET', label: 'Réseau', Icon: Wifi },
  { value: 'OTHER', label: 'Autre', Icon: HelpCircle },
]

export const PRIORITIES = [
  { value: 'LOW', label: 'Faible', color: 'bg-secondary/10 text-secondary' },
  { value: 'MEDIUM', label: 'Moyenne', color: 'bg-accent/20 text-accent-foreground' },
  { value: 'HIGH', label: 'Élevée', color: 'bg-primary/10 text-primary' },
  { value: 'URGENT', label: 'Urgente', color: 'bg-destructive/10 text-destructive' },
]

export const TICKET_STATUSES = [
  { value: 'OPEN', label: 'Ouvert', color: 'bg-muted text-muted-foreground' },
  { value: 'IN_PROGRESS', label: 'En cours', color: 'bg-primary/10 text-primary' },
  { value: 'RESOLVED', label: 'Résolu', color: 'bg-secondary/10 text-secondary' },
  { value: 'CANCELLED', label: 'Annulé', color: 'bg-destructive/10 text-destructive' },
]

export const TICKET_TRANSITIONS = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['RESOLVED', 'CANCELLED'],
  RESOLVED: [],
  CANCELLED: [],
}

// Shared by tasks (TODO/IN_PROGRESS/DONE) and tickets, mapped onto the same buckets in useChores.
export const BUCKETS = [
  { value: 'TODO', label: 'À faire' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DONE', label: 'Terminées' },
]

export function categoryMeta(value) {
  return CATEGORIES.find((c) => c.value === value)
}

export function priorityMeta(value) {
  return PRIORITIES.find((p) => p.value === value)
}
