import { render, screen, waitFor } from '@testing-library/react'
import Profile from '../../src/pages/Profile'
import { GET_MY_COLOC } from '../../src/graphql/auth'
import { GET_USERS_BY_COLOC } from '../../src/graphql/users'
import { AllProviders, setAuthUser, resetAuthUser } from '../utils.jsx'

const admin = {
  id: 'u1',
  name: 'Alice',
  email: 'a@b.com',
  role: 'ADMIN',
  coloc_id: 'c1',
}

function mocks() {
  return [
    {
      request: { query: GET_USERS_BY_COLOC, variables: { colocId: 'c1' } },
      result: {
        data: {
          usersByColoc: [
            { id: 'u1', name: 'Alice', email: 'a@b.com', role: 'ADMIN', harmony_score: 4, karma_score: 2 },
            { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'MEMBER', harmony_score: 1, karma_score: 0 },
          ],
        },
      },
    },
    {
      request: { query: GET_MY_COLOC },
      result: {
        data: { myColoc: { id: 'c1', name: 'Chez nous', invite_code: 'chez-nous-ab12' } },
      },
    },
  ]
}

describe('Profile page', () => {
  beforeEach(() => {
    resetAuthUser()
    setAuthUser(admin)
  })

  it('shows user info, coloc, invite code and members for ADMIN', async () => {
    render(
      <AllProviders mocks={mocks()}>
        <Profile />
      </AllProviders>,
    )

    await waitFor(() => {
      expect(screen.getByText('Chez nous')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0)
    expect(screen.getAllByText('a@b.com').length).toBeGreaterThan(0)
    expect(screen.getByText('chez-nous-ab12')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quitter la colocation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /se déconnecter/i })).toBeInTheDocument()
  })
})
