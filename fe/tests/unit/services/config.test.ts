import { describe, expect, it, vi } from 'vitest'
import { getConfig } from '../../../src/services/config'
import * as graphqlClient from '../../../src/services/graphql-client'

// Mock the graphqlClient module
vi.mock('../../../src/services/graphql-client', () => ({
  graphqlClient: vi.fn(),
}))

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'test-token',
  })),
}))

describe('Config Service', () => {
  it('should call the config query with correct parameters', async () => {
    const mockResponse = {
      config: {
        port: 4000,
        accessTokenExpiresIn: '15m',
        refreshTokenExpiresIn: '7d',
        dbFile: 'database.db',
        logging: {
          betterStack: {
            enabled: false,
          },
        },
      },
    }

    // Mock the graphqlClient function
    vi.mocked(graphqlClient.graphqlClient).mockResolvedValue(mockResponse)

    const result = await getConfig()

    expect(result).toEqual(mockResponse)
    expect(graphqlClient.graphqlClient).toHaveBeenCalledWith(
      expect.stringContaining('query'),
      {},
      'test-token',
    )
    expect(graphqlClient.graphqlClient).toHaveBeenCalledWith(
      expect.stringContaining('config'),
      {},
      'test-token',
    )
  })

  it('should include all required config fields in the query', async () => {
    const mockResponse = {
      config: {
        port: 4000,
        accessTokenExpiresIn: '15m',
        refreshTokenExpiresIn: '7d',
        dbFile: 'database.db',
        logging: {
          betterStack: {
            enabled: false,
          },
        },
      },
    }

    vi.mocked(graphqlClient.graphqlClient).mockResolvedValue(mockResponse)

    await getConfig()

    const queryCall = vi.mocked(graphqlClient.graphqlClient).mock.calls[0]
    const query = queryCall[0]

    // Verify all required fields are in the query
    expect(query).toContain('port')
    expect(query).toContain('accessTokenExpiresIn')
    expect(query).toContain('refreshTokenExpiresIn')
    expect(query).toContain('dbFile')
    expect(query).toContain('logging')
    expect(query).toContain('betterStack')
    expect(query).toContain('enabled')
  })
})
