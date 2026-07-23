import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'
import { axe } from 'vitest-axe'
import InputField from '../../src/components/InputField'

expect.extend(matchers)

describe('InputField', () => {
  it('associates its label to the input via htmlFor/id (RGAA 11.1)', () => {
    render(<InputField label="Adresse e-mail" value="" onChange={() => {}} />)
    expect(screen.getByLabelText('Adresse e-mail')).toBeInTheDocument()
  })

  it('links an error message via aria-describedby and sets aria-invalid', () => {
    render(<InputField label="Mot de passe" type="password" value="" onChange={() => {}} error="Trop court" />)
    const input = screen.getByLabelText('Mot de passe')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('Trop court').id)
  })

  it('exposes an accessible name on the password toggle that changes with state', async () => {
    const user = userEvent.setup()
    render(<InputField label="Mot de passe" type="password" value="" onChange={() => {}} />)
    const toggle = screen.getByRole('button', { name: 'Afficher le mot de passe' })
    await user.click(toggle)
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toBeInTheDocument()
  })

  it('has no axe violations', async () => {
    const { container } = render(<InputField label="Adresse e-mail" value="" onChange={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
