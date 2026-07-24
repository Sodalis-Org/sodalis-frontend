import { getInitials, getAvatarColorClass } from '../../src/lib/avatar.js'

describe('getInitials', () => {
  it('builds initials from a two-word name', () => {
    expect(getInitials('Ada Lovelace')).toBe('AL')
  })

  it('uppercases and caps at two characters for longer names', () => {
    expect(getInitials('grace beatrice hopper')).toBe('GB')
  })

  it('handles a single-word name', () => {
    expect(getInitials('Cher')).toBe('C')
  })

  it('falls back to "?" when name is undefined', () => {
    expect(getInitials(undefined)).toBe('?')
  })

  it('returns an empty string when name is an empty string', () => {
    expect(getInitials('')).toBe('')
  })
})

describe('getAvatarColorClass', () => {
  it('returns a deterministic color for a given name', () => {
    expect(getAvatarColorClass('Ada Lovelace')).toBe(getAvatarColorClass('Ada Lovelace'))
  })

  it('falls back to the first color when name is undefined', () => {
    expect(getAvatarColorClass(undefined)).toBe('bg-primary/15 text-primary')
  })
})
