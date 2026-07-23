import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'
import { axe } from 'vitest-axe'
import { AllProviders, setAuthUser, resetAuthUser } from '../utils.jsx'
import { GET_COLOC_DASHBOARD, GET_NOTIFICATIONS } from '../../src/graphql/dashboard'
import { GET_MAINTENANCE_TICKETS } from '../../src/graphql/maintenance'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import { GET_MY_COLOC } from '../../src/graphql/auth'
import { GET_TASKS_BY_COLOC } from '../../src/graphql/tasks'
import Dashboard from '../../src/pages/Dashboard'
import Onboarding from '../../src/pages/Onboarding'
import Domus from '../../src/pages/Domus'
import Labor from '../../src/pages/Labor'
import { NotificationDrawer } from '../../src/components/NotificationDrawer'
import { formatViolations } from './report'

expect.extend(matchers)

// Échantillon retenu pour l'audit RGAA (tâches 5.1/5.4) : accueil (Dashboard),
// authentification (Onboarding en mode connexion), création de ticket (Domus,
// modale ouverte), liste des tâches (Labor), notifications (NotificationDrawer).
// jsdom ne fait aucun rendu visuel : la règle axe-core "color-contrast" ne peut
// pas conclure ici (toujours "incomplete", jamais violation exploitable) — le
// contraste est vérifié séparément par scripts/check-contrast.mjs.

const colocId = 'c1'

function dashboardMocks() {
  return [
    {
      request: { query: GET_COLOC_DASHBOARD, variables: { colocId } },
      result: {
        data: {
          getColocDashboard: {
            users: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }],
            tasks: [
              { id: 't1', status: 'TODO', assignee_id: 'u1' },
              { id: 't2', status: 'IN_PROGRESS', assignee_id: 'u1' },
              { id: 't3', status: 'DONE', assignee_id: 'u2' },
            ],
            open_complaints: 1,
          },
        },
      },
    },
    {
      request: { query: GET_NOTIFICATIONS, variables: { colocId, page: 1, limit: 10 } },
      result: { data: { notifications: { data: [{ id: 'n1', message: 'Bienvenue', created_at: new Date().toISOString() }] } } },
    },
    {
      request: { query: GET_MAINTENANCE_TICKETS, variables: { colocId } },
      result: {
        data: {
          maintenanceTickets: [
            { id: 1, title: 'Fuite', priority: 'URGENT', status: 'OPEN', category: 'PLUMBING' },
            { id: 2, title: 'Ampoule', priority: 'LOW', status: 'OPEN', category: 'ELECTRICITY' },
          ],
        },
      },
    },
  ]
}

function domusMocks() {
  return [
    {
      request: { query: GET_USERS_BY_COLOC, variables: { colocId } },
      result: { data: { usersByColoc: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }] } },
    },
    {
      request: { query: GET_MAINTENANCE_TICKETS, variables: { colocId } },
      result: {
        data: {
          maintenanceTickets: [
            { id: 1, title: 'Fuite', status: 'OPEN', priority: 'HIGH', category: 'PLUMBING' },
          ],
        },
      },
    },
    {
      request: { query: GET_MY_COLOC },
      result: { data: { myColoc: { id: colocId, name: 'Maison', invite_code: 'XYZ' } } },
    },
  ]
}

function laborMocks() {
  return [
    {
      request: { query: GET_TASKS_BY_COLOC, variables: { colocId } },
      result: {
        data: {
          tasksByColoc: [
            { id: 't1', title: 'Vaisselle', status: 'TODO', assignee_id: 'u1', due_at: null },
            { id: 't2', title: 'Poubelles', status: 'IN_PROGRESS', assignee_id: 'u1', due_at: '2999-01-01' },
          ],
        },
      },
    },
    {
      request: { query: GET_USERS_BY_COLOC, variables: { colocId } },
      result: { data: { usersByColoc: [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }] } },
    },
  ]
}

function notifMocks() {
  return [
    {
      request: { query: GET_NOTIFICATIONS, variables: { colocId, page: 1, limit: 15 } },
      result: {
        data: {
          notifications: {
            data: [{ id: 'n1', message: 'Bienvenue dans Sodalis', type: 'NEW_TASK', created_at: new Date().toISOString() }],
            pagination: { total: 1, limit: 15 },
          },
        },
      },
    },
  ]
}

describe('audit RGAA — échantillon de pages', () => {
  beforeEach(() => {
    resetAuthUser()
    setAuthUser({ id: 'u1', coloc_id: colocId, role: 'ADMIN' })
  })

  it.each([
    ['Dashboard', () => <AllProviders mocks={dashboardMocks()}><Dashboard /></AllProviders>],
    ['Domus', () => <AllProviders mocks={domusMocks()}><Domus /></AllProviders>],
    ['Labor', () => <AllProviders mocks={laborMocks()}><Labor /></AllProviders>],
  ])('%s ne provoque pas de crash et produit un rapport axe', async (label, renderPage) => {
    const { container } = render(renderPage())
    await screen.findByRole('heading', { level: 1 })
    const results = await axe(container)
    console.table(formatViolations(label, results.violations))
    // Rapport non bloquant à ce stade (tâche 5.1) : l'app n'est pas encore
    // corrigée, un gate strict ferait échouer npm run test. Le gate strict
    // arrive en tâche 5.3, sur les composants déjà corrigés.
    expect(Array.isArray(results.violations)).toBe(true)
  })

  it('Onboarding (connexion) ne provoque pas de crash et produit un rapport axe', async () => {
    resetAuthUser()
    const { container } = render(<AllProviders><Onboarding /></AllProviders>)
    await screen.findByRole('heading', { level: 1, name: /sodalis/i })
    const results = await axe(container)
    console.table(formatViolations('Onboarding (connexion)', results.violations))
    expect(Array.isArray(results.violations)).toBe(true)
  })

  it('Domus — modale de création de ticket produit un rapport axe', async () => {
    const user = userEvent.setup()
    const { container } = render(<AllProviders mocks={domusMocks()}><Domus /></AllProviders>)
    await screen.findByRole('heading', { level: 1 })
    await user.click(screen.getByRole('button', { name: /maintenance/i }))
    await user.click(screen.getByRole('button', { name: /signaler/i }))
    await screen.findByRole('heading', { name: /nouveau ticket/i })
    const results = await axe(container)
    console.table(formatViolations('Domus (modale création ticket)', results.violations))
    expect(Array.isArray(results.violations)).toBe(true)
  })

  it('NotificationDrawer ouvert produit un rapport axe', async () => {
    const { container } = render(
      <AllProviders mocks={notifMocks()}>
        <NotificationDrawer open onClose={() => {}} />
      </AllProviders>
    )
    await screen.findByRole('heading', { name: /notifications/i })
    const results = await axe(container)
    console.table(formatViolations('NotificationDrawer', results.violations))
    expect(Array.isArray(results.violations)).toBe(true)
  })
})
