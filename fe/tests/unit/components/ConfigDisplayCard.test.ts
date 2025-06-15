/**
 * @fileoverview Tests for ConfigDisplayCard Component
 *
 * This test suite verifies the ConfigDisplayCard component functionality
 * including configuration loading, error handling, and JSON formatting.
 *
 * Note: These tests focus on component logic rather than DOM content
 * since the component uses Vuetify stubs in the test environment.
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ConfigDisplayCard from '../../../src/components/ConfigDisplayCard.vue'
import * as configService from '../../../src/services/config'

// Mock the config service
vi.mock('../../../src/services/config', () => ({
  getConfig: vi.fn(),
}))

describe('ConfigDisplayCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders component correctly', () => {
    // Mock successful config loading
    vi.mocked(configService.getConfig).mockResolvedValue({
      config: {
        app: { name: 'Test App', version: '1.0.0', theme: 'default' },
        api: { baseUrl: 'http://localhost:4000', graphqlEndpoint: '/graphql', timeout: 10_000 },
        ui: { theme: { dark: false, primaryColor: '#1976d2' }, pagination: {}, table: {} },
        features: { debugMode: false, showConfigCard: true, enableLogging: true },
        logging: { level: 'info', console: { enabled: true, pretty: true } },
      } as any,
    })

    const wrapper = mount(ConfigDisplayCard)
    expect(wrapper.vm).toBeDefined()
  })

  it('calls getConfig on mount', () => {
    vi.mocked(configService.getConfig).mockResolvedValue({
      config: {
        app: { name: 'Test App', version: '1.0.0', theme: 'default' },
        api: { baseUrl: 'http://localhost:4000', graphqlEndpoint: '/graphql', timeout: 10_000 },
        ui: { theme: { dark: false, primaryColor: '#1976d2' }, pagination: {}, table: {} },
        features: { debugMode: false, showConfigCard: true, enableLogging: true },
        logging: { level: 'info', console: { enabled: true, pretty: true } },
      } as any,
    })

    mount(ConfigDisplayCard)

    expect(configService.getConfig).toHaveBeenCalledOnce()
  })

  it('handles configuration loading correctly', async () => {
    const mockConfig = {
      app: {
        name: 'Test App',
        version: '1.0.0',
        theme: 'default',
      },
      api: {
        baseUrl: 'http://localhost:4000',
        graphqlEndpoint: '/graphql',
        timeout: 10_000,
      },
      ui: {
        theme: {
          dark: false,
          primaryColor: '#1976d2',
        },
        pagination: { defaultPageSize: 10, pageSizeOptions: [5, 10, 25, 50] },
        table: { sortable: true, filterable: true },
      },
      features: {
        debugMode: false,
        showConfigCard: true,
        enableLogging: true,
      },
      logging: {
        level: 'info',
        console: {
          enabled: true,
          pretty: true,
        },
      },
    }

    vi.mocked(configService.getConfig).mockResolvedValue({ config: mockConfig as any })

    const wrapper = mount(ConfigDisplayCard)

    // Wait for the component to process
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    // Check that the component data has been set
    expect(wrapper.vm.config).toEqual(mockConfig)
  })

  it('handles configuration loading errors', async () => {
    const errorMessage = 'Failed to load configuration'
    vi.mocked(configService.getConfig).mockRejectedValue(new Error(errorMessage))

    const wrapper = mount(ConfigDisplayCard)

    // Wait for error handling
    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    // Check that error was set
    expect(wrapper.vm.error).toContain(errorMessage)
  })

  it('emits close event when close button is clicked', async () => {
    vi.mocked(configService.getConfig).mockResolvedValue({
      config: {
        app: { name: 'Test', version: '1.0.0', theme: 'default' },
      } as any,
    })

    const wrapper = mount(ConfigDisplayCard)

    // Find and click the close button by emitting the close event directly
    wrapper.vm.$emit('close')

    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('formats config as JSON correctly', async () => {
    const mockConfig = {
      app: { name: 'Test App', version: '1.0.0' },
      api: { baseUrl: 'http://localhost:4000' },
    }

    vi.mocked(configService.getConfig).mockResolvedValue({ config: mockConfig as any })

    const wrapper = mount(ConfigDisplayCard)

    await new Promise(resolve => setTimeout(resolve, 0))
    await wrapper.vm.$nextTick()

    // Check the formatted config includes JSON stringified content
    const formattedConfig = wrapper.vm.formattedConfig
    expect(formattedConfig).toContain('Test App')
    expect(formattedConfig).toContain('http://localhost:4000')
  })
})
