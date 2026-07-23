import { gql } from '@apollo/client'
import client from '../../src/lib/apolloClient.js'

function mockFetchOnce(body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    text: async () => JSON.stringify(body),
    json: async () => body,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function authHeaderFrom(fetchMock) {
  const [, options] = fetchMock.mock.calls[0]
  const headers = options.headers
  return headers instanceof Headers ? headers.get('authorization') : headers.authorization
}

const PING = gql`
  query Ping {
    ping
  }
`

describe('apolloClient auth link', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('attaches the bearer token stored in localStorage', async () => {
    localStorage.setItem('sodalis_token', 'abc.def.ghi')
    const fetchMock = mockFetchOnce({ data: { ping: 'pong' } })

    await client.query({ query: PING, fetchPolicy: 'no-cache' })

    expect(authHeaderFrom(fetchMock)).toBe('Bearer abc.def.ghi')
  })

  it('sends an empty authorization header when no token is stored', async () => {
    const fetchMock = mockFetchOnce({ data: { ping: 'pong' } })

    await client.query({ query: PING, fetchPolicy: 'no-cache' })

    expect(authHeaderFrom(fetchMock)).toBe('')
  })
})
