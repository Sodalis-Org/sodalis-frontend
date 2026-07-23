import { useState } from 'react'
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Home, Briefcase, Users } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthContext } from './context/AuthContext'
import { getPrivateRedirect } from './lib/routeGuard'
import { NotificationBell, NotificationDrawer } from './components/NotificationDrawer'
import Dashboard from './pages/Dashboard'
import Domus from './pages/Domus'
import Labor from './pages/Labor'
import Concordia from './pages/Concordia'
import Onboarding from './pages/Onboarding'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/domus',     label: 'Domus',     Icon: Home            },
  { to: '/labor',     label: 'Labor',     Icon: Briefcase       },
  { to: '/concordia', label: 'Concordia', Icon: Users           },
]

function BottomNav() {
  const location = useLocation()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {NAV_ITEMS.map(({ to, label, Icon }) => {
        const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            className={clsx(
              'flex flex-col items-center gap-1 text-xs font-medium transition-colors',
              isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-400'
            )}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function PrivateRoute({ children }) {
  const { token, user } = useAuthContext()
  const redirect = getPrivateRedirect({ token, user })
  if (redirect) return <Navigate to={redirect} replace />
  return children
}

function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Global notification bell — fixed top-right */}
      <div className="fixed top-4 right-4 z-30">
        <NotificationBell onClick={() => setDrawerOpen(true)} />
      </div>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Routes>
        <Route path="/"          element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/domus"     element={<PrivateRoute><Domus /></PrivateRoute>} />
        <Route path="/labor"     element={<PrivateRoute><Labor /></PrivateRoute>} />
        <Route path="/concordia" element={<PrivateRoute><Concordia /></PrivateRoute>} />
      </Routes>
      <BottomNav />
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
