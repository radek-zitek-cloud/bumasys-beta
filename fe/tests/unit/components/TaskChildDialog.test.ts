import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createVuetify } from 'vuetify'
import TaskChildDialog from '../../../src/components/tasks/TaskChildDialog.vue'

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
    project: { id: 'proj1', name: 'Project 1' },
    projectId: 'proj1',
    parentTaskId: null,
  },
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

describe('TaskChildDialog', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(TaskChildDialog, {
      global: {
        plugins: [vuetify],
      },
      props: {
        parentTaskId: '3',
        projectId: 'proj1',
        availableTasks: mockAvailableTasks,
        availableStatuses: mockAvailableStatuses,
        availablePriorities: mockAvailablePriorities,
        availableComplexities: mockAvailableComplexities,
        currentChildTasks: [],
      },
    })
  })

  it('renders the component with both tabs', () => {
    expect(wrapper.find('.v-card-title').text()).toContain('Add Child Task')
    expect(wrapper.text()).toContain('Create New Task')
    expect(wrapper.text()).toContain('Select Existing Task')
  })

  it('shows create new task form by default', () => {
    expect(wrapper.find('[label="Task Name *"]').exists()).toBe(true)
  })

  it('filters tasks to only show those from same project without parents', () => {
    const taskOptions = wrapper.vm.taskOptions
    expect(taskOptions.every((option: any) => option.value !== '3')).toBe(true)
    expect(taskOptions.length).toBeGreaterThan(0)
  })

  it('emits child-created event when form is submitted in create mode', async () => {
    wrapper.vm.createForm.name = 'New Child Task'
    await wrapper.vm.onCreateSubmit()

    expect(wrapper.emitted()['child-created']).toBeTruthy()
    expect(wrapper.emitted()['child-created'][0][0]).toMatchObject({
      name: 'New Child Task',
      projectId: 'proj1',
      parentTaskId: '3',
    })
  })

  it('emits child-selected event when form is submitted in select mode', async () => {
    wrapper.vm.selectedTab = 'select'
    wrapper.vm.selectForm.childTaskId = '1'

    await wrapper.vm.onSelectSubmit()

    expect(wrapper.emitted()['child-selected']).toBeTruthy()
    expect(wrapper.emitted()['child-selected'][0]).toEqual(['1'])
  })
})
