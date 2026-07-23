import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import * as matchers from 'vitest-axe/matchers'
import { axe } from 'vitest-axe'
import Modal from '../../src/components/Modal'

expect.extend(matchers)

function renderModal(onClose = () => {}) {
  return render(
    <Modal title="Test modal" onClose={onClose}>
      <button type="button">First</button>
      <button type="button">Last</button>
    </Modal>
  )
}

describe('Modal', () => {
  it('exposes dialog semantics labelled by its title (RGAA 7.1, 12.7)', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Test modal' })).toHaveAttribute('aria-modal', 'true')
  })

  it('moves focus inside the dialog on mount', () => {
    renderModal()
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(onClose)
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('traps Tab focus within the dialog boundaries', async () => {
    const user = userEvent.setup()
    renderModal()
    const closeBtn = screen.getByRole('button', { name: 'Fermer' })
    const last = screen.getByRole('button', { name: 'Last' })

    last.focus()
    await user.tab()
    expect(document.activeElement).toBe(closeBtn)

    await user.tab({ shift: true })
    expect(document.activeElement).toBe(last)
  })

  it('has no axe violations', async () => {
    const { container } = renderModal()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
