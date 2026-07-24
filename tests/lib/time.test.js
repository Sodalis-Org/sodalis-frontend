import { timeAgo, formatDueDate } from '../../src/lib/time.js'

describe('timeAgo', () => {
  it('returns an empty string when there is no date', () => {
    expect(timeAgo(undefined)).toBe('')
  })

  it('reports "à l\'instant" for very recent dates', () => {
    expect(timeAgo(new Date().toISOString())).toBe("à l'instant")
  })

  it('reports minutes for dates under an hour old', () => {
    const date = new Date(Date.now() - 5 * 60000).toISOString()
    expect(timeAgo(date)).toBe('il y a 5 min')
  })

  it('reports hours for dates under a day old', () => {
    const date = new Date(Date.now() - 3 * 3600000).toISOString()
    expect(timeAgo(date)).toBe('il y a 3 h')
  })

  it('reports days for older dates', () => {
    const date = new Date(Date.now() - 2 * 86400000).toISOString()
    expect(timeAgo(date)).toBe('il y a 2 j')
  })
})

describe('formatDueDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-24T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns an empty string when there is no date', () => {
    expect(formatDueDate(undefined)).toBe('')
  })

  it('labels today', () => {
    expect(formatDueDate('2026-07-24T09:00:00Z')).toBe("Aujourd'hui")
  })

  it('labels yesterday', () => {
    expect(formatDueDate('2026-07-23T09:00:00Z')).toBe('Hier')
  })

  it('labels tomorrow', () => {
    expect(formatDueDate('2026-07-25T09:00:00Z')).toBe('Demain')
  })

  it('falls back to a short date further out', () => {
    expect(formatDueDate('2026-07-20T09:00:00Z')).toBe('20 juil.')
  })
})
