import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StaffTreeDialog from '../../../src/components/organization/StaffTreeDialog.vue'

// Mock vue3-d3-tree component
vi.mock('vue3-d3-tree', () => ({
  default: {
    name: 'VueTree',
    template: '<div class="vue-tree-mock">Vue Tree Component</div>',
    props: ['data', 'direction', 'hierarchyMargin', 'neighborMargin', 'showKnot', 'wheelZoom', 'lineType', 'lineStyle', 'collapsedWay', 'top', 'left'],
  },
}))

// Mock variables to capture calls
const mockCreateTreeCalls: any[] = []
const mockStaffServiceCalls: any[] = []

// Mock the Vue D3 tree composable to capture createTree calls
vi.mock('../../../src/composables/useD3Tree', () => ({
  useD3Tree: vi.fn().mockReturnValue({
    createTree: vi.fn().mockImplementation((treeData, config) => {
      mockCreateTreeCalls.push({ treeData, config })
    }),
    clearTree: vi.fn(),
    error: { value: null },
    treeData: { value: null },
    treeConfig: { value: null },
    vueTreeProps: { value: { data: null } },
    VueTreeComponent: { name: 'VueTree', template: '<div>Mock Vue Tree</div>' },
  }),
}))

// Mock staff hierarchy data
const mockStaffHierarchy = [
  {
    id: 'staff-1',
    firstName: 'CEO',
    lastName: 'Boss',
    organizationId: 'org1',
    email: 'ceo@example.com',
    role: 'Chief Executive Officer',
    supervisorId: null, // Top level
    departmentId: 'dept1',
  },
  {
    id: 'staff-2',
    firstName: 'Manager',
    lastName: 'Middle',
    organizationId: 'org1',
    email: 'manager@example.com',
    role: 'Department Manager',
    supervisorId: 'staff-1', // Reports to CEO
    departmentId: 'dept1',
  },
  {
    id: 'staff-3',
    firstName: 'Employee',
    lastName: 'Junior',
    organizationId: 'org1',
    email: 'employee@example.com',
    role: 'Junior Developer',
    supervisorId: 'staff-2', // Reports to Manager
    departmentId: 'dept1',
  },
]

// Mock the staff service
vi.mock('../../../src/services/staff', () => ({
  getStaff: vi.fn().mockImplementation(organizationId => {
    mockStaffServiceCalls.push({ organizationId })
    return Promise.resolve({ staff: mockStaffHierarchy })
  }),
}))

describe('StaffTreeDialog - Hierarchy Behavior', () => {
  beforeEach(() => {
    mockCreateTreeCalls.splice(0)
    mockStaffServiceCalls.splice(0)
  })

  it('should use selected staff as root instead of finding hierarchy root', async () => {
    // Select the middle manager (staff-2) - should start tree from here, not from CEO
    const selectedStaff = mockStaffHierarchy[1] // Manager Middle

    const wrapper = mount(StaffTreeDialog, {
      props: {
        staff: selectedStaff,
      },
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-progress-circular': { template: '<div class="v-progress-circular">Loading...</div>' },
          'v-icon': { template: '<i class="v-icon"><slot /></i>' },
          'v-btn': { template: '<button class="v-btn"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    // Wait for component to initialize
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify the staff service was called
    expect(mockStaffServiceCalls).toHaveLength(1)
    expect(mockStaffServiceCalls[0].organizationId).toBe('org1')

    // Verify createTree was called
    expect(mockCreateTreeCalls).toHaveLength(1)

    // The tree data should start from the selected staff (Manager Middle), not from CEO
    const treeData = mockCreateTreeCalls[0].treeData
    expect(treeData.name).toBe('Manager Middle')
    expect(treeData.title).toBe('Department Manager')

    // The tree should only contain the selected staff and their subordinates
    // Manager Middle should have Employee Junior as a child
    expect(treeData.children).toHaveLength(1)
    expect(treeData.children[0].name).toBe('Employee Junior')
    expect(treeData.children[0].title).toBe('Junior Developer')
  })

  it('should start from junior employee with no subordinates', async () => {
    // Select the junior employee (staff-3) - should start tree from here with no children
    const selectedStaff = mockStaffHierarchy[2] // Employee Junior

    const wrapper = mount(StaffTreeDialog, {
      props: {
        staff: selectedStaff,
      },
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-progress-circular': { template: '<div class="v-progress-circular">Loading...</div>' },
          'v-icon': { template: '<i class="v-icon"><slot /></i>' },
          'v-btn': { template: '<button class="v-btn"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    // Wait for component to initialize
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify createTree was called
    expect(mockCreateTreeCalls).toHaveLength(1)

    // The tree data should start from the selected staff (Employee Junior)
    const treeData = mockCreateTreeCalls[0].treeData
    expect(treeData.name).toBe('Employee Junior')
    expect(treeData.title).toBe('Junior Developer')

    // Employee Junior should have no children (no subordinates)
    expect(treeData.children).toBeUndefined()
  })

  it('should start from CEO and show full hierarchy when CEO is selected', async () => {
    // Select the CEO (staff-1) - should start tree from CEO showing full hierarchy downward
    const selectedStaff = mockStaffHierarchy[0] // CEO Boss

    const wrapper = mount(StaffTreeDialog, {
      props: {
        staff: selectedStaff,
      },
      global: {
        stubs: {
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-card-title': { template: '<div class="v-card-title"><slot /></div>' },
          'v-card-text': { template: '<div class="v-card-text"><slot /></div>' },
          'v-card-actions': { template: '<div class="v-card-actions"><slot /></div>' },
          'v-progress-circular': { template: '<div class="v-progress-circular">Loading...</div>' },
          'v-icon': { template: '<i class="v-icon"><slot /></i>' },
          'v-btn': { template: '<button class="v-btn"><slot /></button>' },
          'v-spacer': { template: '<div class="v-spacer"></div>' },
        },
      },
    })

    // Wait for component to initialize
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verify createTree was called
    expect(mockCreateTreeCalls).toHaveLength(1)

    // The tree data should start from the selected staff (CEO Boss)
    const treeData = mockCreateTreeCalls[0].treeData
    expect(treeData.name).toBe('CEO Boss')
    expect(treeData.title).toBe('Chief Executive Officer')

    // CEO should have Manager Middle as direct child
    expect(treeData.children).toHaveLength(1)
    expect(treeData.children[0].name).toBe('Manager Middle')

    // Manager Middle should have Employee Junior as child
    expect(treeData.children[0].children).toHaveLength(1)
    expect(treeData.children[0].children[0].name).toBe('Employee Junior')
  })
})
