import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../src/context/AuthContext'
import { SocketProvider } from '../src/context/SocketContext'
import { ME } from '../src/graphql/auth'

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

export function AllProviders({ mocks = [], children }) {
  return (
    <MemoryRouter>
      <MockedProvider mocks={[meMock(), ...mocks]} addTypename={false}>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
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
