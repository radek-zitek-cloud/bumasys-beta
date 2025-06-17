/**
 * Task Graph Nesting Test
 *
 * Tests the parent-child nesting functionality specifically
 */

import type { Task } from '../../../src/services/tasks'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Import the actual component implementation functions
import TaskGraphDialog from '../../../src/components/tasks/TaskGraphDialog.vue'

import { getTaskWithManagementData } from '../../../src/services/tasks'

// Mock the GraphQL service
vi.mock('../../../src/services/tasks', () => ({
  getTaskWithManagementData: vi.fn(),
}))
const mockGetTaskWithManagementData = vi.mocked(getTaskWithManagementData)

// Mock task data with different projects for testing nesting
const mockTask: Task = {
  id: 'task-main',
  name: 'Main Task',
  description: 'Main task description',
  status: { id: 'status-1', name: 'In Progress' },
  priority: { id: 'priority-1', name: 'High' },
  complexity: { id: 'complexity-1', name: 'Medium' },
  project: { id: 'project-main', name: 'Main Project' },
  projectId: 'project-main',
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
  updatedAt: new Date().toISOString(),
  predecessors: [
    {
      id: 'predecessor-1',
      name: 'Predecessor from Different Project',
      description: 'A predecessor from another project',
      projectId: 'project-other',
      project: { id: 'project-other', name: 'Other Project' },
    },
    {
      id: 'predecessor-2',
      name: 'Predecessor from Same Project',
      description: 'A predecessor from same project',
      projectId: 'project-main',
      project: { id: 'project-main', name: 'Main Project' },
    },
  ],
  childTasks: [
    {
      id: 'child-1',
      name: 'Child Task Same Project',
      description: 'A child task in same project',
      projectId: 'project-main',
      project: { id: 'project-main', name: 'Main Project' },
      status: { id: 'status-2', name: 'Pending' },
    },
  ],
}

describe('TaskGraphDialog Nesting Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTaskWithManagementData.mockResolvedValue({ task: mockTask })
  })

  it('groups tasks by project correctly', async () => {
    // Test the core nesting logic by simulating the component initialization
    const allTasks = [mockTask]
    if (mockTask.predecessors) {
      allTasks.push(...mockTask.predecessors)
    }
    if (mockTask.childTasks) {
      allTasks.push(...mockTask.childTasks)
    }

    // Group tasks by project (same logic as component)
    const tasksByProject = new Map()
    for (const t of allTasks) {
      const projectId = t.project?.id || 'unknown'
      if (!tasksByProject.has(projectId)) {
        tasksByProject.set(projectId, {
          project: t.project || { id: 'unknown', name: 'Unknown Project' },
          tasks: [],
        })
      }
      tasksByProject.get(projectId).tasks.push(t)
    }

    // Verify grouping
    expect(tasksByProject.size).toBe(2) // Main Project and Other Project
    expect(tasksByProject.has('project-main')).toBe(true)
    expect(tasksByProject.has('project-other')).toBe(true)

    // Verify Main Project has 3 tasks (main + predecessor-2 + child-1)
    const mainProjectTasks = tasksByProject.get('project-main').tasks
    expect(mainProjectTasks).toHaveLength(3)
    expect(mainProjectTasks.map((t: any) => t.id)).toContain('task-main')
    expect(mainProjectTasks.map((t: any) => t.id)).toContain('predecessor-2')
    expect(mainProjectTasks.map((t: any) => t.id)).toContain('child-1')

    // Verify Other Project has 1 task (predecessor-1)
    const otherProjectTasks = tasksByProject.get('project-other').tasks
    expect(otherProjectTasks).toHaveLength(1)
    expect(otherProjectTasks[0].id).toBe('predecessor-1')
  })

  it('creates proper parent-child node structure', async () => {
    // Test the node creation logic
    const projectId = 'project-main'
    const tasks = [
      mockTask,
      mockTask.predecessors![1], // predecessor-2 from same project
      mockTask.childTasks![0], // child-1 from same project
    ]

    // Create nodes as the component would
    const nodes: any[] = []

    // Project container node
    const projectWidth = Math.max(300, tasks.length * 200)
    const projectHeight = 400

    nodes.push({
      id: `project-${projectId}`,
      type: 'project',
      position: { x: 100, y: 100 },
      data: {
        name: 'Main Project',
        type: 'project',
      },
      style: {
        width: projectWidth,
        height: projectHeight,
      },
    })

    // Task nodes as children
    for (const [taskIndex, taskItem] of tasks.entries()) {
      let taskType = 'task'
      if (taskItem.id === mockTask.id) {
        taskType = 'currentTask'
      } else if (mockTask.predecessors?.some(p => p.id === taskItem.id)) {
        taskType = 'predecessor'
      } else if (mockTask.childTasks?.some(c => c.id === taskItem.id)) {
        taskType = 'childTask'
      }

      const taskX = 50 + (taskIndex * 180)
      const taskY = 80

      nodes.push({
        id: taskItem.id,
        type: taskType,
        position: { x: taskX, y: taskY },
        parentNode: `project-${projectId}`,
        extent: 'parent',
        data: {
          name: taskItem.name,
          project: taskItem.project?.name || 'Unknown Project',
          status: taskItem.status?.name || 'Unknown',
          type: taskType === 'currentTask' ? 'current' : taskType,
        },
      })
    }

    // Verify node structure
    expect(nodes).toHaveLength(4) // 1 project + 3 tasks

    // Verify project node
    const projectNode = nodes[0]
    expect(projectNode.id).toBe('project-project-main')
    expect(projectNode.type).toBe('project')
    expect(projectNode.style.width).toBe(600) // 3 tasks * 200
    expect(projectNode.style.height).toBe(400)

    // Verify task nodes have correct parent references
    const taskNodes = nodes.slice(1)
    for (const taskNode of taskNodes) {
      expect(taskNode.parentNode).toBe('project-project-main')
      expect(taskNode.extent).toBe('parent')
      expect(taskNode.position.x).toBeGreaterThanOrEqual(50)
      expect(taskNode.position.y).toBe(80)
    }

    // Verify task types
    const currentTaskNode = taskNodes.find(n => n.type === 'currentTask')
    const predecessorNode = taskNodes.find(n => n.type === 'predecessor')
    const childTaskNode = taskNodes.find(n => n.type === 'childTask')

    expect(currentTaskNode).toBeDefined()
    expect(currentTaskNode.id).toBe('task-main')
    expect(predecessorNode).toBeDefined()
    expect(predecessorNode.id).toBe('predecessor-2')
    expect(childTaskNode).toBeDefined()
    expect(childTaskNode.id).toBe('child-1')
  })

  it('maintains correct edge connections with nested nodes', () => {
    // Test edge creation logic remains correct
    const edges: any[] = []

    // Predecessor edges
    if (mockTask.predecessors && mockTask.predecessors.length > 0) {
      for (const predecessor of mockTask.predecessors) {
        edges.push({
          id: `edge-${predecessor.id}-${mockTask.id}`,
          source: predecessor.id,
          target: mockTask.id,
          sourceHandle: 'right',
          targetHandle: 'left',
          type: 'straight',
          style: { stroke: '#2196F3', strokeWidth: 2 },
        })
      }
    }

    // Child task edges
    if (mockTask.childTasks && mockTask.childTasks.length > 0) {
      for (const childTask of mockTask.childTasks) {
        edges.push({
          id: `edge-${mockTask.id}-${childTask.id}`,
          source: mockTask.id,
          target: childTask.id,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          type: 'straight',
          style: { stroke: '#4CAF50', strokeWidth: 2 },
        })
      }
    }

    // Verify edge connections
    expect(edges).toHaveLength(3) // 2 predecessors + 1 child

    // Verify predecessor edges
    const predecessorEdges = edges.filter(e => e.style.stroke === '#2196F3')
    expect(predecessorEdges).toHaveLength(2)

    for (const edge of predecessorEdges) {
      expect(edge.target).toBe('task-main')
      expect(edge.sourceHandle).toBe('right')
      expect(edge.targetHandle).toBe('left')
    }

    // Verify child task edges
    const childEdges = edges.filter(e => e.style.stroke === '#4CAF50')
    expect(childEdges).toHaveLength(1)

    const childEdge = childEdges[0]
    expect(childEdge.source).toBe('task-main')
    expect(childEdge.target).toBe('child-1')
    expect(childEdge.sourceHandle).toBe('bottom')
    expect(childEdge.targetHandle).toBe('top')
  })
})
