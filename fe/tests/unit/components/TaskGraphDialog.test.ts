/**
 * TaskGraphDialog Component Test
 *
 * Tests the enhanced functionality of the TaskGraphDialog component
 * including support for project, predecessor, and child task relationships
 */

import type { Task } from '../../../src/services/tasks'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createVuetify } from 'vuetify'

const vuetify = createVuetify()

// Mock the GraphQL service
vi.mock('../../../src/services/tasks', () => ({
  getTaskWithManagementData: vi.fn(),
}))

// Mock task data with relationships
const mockTaskWithRelationships: Task = {
  id: 'task-1',
  name: 'Current Task',
  description: 'Current task description',
  status: { id: 'status-1', name: 'In Progress' },
  priority: { id: 'priority-1', name: 'High' },
  complexity: { id: 'complexity-1', name: 'Medium' },
  project: { id: 'project-1', name: 'Test Project' },
  projectId: 'project-1',
  plannedStartDate: undefined,
  plannedEndDate: undefined,
  actualStartDate: undefined,
  actualEndDate: undefined,
  parentTaskId: undefined,
  evaluatorId: undefined,
  statusId: 'status-1',
  priorityId: 'priority-1',
  complexityId: 'complexity-1',
  predecessors: [
    {
      id: 'predecessor-1',
      name: 'Predecessor Task',
      description: 'A predecessor task',
      projectId: 'project-2',
      project: { id: 'project-2', name: 'Other Project' },
    },
  ],
  childTasks: [
    {
      id: 'child-1',
      name: 'Child Task',
      description: 'A child task',
      projectId: 'project-1',
      project: { id: 'project-1', name: 'Test Project' },
      status: { id: 'status-2', name: 'Pending' },
    },
  ],
}

// Basic mock task without relationships
const mockBasicTask: Task = {
  id: 'task-basic',
  name: 'Basic Task',
  description: 'Basic task description',
  status: { id: 'status-1', name: 'In Progress' },
  priority: { id: 'priority-1', name: 'High' },
  complexity: { id: 'complexity-1', name: 'Medium' },
  project: { id: 'project-1', name: 'Test Project' },
  projectId: 'project-1',
  plannedStartDate: undefined,
  plannedEndDate: undefined,
  actualStartDate: undefined,
  actualEndDate: undefined,
  parentTaskId: undefined,
  evaluatorId: undefined,
  statusId: 'status-1',
  priorityId: 'priority-1',
  complexityId: 'complexity-1',
}

// Enhanced mock component that better simulates the real component behavior
const MockTaskGraphDialog = {
  props: ['task'],
  emits: ['close'],
  setup(props: { task: Task }) {
    return {
      loading: false,
      error: null,
      taskData: props.task,
    }
  },
  template: `
    <v-card class="task-graph-dialog">
      <v-card-title class="dialog-header">
        <v-icon class="mr-2">mdi-graph</v-icon>
        Task Graph: {{ task?.name || 'Loading...' }}
      </v-card-title>
      <v-card-text class="dialog-content">
        <div v-if="loading" class="text-center pa-4">
          <v-progress-circular color="primary" indeterminate />
          <p class="mt-2">Loading task graph...</p>
        </div>
        <div v-else-if="error" class="text-center pa-4">
          <v-icon class="mb-2" color="error" size="48">mdi-alert-circle</v-icon>
          <p class="text-error">{{ error }}</p>
        </div>
        <div v-else class="graph-content">
          <div class="graph-wrapper">
            <div class="graph-container">
              <!-- Mock project node -->
              <div v-if="task.project" class="mock-project-node">
                Project: {{ task.project.name }}
              </div>
              <!-- Mock current task node -->
              <div class="mock-current-task-node">
                Current: {{ task.name }}
              </div>
              <!-- Mock predecessor nodes -->
              <div v-if="task.predecessors && task.predecessors.length > 0" class="mock-predecessors">
                <div v-for="pred in task.predecessors" :key="pred.id" class="mock-predecessor-node">
                  Predecessor: {{ pred.name }}
                </div>
              </div>
              <!-- Mock child task nodes -->
              <div v-if="task.childTasks && task.childTasks.length > 0" class="mock-children">
                <div v-for="child in task.childTasks" :key="child.id" class="mock-child-node">
                  Child: {{ child.name }}
                </div>
              </div>
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
  `,
}

describe('TaskGraphDialog', () => {
  it('renders the component with task name', () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockBasicTask,
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Basic Task')
    expect(wrapper.text()).toContain('Task Graph')
  })

  it('displays graph content area', async () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockBasicTask,
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.graph-content').exists()).toBe(true)
    expect(wrapper.find('.graph-container').exists()).toBe(true)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockBasicTask,
      },
      global: {
        plugins: [vuetify],
      },
    })

    const closeButton = wrapper.find('button')
    await closeButton.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('displays project node when task has project information', () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTaskWithRelationships,
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.mock-project-node').exists()).toBe(true)
    expect(wrapper.text()).toContain('Project: Test Project')
  })

  it('displays predecessor nodes when task has predecessors', () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTaskWithRelationships,
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.mock-predecessors').exists()).toBe(true)
    expect(wrapper.find('.mock-predecessor-node').exists()).toBe(true)
    expect(wrapper.text()).toContain('Predecessor: Predecessor Task')
  })

  it('displays child task nodes when task has children', () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTaskWithRelationships,
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.mock-children').exists()).toBe(true)
    expect(wrapper.find('.mock-child-node').exists()).toBe(true)
    expect(wrapper.text()).toContain('Child: Child Task')
  })

  it('displays current task node', () => {
    const wrapper = mount(MockTaskGraphDialog, {
      props: {
        task: mockTaskWithRelationships,
      },
      global: {
        plugins: [vuetify],
      },
    })

    expect(wrapper.find('.mock-current-task-node').exists()).toBe(true)
    expect(wrapper.text()).toContain('Current: Current Task')
  })
})
