import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createVuetify } from 'vuetify'
import TaskPredecessorDialog from '../../../src/components/tasks/TaskPredecessorDialog.vue'

// Mock Vuetify
const vuetify = createVuetify()

const mockAvailableTasks = [
  {
    id: '1',
    name: 'Task 1',
    project: { id: 'proj1', name: 'Project 1' },
    projectId: 'proj1',
    parentTaskId: null,
  },
  {
    id: '2',
    name: 'Task 2',
    project: { id: 'proj2', name: 'Project 2' },
    projectId: 'proj2',
    parentTaskId: null,
  },
]

const mockAvailableProjects = [
  { id: 'proj1', name: 'Project 1' },
  { id: 'proj2', name: 'Project 2' },
]

const mockAvailableStatuses = [
  { id: 'status1', name: 'To Do' },
  { id: 'status2', name: 'In Progress' },
]

const mockAvailablePriorities = [
  { id: 'priority1', name: 'High' },
  { id: 'priority2', name: 'Medium' },
]

const mockAvailableComplexities = [
  { id: 'complex1', name: 'Simple' },
  { id: 'complex2', name: 'Complex' },
]

describe('TaskPredecessorDialog', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(TaskPredecessorDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        availableTasks: mockAvailableTasks,
        availableProjects: mockAvailableProjects,
        availableStatuses: mockAvailableStatuses,
        availablePriorities: mockAvailablePriorities,
        availableComplexities: mockAvailableComplexities,
        currentPredecessors: [],
        currentTaskId: '3',
      },
    })
  })

  it('renders the component with both tabs', () => {
    expect(wrapper.find('.v-card-title').text()).toBe('Add Predecessor Task')
    expect(wrapper.text()).toContain('Select Existing Task')
    expect(wrapper.text()).toContain('Create New Task')
  })

  it('shows select existing task form by default', () => {
    expect(wrapper.find('[label="Predecessor Task *"]').exists()).toBe(true)
  })

  it('filters out current task from available options', () => {
    const taskOptions = wrapper.vm.taskOptions
    expect(taskOptions.every((option: any) => option.value !== '3')).toBe(true)
  })

  it('emits predecessor-selected event when form is submitted in select mode', async () => {
    wrapper.vm.selectForm.predecessorTaskId = '1'
    await wrapper.vm.onSelectSubmit()

    expect(wrapper.emitted()['predecessor-selected']).toBeTruthy()
    expect(wrapper.emitted()['predecessor-selected'][0]).toEqual(['1'])
  })

  it('emits predecessor-created event when form is submitted in create mode', async () => {
    wrapper.vm.selectedTab = 'create'
    wrapper.vm.createForm.name = 'New Task'
    wrapper.vm.createForm.projectId = 'proj1'

    await wrapper.vm.onCreateSubmit()

    expect(wrapper.emitted()['predecessor-created']).toBeTruthy()
    expect(wrapper.emitted()['predecessor-created'][0][0]).toMatchObject({
      name: 'New Task',
      projectId: 'proj1',
    })
  })
})
