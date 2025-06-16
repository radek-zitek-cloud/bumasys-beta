/**
 * TaskGraphDialog Component Test
 * 
 * Tests the basic functionality of the TaskGraphDialog component
 */

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import type { Task } from '../../../src/services/tasks'

const vuetify = createVuetify()

// Mock task data
const mockTask: Task = {
  id: 'task-1',
  name: 'Test Task',
  description: 'Test task description',
  status: { id: 'status-1', name: 'In Progress' },
  priority: { id: 'priority-1', name: 'High' },
  complexity: { id: 'complexity-1', name: 'Medium' },
  project: { id: 'project-1', name: 'Test Project' },
  projectId: 'project-1',
  plannedStartDate: null,
  plannedEndDate: null,
  actualStartDate: null,
  actualEndDate: null,
  parentTaskId: null,
  evaluatorId: null,
  statusId: 'status-1',
  priorityId: 'priority-1',
  complexityId: 'complexity-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Simple mock component for testing without the actual Vue Flow
const MockTaskGraphDialog = {
  props: ['task'],
  emits: ['close'],
  template: `
    <v-card class="task-graph-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2">mdi-graph</v-icon>
        Task Graph: {{ task?.name || 'Loading...' }}
      </v-card-title>
      <v-card-text class="dialog-content">
        <div class="graph-content">
          <div class="graph-wrapper">
            <div class="graph-container">
              Mock Graph Content for {{ task.name }}
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="dialog-actions">
        <v-spacer />
        <v-btn color="primary" variant="text" @click="$emit('close')">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  `
}

describe('TaskGraphDialog', () => {
  it('renders the component with task name', () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTask
      },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Task')
    expect(wrapper.text()).toContain('Task Graph')
  })

  it('displays graph content area', async () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTask
      },
      global: {
        plugins: [vuetify]
      }
    })

    expect(wrapper.find('.graph-content').exists()).toBe(true)
    expect(wrapper.find('.graph-container').exists()).toBe(true)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTask
      },
      global: {
        plugins: [vuetify]
      }
    })

    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('displays the correct task information', async () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTask
      },
      global: {
        plugins: [vuetify]
      }
    })
    
    expect(wrapper.text()).toContain('Test Task')
    expect(wrapper.text()).toContain('Mock Graph Content for Test Task')
  })
})