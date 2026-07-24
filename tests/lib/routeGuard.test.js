import { getPrivateRedirect } from '../../src/lib/routeGuard.js'

describe('getPrivateRedirect', () => {
  it('redirects to /onboarding when there is no user', () => {
    expect(getPrivateRedirect({ user: null })).toBe('/onboarding')
  })

  it('redirects to /onboarding/coloc when the user has no coloc_id yet', () => {
    expect(getPrivateRedirect({ user: { id: '1' } })).toBe('/onboarding/coloc')
  })

  it('allows access when the user has a coloc_id', () => {
    expect(getPrivateRedirect({ user: { id: '1', coloc_id: '42' } })).toBe(null)
  })
})
