import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../src/context/AuthContext'
import { SocketProvider } from '../../src/context/SocketContext'
import Profile from '../../src/pages/Profile'
import { GET_MY_COLOC, ME } from '../../src/graphql/auth'
import { setAuthUser, resetAuthUser } from '../utils.jsx'

const admin = {
  id: 'u1',
  name: 'Alice',
  email: 'a@b.com',
  role: 'ADMIN',
  coloc_id: 'c1',
}

describe('Profile page', () => {
  beforeEach(() => {
    resetAuthUser()
    setAuthUser(admin)
  })

  it('shows user info, coloc and invite code for ADMIN', async () => {
    const mocks = [
      { request: { query: ME }, result: { data: { me: admin } } },
      {
        request: { query: GET_MY_COLOC },
        result: {
          data: { myColoc: { id: 'c1', name: 'Chez nous', invite_code: 'chez-nous-ab12' } },
        },
      },
    ]

    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <AuthProvider>
            <SocketProvider>
              <Profile />
            </SocketProvider>
          </AuthProvider>
        </MockedProvider>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
    expect(screen.getByText('a@b.com')).toBeInTheDocument()
    expect(screen.getByText('Chez nous')).toBeInTheDocument()
    expect(screen.getByText('chez-nous-ab12')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quitter la colocation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeInTheDocument()
  })
})
