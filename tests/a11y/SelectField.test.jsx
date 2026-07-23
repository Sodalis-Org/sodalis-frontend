import { render, screen } from '@testing-library/react'
import { expect } from 'vitest'
import * as matchers from 'vitest-axe/matchers'
import { axe } from 'vitest-axe'
import SelectField from '../../src/components/SelectField'

expect.extend(matchers)

const options = [
  { value: 'u1', label: 'Alice' },
  { value: 'u2', label: 'Bob' },
]

describe('SelectField', () => {
  it('associates its label to the select via htmlFor/id (RGAA 11.1)', () => {
    render(<SelectField label="Assigner à" value="" onChange={() => {}} options={options} />)
    expect(screen.getByLabelText('Assigner à')).toBeInTheDocument()
  })

  it('propagates the required attribute (regression guard: Labor lost this once before)', () => {
    render(<SelectField label="Assigner à" value="" onChange={() => {}} options={options} required placeholder="-- Choisir --" />)
    expect(screen.getByRole('combobox')).toBeRequired()
    expect(screen.getByRole('option', { name: '-- Choisir --' })).toBeInTheDocument()
  })

  it('does not inject a placeholder option when none is provided', () => {
    render(<SelectField label="Catégorie" value="u1" onChange={() => {}} options={options} />)
    expect(screen.getAllByRole('option')).toHaveLength(options.length)
  })

  it('has no axe violations', async () => {
    const { container } = render(<SelectField label="Assigner à" value="" onChange={() => {}} options={options} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
