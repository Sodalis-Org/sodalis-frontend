import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => {
    const handlers = {}
    return {
      on: vi.fn((event, cb) => {
        handlers[event] = cb
      }),
      off: vi.fn(),
      disconnect: vi.fn(),
      __handlers: handlers,
    }
  }),
}))
