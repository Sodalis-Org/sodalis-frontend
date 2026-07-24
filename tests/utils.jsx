import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../src/context/AuthContext'
import { SocketProvider } from '../src/context/SocketContext'
import { PageActionProvider, PageActionSlot } from '../src/context/PageActionContext'
import { ME } from '../src/graphql/auth'
import { GET_UNREAD_NOTIFICATIONS_COUNT, MARK_NOTIFICATIONS_READ } from '../src/graphql/dashboard'

// Le jeton vit désormais dans un cookie httpOnly : les tests ne peuvent plus le
// déposer dans localStorage. AuthProvider interroge la query `me` au montage, donc
// tout test qui le rend doit fournir un mock pour cette requête — currentAuthUser
// pilote la réponse par défaut, à définir avant le render (setAuthUser).
let currentAuthUser = null

export function setAuthUser(user) {
  currentAuthUser = user
}

export function resetAuthUser() {
  currentAuthUser = null
}

function meMock() {
  return {
    request: { query: ME },
    result: { data: { me: currentAuthUser } },
  }
}

// SocketProvider interroge ce compteur en tâche de fond dès qu'un utilisateur avec
// coloc_id est authentifié — un défaut ici évite à chaque test d'avoir à le mocker.
function unreadNotificationsCountMock() {
  return {
    request: { query: GET_UNREAD_NOTIFICATIONS_COUNT, variables: { colocId: currentAuthUser?.coloc_id } },
    result: { data: { unreadNotificationsCount: 0 } },
    maxUsageCount: Number.POSITIVE_INFINITY,
  }
}

function markNotificationsReadMock() {
  return {
    request: { query: MARK_NOTIFICATIONS_READ, variables: { colocId: currentAuthUser?.coloc_id } },
    result: { data: { markNotificationsRead: true } },
    maxUsageCount: Number.POSITIVE_INFINITY,
  }
}

export function AllProviders({ mocks = [], children }) {
  return (
    <MemoryRouter>
      <MockedProvider mocks={[meMock(), unreadNotificationsCountMock(), markNotificationsReadMock(), ...mocks]} addTypename={false}>
        <AuthProvider>
          <SocketProvider>
            <PageActionProvider>
              <PageActionSlot />
              {children}
            </PageActionProvider>
          </SocketProvider>
        </AuthProvider>
      </MockedProvider>
    </MemoryRouter>
  )
}

export function makeWrapper(mocks = []) {
  return function Wrapper({ children }) {
    return <AllProviders mocks={mocks}>{children}</AllProviders>
  }
}
