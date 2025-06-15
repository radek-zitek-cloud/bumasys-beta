/**
 * @fileoverview Tests for Pino logger utility
 *
 * This test file validates the frontend Pino logger implementation including
 * logger initialization, configuration, and logging methods.
 */

import type { Config } from '../../../src/services/config'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getLogger,
  initializeLogger,
  logDebug,
  logError,
  logInfo,
  logWarn,
} from '../../../src/utils/logger'

// Mock pino to avoid actual logging during tests
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    level: 'debug',
  })),
}))

describe('Logger utility', () => {
  const mockConfig: Config = {
    port: 4000,
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    dbFile: 'test.db',
    logging: {
      level: 'debug',
      betterStack: {
        enabled: false,
        sourceToken: '',
        endpoint: '',
      },
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize logger with config', () => {
    const logger = initializeLogger(mockConfig)
    expect(logger).toBeDefined()
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
  })

  it('should get logger instance', () => {
    const logger = getLogger()
    expect(logger).toBeDefined()
    expect(typeof logger.debug).toBe('function')
  })

  it('should provide convenience logging methods', () => {
    // These should not throw
    expect(() => logDebug('test debug message')).not.toThrow()
    expect(() => logInfo('test info message')).not.toThrow()
    expect(() => logWarn('test warn message')).not.toThrow()
    expect(() => logError('test error message')).not.toThrow()
  })

  it('should handle logging with data objects', () => {
    const testData = { userId: '123', action: 'test' }

    expect(() => logInfo('test message with data', testData)).not.toThrow()
    expect(() => logError('test error with data', new Error('test error'))).not.toThrow()
  })

  it('should initialize with BetterStack configuration when enabled', () => {
    const configWithBetterStack: Config = {
      ...mockConfig,
      logging: {
        level: 'info',
        betterStack: {
          enabled: true,
          sourceToken: 'test-token',
          endpoint: 'https://example.com',
        },
      },
    }

    const logger = initializeLogger(configWithBetterStack)
    expect(logger).toBeDefined()
  })
})
