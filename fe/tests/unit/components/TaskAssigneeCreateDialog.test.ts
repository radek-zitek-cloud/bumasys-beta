/**
 * @fileoverview Unit tests for TaskAssigneeCreateDialog component
 *
 * These tests validate the dialog's form functionality, validation, and event emission.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import TaskAssigneeCreateDialog from '../../../src/components/tasks/TaskAssigneeCreateDialog.vue'

const vuetify = createVuetify()

describe('TaskAssigneeCreateDialog', () => {
  const mockAvailableStaff = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Developer',
      department: { id: '1', name: 'Engineering' }
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'Designer',
      department: { id: '2', name: 'Design' }
    }
  ]

  const mockCurrentAssignees = [
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob@example.com',
      role: 'Manager',
      department: { id: '1', name: 'Engineering' }
    }
  ]

  it('renders the dialog with correct title', () => {
    const wrapper = mount(TaskAssigneeCreateDialog, {
      global: {
        plugins: [vuetify]
      },
      props: {
        availableStaff: mockAvailableStaff,
        currentAssignees: mockCurrentAssignees
      }
    })

    expect(wrapper.text()).toContain('Add Assignee to Task')
  })

  it('filters out current assignees from available options', () => {
    const wrapper = mount(TaskAssigneeCreateDialog, {
      global: {
        plugins: [vuetify]
      },
      props: {
        availableStaff: [...mockAvailableStaff, mockCurrentAssignees[0]],
        currentAssignees: mockCurrentAssignees
      }
    })

    // The component should only show staff that are not already assigned
    const vm = wrapper.vm as any
    expect(vm.staffOptions).toHaveLength(2)
    expect(vm.staffOptions.some((option: any) => option.value === '3')).toBe(false)
  })

  it('emits created event with staff ID when form is submitted', async () => {
    const wrapper = mount(TaskAssigneeCreateDialog, {
      global: {
        plugins: [vuetify]
      },
      props: {
        availableStaff: mockAvailableStaff,
        currentAssignees: mockCurrentAssignees
      }
    })

    // Set a staff member
    const vm = wrapper.vm as any
    vm.form.staffId = '1'

    // Submit the form
    await wrapper.find('form').trigger('submit.prevent')

    // Check that created event was emitted with correct staff ID
    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')?.[0]).toEqual(['1'])
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mount(TaskAssigneeCreateDialog, {
      global: {
        plugins: [vuetify]
      },
      props: {
        availableStaff: mockAvailableStaff,
        currentAssignees: mockCurrentAssignees
      }
    })

    // Click cancel button
    const cancelButton = wrapper.find('button[color="grey"]')
    await cancelButton.trigger('click')

    // Check that cancel event was emitted
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('displays staff options with correct format', () => {
    const wrapper = mount(TaskAssigneeCreateDialog, {
      global: {
        plugins: [vuetify]
      },
      props: {
        availableStaff: mockAvailableStaff,
        currentAssignees: []
      }
    })

    const vm = wrapper.vm as any
    expect(vm.staffOptions[0].title).toBe('John Doe - Developer (Engineering)')
    expect(vm.staffOptions[1].title).toBe('Jane Smith - Designer (Design)')
  })
})