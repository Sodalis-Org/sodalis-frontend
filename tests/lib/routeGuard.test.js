import { getPrivateRedirect } from '../../src/lib/routeGuard.js'

describe('getPrivateRedirect', () => {
  it('redirects to /onboarding when there is no token', () => {
    expect(getPrivateRedirect({ token: null, user: null })).toBe('/onboarding')
  })

  it('redirects to /onboarding/coloc when the user has no coloc_id yet', () => {
    expect(getPrivateRedirect({ token: 'abc.def.ghi', user: { id: '1' } })).toBe(
      '/onboarding/coloc',
    )
  })

  it('allows access when a token and a coloc_id are present', () => {
    expect(getPrivateRedirect({ token: 'abc.def.ghi', user: { id: '1', coloc_id: '42' } })).toBe(
      null,
    )
  })
})
