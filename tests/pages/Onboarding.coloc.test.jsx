import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { MockedProvider } from '@apollo/client/testing'
import { AuthProvider } from '../../src/context/AuthContext'
import { SocketProvider } from '../../src/context/SocketContext'
import Onboarding from '../../src/pages/Onboarding'
import { CREATE_COLOC, ME } from '../../src/graphql/auth'
import { setAuthUser, resetAuthUser } from '../utils.jsx'

const userWithoutColoc = {
  id: 'u1',
  name: 'Alice',
  email: 'a@b.com',
  role: 'USER',
  coloc_id: null,
}

const userWithColoc = {
  ...userWithoutColoc,
  role: 'ADMIN',
  coloc_id: 'c9',
}

const createdColoc = { id: 'c9', name: 'Maison', invite_code: 'maison-3f9a' }

function renderColocStep(mocks) {
  return render(
    <MemoryRouter initialEntries={['/onboarding/coloc']}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/onboarding/coloc" element={<Onboarding colocStep />} />
              <Route path="/" element={<div>Home</div>} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </MockedProvider>
    </MemoryRouter>,
  )
}

describe('Onboarding coloc step', () => {
  beforeEach(() => {
    resetAuthUser()
    setAuthUser(userWithoutColoc)
  })

  it('shows the invite code after createColoc even once the user has a coloc_id', async () => {
    const mocks = [
      { request: { query: ME }, result: { data: { me: userWithoutColoc } } },
      {
        request: { query: CREATE_COLOC, variables: { name: 'Maison' } },
        result: { data: { createColoc: { coloc: createdColoc } } },
      },
      // refreshUser after flushSync(setCreatedColoc)
      { request: { query: ME }, result: { data: { me: userWithColoc } } },
      // Continuer
      { request: { query: ME }, result: { data: { me: userWithColoc } } },
    ]

    renderColocStep(mocks)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText(/nom de la colocation/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/nom de la colocation/i), 'Maison')
    await user.click(screen.getByRole('button', { name: /créer ma colocation/i }))

    await waitFor(() => {
      expect(screen.getByText(createdColoc.invite_code)).toBeInTheDocument()
    })
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument()
  })

  it('navigates home after Continuer refreshes the user with coloc_id', async () => {
    const mocks = [
      { request: { query: ME }, result: { data: { me: userWithoutColoc } } },
      {
        request: { query: CREATE_COLOC, variables: { name: 'Maison' } },
        result: { data: { createColoc: { coloc: createdColoc } } },
      },
      { request: { query: ME }, result: { data: { me: userWithColoc } } },
      { request: { query: ME }, result: { data: { me: userWithColoc } } },
    ]

    renderColocStep(mocks)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByLabelText(/nom de la colocation/i)).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText(/nom de la colocation/i), 'Maison')
    await user.click(screen.getByRole('button', { name: /créer ma colocation/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continuer/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /continuer/i }))

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })
})
