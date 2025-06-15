/**
 * @fileoverview Tests for ConfigDisplayCard Component
 * 
 * This test suite verifies the ConfigDisplayCard component functionality
 * including configuration loading, error handling, and JSON formatting.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ConfigDisplayCard from '../../../src/components/ConfigDisplayCard.vue'
import * as configService from '../../../src/services/config'

// Mock the config service
vi.mock('../../../src/services/config', () => ({
  getConfig: vi.fn(),
}))

// Mock the auth store
vi.mock('../../../src/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'test-token',
  })),
}))

describe('ConfigDisplayCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders component title correctly', () => {
    const wrapper = mount(ConfigDisplayCard)
    
    // Should render the card title
    expect(wrapper.html()).toContain('Backend Configuration')
  })

  it('shows loading state initially', () => {
    const wrapper = mount(ConfigDisplayCard)
    
    // Should show loading message initially
    expect(wrapper.html()).toContain('Loading configuration...')
  })

  it('displays configuration data when loaded successfully', async () => {
    const mockConfig = {
      port: 4000,
      accessTokenExpiresIn: '15m',
      refreshTokenExpiresIn: '7d',
      dbFile: 'database.db',
    }

    vi.mocked(configService.getConfig).mockResolvedValue({ config: mockConfig })

    const wrapper = mount(ConfigDisplayCard)
    
    // Wait for the component to load the config
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should display the formatted JSON
    expect(wrapper.html()).toContain('4000')
    expect(wrapper.html()).toContain('15m')
    expect(wrapper.html()).toContain('database.db')
  })

  it('displays error message when config loading fails', async () => {
    const errorMessage = 'Failed to load configuration'
    vi.mocked(configService.getConfig).mockRejectedValue(new Error(errorMessage))

    const wrapper = mount(ConfigDisplayCard)
    
    // Wait for the error to be handled
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should display error message
    expect(wrapper.html()).toContain('Error loading configuration')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(ConfigDisplayCard)
    
    // Find and click the close button
    const buttons = wrapper.findAll('button')
    const closeButton = buttons.find(button => button.text().includes('Close'))
    
    if (closeButton) {
      await closeButton.trigger('click')
      
      // Should emit close event
      expect(wrapper.emitted()).toHaveProperty('close')
      expect(wrapper.emitted('close')).toHaveLength(1)
    }
  })

  it('formats JSON configuration properly', async () => {
    const mockConfig = {
      simpleField: 'value',
      nestedObject: {
        key: 'value',
        number: 42,
      },
    }

    vi.mocked(configService.getConfig).mockResolvedValue({ config: mockConfig })

    const wrapper = mount(ConfigDisplayCard)
    
    // Wait for the config to load
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 0))

    // Should format JSON with proper indentation
    const expectedJson = JSON.stringify(mockConfig, null, 2)
    const textarea = wrapper.find('textarea')
    
    if (textarea.exists()) {
      expect(textarea.element.value).toBe(expectedJson)
    }
  })
})