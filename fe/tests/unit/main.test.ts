import { describe, expect, it, vi } from 'vitest'

// Mock CSS imports
vi.mock('unfonts.css', () => ({}))

// Mock console methods to avoid noise in tests
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

// Mock the createApp function
const mockMount = vi.fn()
const mockUse = vi.fn().mockReturnThis()
const mockApp = {
  mount: mockMount,
  use: mockUse,
}

vi.mock('vue', () => ({
  createApp: vi.fn(() => mockApp),
}))

// Mock App component
vi.mock('../../src/App.vue', () => ({
  default: {},
}))

// Mock plugins
vi.mock('../../src/plugins', () => ({
  registerPlugins: vi.fn(),
}))

// Mock logger composable
const mockInitializeAppLogger = vi.fn().mockResolvedValue(undefined)
vi.mock('../../src/composables/useLogger', () => ({
  initializeAppLogger: mockInitializeAppLogger,
}))

// Mock logger utilities
const mockLogInfo = vi.fn()
vi.mock('../../src/utils/logger', () => ({
  logInfo: mockLogInfo,
}))

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    MODE: 'test',
    VITE_API_BASE_URL: 'http://localhost:4000',
    VITE_BETTERSTACK_TOKEN: ''
  }
})

describe('main.ts', () => {
  it('creates Vue application, registers plugins, initializes logger and mounts app', async () => {
    // Clear all mocks before starting
    vi.clearAllMocks()

    // Import main.ts to trigger app creation and initialization
    await import('../../src/main.ts')

    // Wait for async initialization to complete
    await new Promise(resolve => setTimeout(resolve, 200))

    // Verify createApp was called
    const { createApp } = await import('vue')
    expect(createApp).toHaveBeenCalled()

    // Verify plugins were registered
    const { registerPlugins } = await import('../../src/plugins')
    expect(registerPlugins).toHaveBeenCalledWith(mockApp)

    // Verify logger initialization was attempted
    expect(mockInitializeAppLogger).toHaveBeenCalled()

    // Verify app was mounted
    expect(mockMount).toHaveBeenCalledWith('#app')

    // Verify logging calls were made
    expect(mockLogInfo).toHaveBeenCalledWith('Starting application initialization...')
  })
})
