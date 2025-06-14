import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import UserViewDialog from '../../../src/components/UserViewDialog.vue'

describe('UserViewDialog', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    note: 'Test note',
  }

  it('renders user details correctly', () => {
    const wrapper = mount(UserViewDialog, {
      props: {
        user: mockUser,
      },
    })

    // Check if user email is displayed
    expect(wrapper.text()).toContain('test@example.com')
    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Doe')
    expect(wrapper.text()).toContain('Test note')
    expect(wrapper.text()).toContain('1')
  })

  it('displays placeholder text for missing optional fields', () => {
    const userWithoutOptionalFields = {
      id: '2',
      email: 'test2@example.com',
    }

    const wrapper = mount(UserViewDialog, {
      props: {
        user: userWithoutOptionalFields,
      },
    })

    expect(wrapper.text()).toContain('Not specified')
    expect(wrapper.text()).toContain('No note')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(UserViewDialog, {
      props: {
        user: mockUser,
      },
    })

    const closeButton = wrapper.find('[data-testid="close-button"]')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
    } else {
      // Find button with Close text
      const buttons = wrapper.findAll('button')
      const closeBtn = buttons.find(btn => btn.text().includes('Close'))
      if (closeBtn) {
        await closeBtn.trigger('click')
      }
    }

    expect(wrapper.emitted()).toHaveProperty('close')
  })
})
