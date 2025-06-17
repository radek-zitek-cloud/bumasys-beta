/**
 * @fileoverview Unit tests for TaskStatusReportCreateDialog creator functionality
 *
 * Tests the creator field implementation including:
 * - Creator dropdown display
 * - Auto-preset based on user email
 * - Form submission with creator data
 */

import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createVuetify } from 'vuetify'
import TaskStatusReportCreateDialog from '../../../src/components/tasks/TaskStatusReportCreateDialog.vue'
import { useAuthStore } from '../../../src/stores/auth'

// Create Vuetify instance
const vuetify = createVuetify()

describe('TaskStatusReportCreateDialog Creator Field', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    const pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
  })

  const eligibleStaff = [
    {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Developer',
      department: { id: 'dept-1', name: 'Engineering' },
    },
    {
      id: 'staff-2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'Evaluator',
      department: { id: 'dept-2', name: 'Management' },
    },
  ]

  it('should display creator dropdown when eligible staff provided', async () => {
    const wrapper = mount(TaskStatusReportCreateDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        taskId: 'task-1',
        eligibleStaff,
      },
    })

    // Check that staffOptions computed property is populated
    expect(wrapper.vm.staffOptions).toHaveLength(2)
    expect(wrapper.vm.staffOptions[0].displayName).toBe('John Doe (john.doe@example.com)')
  })

  it('should auto-preset creator when user email matches eligible staff', async () => {
    // Set up auth store with user email
    authStore.setAuth({
      token: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    })

    const wrapper = mount(TaskStatusReportCreateDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        taskId: 'task-1',
        eligibleStaff,
      },
    })

    // Wait for component to initialize
    await wrapper.vm.$nextTick()

    // Check that creator is preset
    expect(wrapper.vm.form.creatorId).toBe('staff-1')
  })

  it('should not preset creator when user email does not match', async () => {
    // Set up auth store with non-matching email
    authStore.setAuth({
      token: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: 'user-1',
        email: 'other@example.com',
        firstName: 'Other',
        lastName: 'User',
      },
    })

    const wrapper = mount(TaskStatusReportCreateDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        taskId: 'task-1',
        eligibleStaff,
      },
    })

    // Wait for component to initialize
    await wrapper.vm.$nextTick()

    // Check that creator is not preset
    expect(wrapper.vm.form.creatorId).toBe('')
  })

  it('should include creatorId in emitted data when form is submitted', async () => {
    authStore.setAuth({
      token: 'test-token',
      refreshToken: 'test-refresh',
      user: {
        id: 'user-1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    })

    const wrapper = mount(TaskStatusReportCreateDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        taskId: 'task-1',
        eligibleStaff,
      },
    })

    // Wait for preset to occur
    await wrapper.vm.$nextTick()

    // Fill in required fields
    wrapper.vm.form.reportDate = '2024-01-15'
    wrapper.vm.form.statusSummary = 'Test status summary with sufficient length'

    // Submit form
    await wrapper.vm.onSubmit()

    // Check emitted event
    const emittedEvents = wrapper.emitted('created')
    expect(emittedEvents).toBeTruthy()
    expect(emittedEvents![0][0]).toEqual({
      taskId: 'task-1',
      reportDate: '2024-01-15',
      statusSummary: 'Test status summary with sufficient length',
      creatorId: 'staff-1',
    })
  })

  it('should format staff options correctly for dropdown', () => {
    const wrapper = mount(TaskStatusReportCreateDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        taskId: 'task-1',
        eligibleStaff,
      },
    })

    // Check computed staff options
    const expectedOptions = [
      {
        id: 'staff-1',
        displayName: 'John Doe (john.doe@example.com)',
        email: 'john.doe@example.com',
      },
      {
        id: 'staff-2',
        displayName: 'Jane Smith (jane.smith@example.com)',
        email: 'jane.smith@example.com',
      },
    ]

    expect(wrapper.vm.staffOptions).toEqual(expectedOptions)
  })
})
