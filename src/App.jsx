import { useState } from 'react'
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { Home, ClipboardList, User, MessageCircle } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthContext } from './context/AuthContext'
import { PageActionProvider, usePageAction } from './context/PageActionContext'
import { getPrivateRedirect } from './lib/routeGuard'
import { NotificationBell, NotificationDrawer } from './components/NotificationDrawer'
import Dashboard from './pages/Dashboard'
import Chores from './pages/Chores'
import Concordia from './pages/Concordia'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'

// "Logement" (membres, code d'invitation, actions admin) vit désormais dans le
// Profil — il n'y a plus de page ni de route dédiées.
const NAV_ITEMS = [
  { to: '/',          label: 'Accueil',   Icon: Home          },
  { to: '/concordia', label: 'Chez nous', Icon: MessageCircle },
  { to: '/chores',    label: 'Corvées',   Icon: ClipboardList },
  { to: '/profile',   label: 'Profil',    Icon: User          },
]

function BottomNav() {
  const location = useLocation()
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center">
      <nav className="w-full max-w-lg bg-card border-t border-border flex justify-around items-center h-16 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'flex flex-col items-center gap-1 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuthContext()
  if (loading) return null
  const redirect = getPrivateRedirect({ user })
  if (redirect) return <Navigate to={redirect} replace />
  return children
}

// Rangée fixe en haut à droite : le bouton d'action de la page (s'il y en a
// un — voir PageActionContext) toujours à côté de la cloche, jamais dessous.
function TopBar({ onOpenNotifications }) {
  const pageAction = usePageAction()
  return (
    <div className="fixed inset-x-0 z-30 flex justify-center pointer-events-none" style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}>
      <div className="w-full max-w-lg flex items-center justify-end gap-2 pr-4 pointer-events-auto">
        {pageAction}
        <NotificationBell onClick={onOpenNotifications} />
      </div>
    </div>
  )
}

function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl"
      >
        Aller au contenu principal
      </a>

      <div className="max-w-lg mx-auto min-h-screen bg-background pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <PageActionProvider>
          <TopBar onOpenNotifications={() => setDrawerOpen(true)} />

          <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

          <main id="main-content" tabIndex={-1}>
            <Routes>
              <Route path="/"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/chores"    element={<PrivateRoute><Chores /></PrivateRoute>} />
              <Route path="/concordia" element={<PrivateRoute><Concordia /></PrivateRoute>} />
              <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
            </Routes>
          </main>
        </PageActionProvider>
        <BottomNav />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding"       element={<Onboarding />} />
      <Route path="/onboarding/coloc" element={<Onboarding colocStep />} />
      <Route path="/*"                element={<AppLayout />} />
    </Routes>
  )
}
