import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import DepartmentTreeDialog from '../../../src/components/DepartmentTreeDialog.vue'
import StaffTreeDialog from '../../../src/components/StaffTreeDialog.vue'

// Mock vue3-d3-tree component
vi.mock('vue3-d3-tree', () => ({
  default: {
    name: 'VueTree',
    template: '<div class="vue-tree-mock">Vue Tree Component</div>',
    props: ['data', 'direction', 'hierarchyMargin', 'neighborMargin', 'showKnot', 'wheelZoom', 'lineType', 'lineStyle', 'collapsedWay', 'top', 'left']
  }
}))

// Mock the Vue D3 tree composable
vi.mock('../../../src/composables/useD3Tree', () => ({
  useD3Tree: vi.fn().mockReturnValue({
    createTree: vi.fn(),
    clearTree: vi.fn(),
    error: { value: null },
    treeData: { value: null },
    treeConfig: { value: null },
    vueTreeProps: { value: null },
    VueTreeComponent: { name: 'VueTree', template: '<div>Mock Vue Tree</div>' },
  }),
}))

// Mock the service modules
vi.mock('../../../src/services/departments', () => ({
  getDepartments: vi.fn().mockResolvedValue({ departments: [] }),
}))

vi.mock('../../../src/services/staff', () => ({
  getStaff: vi.fn().mockResolvedValue({ staff: [] }),
}))

describe('Tree Dialog Components', () => {
  const mockDepartment = {
    id: '1',
    name: 'Test Department',
    organizationId: 'org1',
    description: 'Test description',
    managerId: 'manager1',
    parentDepartmentId: null,
  }

  const mockStaff = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    organizationId: 'org1',
    email: 'john@example.com',
    role: 'Manager',
    supervisorId: null,
    departmentId: 'dept1',
  }

  it('DepartmentTreeDialog renders without crashing', () => {
    const wrapper = mount(DepartmentTreeDialog, {
      props: {
        department: mockDepartment,
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Department Structure')
  })

  it('StaffTreeDialog renders without crashing', () => {
    const wrapper = mount(StaffTreeDialog, {
      props: {
        staff: mockStaff,
      },
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('Organization Structure')
  })

  it('DepartmentTreeDialog shows loading state initially', () => {
    const wrapper = mount(DepartmentTreeDialog, {
      props: {
        department: mockDepartment,
      },
    })

    expect(wrapper.text()).toContain('Loading department structure...')
  })

  it('StaffTreeDialog shows loading state initially', () => {
    const wrapper = mount(StaffTreeDialog, {
      props: {
        staff: mockStaff,
      },
    })

    expect(wrapper.text()).toContain('Loading organization structure...')
  })
})
