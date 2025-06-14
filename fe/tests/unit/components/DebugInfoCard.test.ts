import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import DebugInfoCard from '../../../src/components/DebugInfoCard.vue'
import { useAuthStore } from '../../../src/stores/auth'

describe('DebugInfoCard', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('displays auth information correctly when user is logged in', () => {
    const auth = useAuthStore()

    // Set up auth state with test data
    auth.setAuth({
      token: 'test-access-token-123',
      refreshToken: 'test-refresh-token-456',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        note: 'Test user note',
      },
    })

    const wrapper = mount(DebugInfoCard)

    // Check if component renders
    expect(wrapper.exists()).toBe(true)

    // Check if title is displayed
    expect(wrapper.text()).toContain('Debug Information')

    // Check if all auth information is displayed
    expect(wrapper.text()).toContain('Logged In')
    expect(wrapper.text()).toContain('user-123')
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Doe')
    expect(wrapper.text()).toContain('Test user note')
    expect(wrapper.text()).toContain('test-access-token-123')
    expect(wrapper.text()).toContain('test-refresh-token-456')
  })

  it('displays placeholder text when user is not logged in', () => {
    const auth = useAuthStore()

    // Ensure auth is cleared
    auth.clearAuth()

    const wrapper = mount(DebugInfoCard)

    // Check if component renders
    expect(wrapper.exists()).toBe(true)

    // Check if placeholder text is displayed for missing data
    expect(wrapper.text()).toContain('Not Logged In')
    expect(wrapper.text()).toContain('Not available')
    expect(wrapper.text()).toContain('Not specified')
    expect(wrapper.text()).toContain('No note')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(DebugInfoCard)

    // Find and click the close button
    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')

    // Check if close event was emitted
    expect(wrapper.emitted()).toHaveProperty('close')
  })
})
