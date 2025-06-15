import { describe, expect, it } from 'vitest'
import { getConfig } from '../../../src/services/config'

describe('Config Service', () => {
  it('should return frontend configuration from local files', async () => {
    const result = await getConfig()

    // Should have the config structure
    expect(result).toHaveProperty('config')
    expect(result.config).toHaveProperty('app')
    expect(result.config).toHaveProperty('api')
    expect(result.config).toHaveProperty('ui')
    expect(result.config).toHaveProperty('features')
    expect(result.config).toHaveProperty('logging')
  })

  it('should include all frontend config fields', async () => {
    const result = await getConfig()
    const config = result.config

    // Verify app configuration
    expect(config.app).toHaveProperty('name')
    expect(config.app).toHaveProperty('version')
    expect(config.app).toHaveProperty('theme')

    // Verify API configuration
    expect(config.api).toHaveProperty('baseUrl')
    expect(config.api).toHaveProperty('graphqlEndpoint')
    expect(config.api).toHaveProperty('timeout')

    // Verify UI configuration
    expect(config.ui).toHaveProperty('theme')
    expect(config.ui).toHaveProperty('pagination')
    expect(config.ui).toHaveProperty('table')

    // Verify features configuration
    expect(config.features).toHaveProperty('debugMode')
    expect(config.features).toHaveProperty('showConfigCard')
    expect(config.features).toHaveProperty('enableLogging')

    // Verify logging configuration
    expect(config.logging).toHaveProperty('level')
    expect(config.logging).toHaveProperty('console')
  })
})
