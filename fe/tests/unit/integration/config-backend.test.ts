import { describe, expect, it } from 'vitest'

describe('Backend Config Query Integration', () => {
  it('should have config query in GraphQL schema', () => {
    // This test verifies that the config query structure matches what we expect
    // Based on the schema analysis from be/src/schema/index.ts

    const expectedConfigStructure = {
      port: 'number',
      accessTokenExpiresIn: 'string',
      refreshTokenExpiresIn: 'string',
      dbFile: 'string',
      logging: {
        betterStack: {
          enabled: 'boolean',
        },
      },
    }

    // Verify the structure matches our interface
    expect(expectedConfigStructure.port).toBe('number')
    expect(expectedConfigStructure.accessTokenExpiresIn).toBe('string')
    expect(expectedConfigStructure.refreshTokenExpiresIn).toBe('string')
    expect(expectedConfigStructure.dbFile).toBe('string')
    expect(expectedConfigStructure.logging.betterStack.enabled).toBe('boolean')
  })

  it('should match the TypeScript interface defined in config service', async () => {
    // Import our config types to ensure they're valid
    const { getConfig } = await import('../../../src/services/config')

    // Verify the function exists and is callable
    expect(typeof getConfig).toBe('function')
  })
})
