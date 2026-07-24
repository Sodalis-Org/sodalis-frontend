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

const PING = gql`
  query Ping {
    ping
  }
`

describe('apolloClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends the httpOnly auth cookie on every request instead of a Bearer header', async () => {
    const fetchMock = mockFetchOnce({ data: { ping: 'pong' } })

    await client.query({ query: PING, fetchPolicy: 'no-cache' })

    const [, options] = fetchMock.mock.calls[0]
    expect(options.credentials).toBe('include')
    const headers = options.headers
    const authHeader = headers instanceof Headers ? headers.get('authorization') : headers.authorization
    expect(authHeader).toBeFalsy()
  })
})
