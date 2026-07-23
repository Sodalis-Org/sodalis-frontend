import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../src/context/AuthContext'
import { SocketProvider } from '../src/context/SocketContext'

export function makeToken(payload) {
  return `header.${btoa(JSON.stringify(payload))}.signature`
}

export function setAuthUser(payload) {
  localStorage.setItem('sodalis_token', makeToken(payload))
}

export function AllProviders({ mocks = [], children }) {
  return (
    <MemoryRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
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
