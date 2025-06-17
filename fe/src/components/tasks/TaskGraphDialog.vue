<!--
  @fileoverview Task Graph Dialog Component

  This component displays the task relationships in a graphical format using Vue Flow.
  It shows the task and its connections to predecessors, successors, and child tasks.
  Initially displays just the current task as a single node.
-->

<template>
  <v-card
    class="task-graph-dialog"
    :height="dialogHeight"
    :width="dialogWidth"
  >
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
        <!-- Graph Controls -->
        <div class="graph-controls">
          <v-chip-group v-model="visibleRelations" multiple>
            <v-chip
              color="orange"
              size="small"
              value="predecessors"
              variant="outlined"
            >
              <v-icon start>mdi-arrow-left</v-icon>
              Predecessors
            </v-chip>
            <v-chip
              color="green"
              size="small"
              value="childTasks"
              variant="outlined"
            >
              <v-icon start>mdi-subdirectory-arrow-right</v-icon>
              Child Tasks
            </v-chip>
          </v-chip-group>

          <div class="graph-actions">
            <v-btn
              icon
              size="small"
              title="Fit to view"
              variant="outlined"
              @click="fitView"
            >
              <v-icon>mdi-fit-to-page</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              title="Zoom in"
              variant="outlined"
              @click="zoomIn"
            >
              <v-icon>mdi-magnify-plus</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              title="Zoom out"
              variant="outlined"
              @click="zoomOut"
            >
              <v-icon>mdi-magnify-minus</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              title="Toggle minimap"
              variant="outlined"
              @click="toggleMinimap"
            >
              <v-icon>mdi-map</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              title="Refresh graph"
              variant="outlined"
              @click="refreshGraph"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="graph-wrapper">
          <VueFlow
            ref="vueFlowRef"
            v-model="elements"
            class="graph-container"
            :default-viewport="{ zoom: 0.8 }"
            :max-zoom="3"
            :min-zoom="0.1"
            :snap-grid="[15, 15]"
            :snap-to-grid="true"
            @edge-click="onEdgeClick"
            @node-click="onNodeClick"
          >
            <!-- Built-in Controls -->
            <Controls />

            <!-- Minimap -->
            <MiniMap v-if="showMinimap" />

            <!-- Background is available in Vue Flow core -->
            <template #background>
              <svg>
                <defs>
                  <pattern id="grid" height="20" patternUnits="userSpaceOnUse" width="20">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" stroke-width="1" />
                  </pattern>
                </defs>
                <rect fill="url(#grid)" height="100%" width="100%" />
              </svg>
            </template>
            <!-- Project Node Template -->
            <template #node-project="{ data }">
              <div class="custom-project-container">
                <div class="project-header">
                  <div class="project-icon">
                    <v-icon color="white">mdi-folder-outline</v-icon>
                  </div>
                  <div class="project-title">{{ data.name }}</div>
                </div>
                <div class="project-content">
                  <!-- Project content area for child tasks -->
                </div>
              </div>
            </template>

            <!-- Current Task Node Template -->
            <template #node-currentTask="{ data }">
              <div class="custom-current-task-node" :class="getTaskStatusClass(data.status)">
                <!-- Connection handles -->
                <Handle id="left" class="task-handle" :position="Position.Left" type="target" />
                <Handle id="right" class="task-handle" :position="Position.Right" type="source" />
                <Handle id="bottom" class="task-handle" :position="Position.Bottom" type="source" />
                <Handle id="top" class="task-handle" :position="Position.Top" type="target" />

                <!-- Status indicator -->
                <div class="task-status-indicator" :class="getStatusColor(data.status)" />

                <!-- Priority indicator -->
                <div v-if="data.priority" class="task-priority-badge" :class="getPriorityClass(data.priority)">
                  {{ getPriorityIcon(data.priority) }}
                </div>

                <div class="node-icon">
                  <v-icon color="white" :size="20">{{ getTaskIcon(data.status) }}</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                  <div v-if="data.status" class="node-status">{{ data.status }}</div>
                  <div v-if="data.dates" class="node-dates">
                    <div class="date-info">
                      <v-icon size="12">mdi-calendar-start</v-icon>
                      {{ formatDate(data.dates.planned?.start) }}
                    </div>
                  </div>
                  <!-- Progress bar if task has progress data -->
                  <div v-if="data.progress !== undefined" class="node-progress">
                    <v-progress-linear
                      bg-color="rgba(255,255,255,0.3)"
                      color="white"
                      height="4"
                      :model-value="data.progress"
                    />
                    <span class="progress-text">{{ data.progress }}%</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Predecessor Task Node Template -->
            <template #node-predecessor="{ data }">
              <div class="custom-predecessor-node" :class="getTaskStatusClass(data.status)">
                <!-- Connection handles -->
                <Handle id="left" class="task-handle" :position="Position.Left" type="target" />
                <Handle id="right" class="task-handle" :position="Position.Right" type="source" />
                <Handle id="bottom" class="task-handle" :position="Position.Bottom" type="source" />
                <Handle id="top" class="task-handle" :position="Position.Top" type="target" />

                <!-- Status indicator -->
                <div class="task-status-indicator" :class="getStatusColor(data.status)" />

                <!-- Priority indicator -->
                <div v-if="data.priority" class="task-priority-badge" :class="getPriorityClass(data.priority)">
                  {{ getPriorityIcon(data.priority) }}
                </div>

                <div class="node-icon">
                  <v-icon color="white" :size="20">{{ getTaskIcon(data.status) }}</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                  <div v-if="data.status" class="node-status">{{ data.status }}</div>
                  <div class="node-type">Predecessor</div>

                  <!-- Progress bar -->
                  <div v-if="data.progress !== undefined" class="node-progress">
                    <v-progress-linear
                      bg-color="rgba(255,255,255,0.3)"
                      color="white"
                      height="4"
                      :model-value="data.progress"
                    />
                    <span class="progress-text">{{ data.progress }}%</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Child Task Node Template -->
            <template #node-childTask="{ data }">
              <div class="custom-child-task-node" :class="getTaskStatusClass(data.status)">
                <!-- Connection handles -->
                <Handle id="left" class="task-handle" :position="Position.Left" type="target" />
                <Handle id="right" class="task-handle" :position="Position.Right" type="source" />
                <Handle id="bottom" class="task-handle" :position="Position.Bottom" type="source" />
                <Handle id="top" class="task-handle" :position="Position.Top" type="target" />

                <!-- Status indicator -->
                <div class="task-status-indicator" :class="getStatusColor(data.status)" />

                <!-- Priority indicator -->
                <div v-if="data.priority" class="task-priority-badge" :class="getPriorityClass(data.priority)">
                  {{ getPriorityIcon(data.priority) }}
                </div>

                <div class="node-icon">
                  <v-icon color="white" :size="20">{{ getTaskIcon(data.status) }}</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                  <div v-if="data.status" class="node-status">{{ data.status }}</div>
                  <div class="node-type">Child Task</div>

                  <!-- Progress bar -->
                  <div v-if="data.progress !== undefined" class="node-progress">
                    <v-progress-linear
                      bg-color="rgba(255,255,255,0.3)"
                      color="white"
                      height="4"
                      :model-value="data.progress"
                    />
                    <span class="progress-text">{{ data.progress }}%</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- Legacy Task Node Template (for backward compatibility) -->
            <template #node-task="{ data }">
              <div class="custom-task-node">
                <!-- Connection handles -->
                <Handle id="left" class="task-handle" :position="Position.Left" type="target" />
                <Handle id="right" class="task-handle" :position="Position.Right" type="source" />
                <Handle id="bottom" class="task-handle" :position="Position.Bottom" type="source" />
                <Handle id="top" class="task-handle" :position="Position.Top" type="target" />

                <div class="node-icon">
                  <v-icon color="primary">mdi-clipboard-text</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                </div>
              </div>
            </template>
          </VueFlow>
        </div>
      </div>
    </v-card-text>
    <v-card-actions class="dialog-actions">
      <v-spacer />
      <v-btn color="primary" variant="text" @click="emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Task } from '../../services/tasks'

  import { Controls } from '@vue-flow/controls'
  import { Handle, Position, useVueFlow, VueFlow } from '@vue-flow/core'
  import { MiniMap } from '@vue-flow/minimap'

  import { computed, nextTick, onMounted, ref, watch } from 'vue'

  import { getTaskWithManagementData } from '../../services/tasks'
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/controls/dist/style.css'
  import '@vue-flow/minimap/dist/style.css'

  /** Component props */
  const props = defineProps<{
    task: Task
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Vue Flow instance reference */
  const vueFlowRef = ref()
  const { fitView: vueFlowFitView, zoomIn: vueFlowZoomIn, zoomOut: vueFlowZoomOut } = useVueFlow()

  /** Reactive state */
  const loading = ref(false)
  const error = ref<string | null>(null)
  const elements = ref<any[]>([])
  const taskData = ref<Task | null>(null)
  const showMinimap = ref(false)
  const visibleRelations = ref(['predecessors', 'childTasks'])

  /** Dialog dimensions */
  const dialogWidth = computed(() => '90vw')
  const dialogHeight = computed(() => '80vh')

  /** Status color mapping */
  const statusColors: Record<string, string> = {
    'not-started': 'grey',
    'in-progress': 'blue',
    'completed': 'green',
    'on-hold': 'orange',
    'cancelled': 'red',
  }

  /** Priority mapping */
  const priorityMapping: Record<string, { class: string, icon: string }> = {
    low: { class: 'priority-low', icon: '!' },
    medium: { class: 'priority-medium', icon: '!!' },
    high: { class: 'priority-high', icon: '!!!' },
    critical: { class: 'priority-critical', icon: '⚠' },
  }

  /** Utility functions */
  const getTaskStatusClass = (status: string) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, '-') || 'not-started'
    return `status-${normalized}`
  }

  const getStatusColor = (status: string) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, '-') || 'not-started'
    return statusColors[normalized] || 'grey'
  }

  const getPriorityClass = (priority: string) => {
    const normalized = priority?.toLowerCase() || 'medium'
    return priorityMapping[normalized]?.class || 'priority-medium'
  }

  const getPriorityIcon = (priority: string) => {
    const normalized = priority?.toLowerCase() || 'medium'
    return priorityMapping[normalized]?.icon || '!!'
  }

  const getTaskIcon = (status: string) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, '-') || 'not-started'
    const iconMapping: Record<string, string> = {
      'not-started': 'mdi-clock-outline',
      'in-progress': 'mdi-play-circle',
      'completed': 'mdi-check-circle',
      'on-hold': 'mdi-pause-circle',
      'cancelled': 'mdi-close-circle',
    }
    return iconMapping[normalized] || 'mdi-clipboard-text'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  const calculateTaskProgress = (task: Task): number => {
    // Simple progress calculation based on status
    const statusProgress: Record<string, number> = {
      'not started': 0,
      'in progress': 50,
      'completed': 100,
      'on hold': 25,
      'cancelled': 0,
    }

    const status = task.status?.name.toLowerCase() || 'not started'
    return statusProgress[status] || 0
  }

  /** Graph control methods */
  const fitView = () => {
    vueFlowFitView({ padding: 0.15 })
  }

  const zoomIn = () => {
    vueFlowZoomIn()
  }

  const zoomOut = () => {
    vueFlowZoomOut()
  }

  const toggleMinimap = () => {
    showMinimap.value = !showMinimap.value
  }

  const refreshGraph = () => {
    initializeGraph()
  }

  /** Event handlers */
  const onNodeClick = (event: any) => {
    console.log('Node clicked:', event.node)
    // Could emit event to parent or show task details
  }

  const onEdgeClick = (event: any) => {
    console.log('Edge clicked:', event.edge)
    // Could highlight the relationship or show details
  }

  /** Initialize the graph with the current task and its relationships */
  const initializeGraph = async () => {
    try {
      loading.value = true
      error.value = null

      // Fetch complete task data with relationships
      const { task } = await getTaskWithManagementData(props.task.id)
      if (!task) {
        throw new Error('Task not found')
      }

      taskData.value = task

      const nodes: any[] = []
      const edges: any[] = []

      // Collect all tasks and group by project
      const allTasks = [task]
      if (task.predecessors) {
        allTasks.push(...task.predecessors)
      }
      if (task.childTasks) {
        allTasks.push(...task.childTasks)
      }

      // Group tasks by project
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

      // Layout constants
      const taskWidth = 200 // Task node width
      const taskHeight = 100 // Task node height
      const taskSpacing = taskWidth / 2 // Spacing between tasks (half the node size)
      const projectPadding = 40 // Padding inside project container
      const projectHeaderHeight = 60 // Height for project header
      let currentProjectX = 100

      // Create nodes for each project and its tasks
      for (const [projectId, { project, tasks }] of tasksByProject.entries()) {
        // Find the current task for this project
        const currentTaskInProject = tasks.find((t: Task) => t.id === task.id)
        const predecessorsInProject = tasks.filter((t: Task) => task.predecessors?.some(p => p.id === t.id))
        const childTasksInProject = tasks.filter((t: Task) => task.childTasks?.some(c => c.id === t.id))

        if (!currentTaskInProject && predecessorsInProject.length === 0 && childTasksInProject.length === 0) {
          continue // Skip projects with no relevant tasks
        }

        // Calculate layout positions
        // Current task is at the center-left
        const currentTaskX = projectPadding + (predecessorsInProject.length > 0 ? taskWidth + taskSpacing : 0)
        const currentTaskY = projectPadding + projectHeaderHeight

        // Calculate project dimensions based on hierarchical layout
        let projectWidth = projectPadding * 2
        let projectHeight = projectPadding * 2 + projectHeaderHeight

        // Add width for predecessors (left column)
        if (predecessorsInProject.length > 0) {
          projectWidth += taskWidth + taskSpacing
        }

        // Add width for current task
        if (currentTaskInProject) {
          projectWidth += taskWidth
        }

        // Add width for child tasks (extending to the right)
        if (childTasksInProject.length > 0) {
          projectWidth += taskSpacing + (childTasksInProject.length * (taskWidth + taskSpacing))
        }

        // Calculate height needed for all elements
        // Height for current task row (includes current task and any predecessors at same level)
        projectHeight += taskHeight

        // Additional height for multiple predecessors (stacked vertically)
        if (predecessorsInProject.length > 1) {
          projectHeight += (predecessorsInProject.length - 1) * (taskHeight + taskSpacing)
        }

        // Add height for child tasks row (below current task)
        if (childTasksInProject.length > 0) {
          projectHeight += taskSpacing + taskHeight
        }

        // Ensure minimum dimensions and add some extra padding for visual clarity
        projectWidth = Math.max(projectWidth, 400) + projectPadding
        projectHeight = Math.max(projectHeight, 300) + projectPadding

        console.log(`Project ${project.name}:`, {
          width: projectWidth,
          height: projectHeight,
          predecessors: predecessorsInProject.length,
          childTasks: childTasksInProject.length,
          currentTask: !!currentTaskInProject,
        })

        // Create project container node
        nodes.push({
          id: `project-${projectId}`,
          type: 'project',
          position: { x: currentProjectX, y: 100 },
          draggable: false,
          selectable: true,
          data: {
            name: project.name,
            type: 'project',
          },
          style: {
            width: `${projectWidth}px`,
            height: `${projectHeight}px`,
          },
          className: 'project-node',
        })

        // Position predecessor tasks (left column, stacked vertically)
        for (const [predIndex, taskItem] of predecessorsInProject.entries()) {
          const taskX = projectPadding
          const taskY = projectPadding + projectHeaderHeight + (predIndex * (taskHeight + taskSpacing))

          nodes.push({
            id: taskItem.id,
            type: 'predecessor',
            position: { x: taskX, y: taskY },
            parentNode: `project-${projectId}`,
            extent: 'parent',
            expandParent: true,
            data: {
              name: taskItem.name,
              project: taskItem.project?.name || 'Unknown Project',
              status: taskItem.status?.name || 'Not Started',
              priority: taskItem.priority?.name || 'Medium',
              complexity: taskItem.complexity?.name,
              type: 'predecessor',
              dates: {
                planned: {
                  start: taskItem.plannedStartDate,
                  end: taskItem.plannedEndDate,
                },
                actual: {
                  start: taskItem.actualStartDate,
                  end: taskItem.actualEndDate,
                },
              },
              progress: calculateTaskProgress(taskItem),
              evaluator: taskItem.evaluator ? `${taskItem.evaluator.firstName} ${taskItem.evaluator.lastName}` : undefined,
            },
          })
        }

        // Position current task (center-left)
        if (currentTaskInProject) {
          nodes.push({
            id: currentTaskInProject.id,
            type: 'currentTask',
            position: { x: currentTaskX, y: currentTaskY },
            parentNode: `project-${projectId}`,
            extent: 'parent',
            expandParent: true,
            data: {
              name: currentTaskInProject.name,
              project: currentTaskInProject.project?.name || 'Unknown Project',
              status: currentTaskInProject.status?.name || 'Not Started',
              priority: currentTaskInProject.priority?.name || 'Medium',
              complexity: currentTaskInProject.complexity?.name,
              type: 'current',
              dates: {
                planned: {
                  start: currentTaskInProject.plannedStartDate,
                  end: currentTaskInProject.plannedEndDate,
                },
                actual: {
                  start: currentTaskInProject.actualStartDate,
                  end: currentTaskInProject.actualEndDate,
                },
              },
              progress: calculateTaskProgress(currentTaskInProject),
              evaluator: currentTaskInProject.evaluator ? `${currentTaskInProject.evaluator.firstName} ${currentTaskInProject.evaluator.lastName}` : undefined,
            },
          })
        }

        // Position child tasks (bottom row, extending to the right)
        for (const [childIndex, taskItem] of childTasksInProject.entries()) {
          const taskX = currentTaskX + (childIndex * (taskWidth + taskSpacing))
          const taskY = currentTaskY + taskHeight + taskSpacing

          nodes.push({
            id: taskItem.id,
            type: 'childTask',
            position: { x: taskX, y: taskY },
            parentNode: `project-${projectId}`,
            extent: 'parent',
            expandParent: true,
            data: {
              name: taskItem.name,
              project: taskItem.project?.name || 'Unknown Project',
              status: taskItem.status?.name || 'Not Started',
              priority: taskItem.priority?.name || 'Medium',
              complexity: taskItem.complexity?.name,
              type: 'childTask',
              dates: {
                planned: {
                  start: taskItem.plannedStartDate,
                  end: taskItem.plannedEndDate,
                },
                actual: {
                  start: taskItem.actualStartDate,
                  end: taskItem.actualEndDate,
                },
              },
              progress: calculateTaskProgress(taskItem),
              evaluator: taskItem.evaluator ? `${taskItem.evaluator.firstName} ${taskItem.evaluator.lastName}` : undefined,
            },
          })
        }

        currentProjectX += projectWidth + 150 // 150px spacing between projects to accommodate larger sizes
      }

      // Create edges between tasks with improved connection points
      if (task.predecessors && task.predecessors.length > 0) {
        for (const predecessor of task.predecessors) {
          edges.push({
            id: `edge-${predecessor.id}-${task.id}`,
            source: predecessor.id,
            target: task.id,
            sourceHandle: 'right', // Connect from right side of predecessor
            targetHandle: 'left', // Connect to left side of current task
            // No type specified - will use default
            style: {
              stroke: '#2196F3',
              strokeWidth: 2,
              strokeDasharray: '5,5', // Dashed line for predecessor relationships
            },
            label: 'predecessor',
            labelStyle: { fill: '#2196F3', fontSize: 10 },
          })
        }
      }

      if (task.childTasks && task.childTasks.length > 0) {
        for (const childTask of task.childTasks) {
          edges.push({
            id: `edge-${task.id}-${childTask.id}`,
            source: task.id,
            target: childTask.id,
            sourceHandle: 'bottom', // Connect from bottom of current task
            targetHandle: 'top', // Connect to top of child task
            // No type specified - will use default
            style: {
              stroke: '#4CAF50',
              strokeWidth: 2,
            },
            label: 'child',
            labelStyle: { fill: '#4CAF50', fontSize: 10 },
          })
        }
      }

      elements.value = [...nodes, ...edges]
    } catch (error_) {
      console.error('Error initializing task graph:', error_)
      error.value = 'Failed to load task graph'
    } finally {
      loading.value = false
    }
  }

  /** Lifecycle hooks */
  onMounted(() => {
    initializeGraph()
  })

  /** Watch for filter changes */
  watch(visibleRelations, () => {
    updateGraphVisibility()
  })

  /** Update graph visibility based on filters */
  const updateGraphVisibility = () => {
    if (!taskData.value) return

    const nodes: any[] = []
    const edges: any[] = []

    // Always show the current task
    const currentTaskNode = elements.value.find(el => el.data?.type === 'current')
    if (currentTaskNode) {
      nodes.push(currentTaskNode)
    }

    // Show predecessors if enabled
    if (visibleRelations.value.includes('predecessors')) {
      const predecessorNodes = elements.value.filter(el => el.type === 'predecessor')
      nodes.push(...predecessorNodes)

      // Add predecessor edges
      const predecessorEdges = elements.value.filter(el =>
        el.source && el.target
        && predecessorNodes.some(node => node.id === el.source)
        && el.target === taskData.value?.id,
      )
      edges.push(...predecessorEdges)
    }

    // Show child tasks if enabled
    if (visibleRelations.value.includes('childTasks')) {
      const childTaskNodes = elements.value.filter(el => el.type === 'childTask')
      nodes.push(...childTaskNodes)

      // Add child task edges
      const childTaskEdges = elements.value.filter(el =>
        el.source && el.target
        && el.source === taskData.value?.id
        && childTaskNodes.some(node => node.id === el.target),
      )
      edges.push(...childTaskEdges)
    }

    // Show project containers
    const projectNodes = elements.value.filter(el => el.type === 'project')
    nodes.push(...projectNodes)

    elements.value = [...nodes, ...edges]
  }
</script>

<style scoped>
  .task-graph-dialog {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .dialog-header {
    flex-shrink: 0;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 24px;
    min-height: 64px;
  }

  .dialog-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .graph-content {
    flex: 1 1 auto;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .graph-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: #f5f5f5;
    border-radius: 8px;
    gap: 16px;
  }

  .graph-actions {
    display: flex;
    gap: 8px;
  }

  .graph-wrapper {
    flex: 1 1 auto;
    width: 100%;
    position: relative;
    overflow: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
    min-height: 400px;
  }

  .graph-container {
    width: 100%;
    height: 100%;
    min-height: 400px;
  }

  .dialog-actions {
    flex-shrink: 0;
    border-top: 1px solid #e0e0e0;
    padding: 16px 24px;
    min-height: 72px;
  }

  .custom-task-node {
    background: white;
    border: 2px solid #1976D2;
    border-radius: 8px;
    padding: 12px 16px;
    width: 200px;
    min-height: 80px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
    position: relative;
  }

  .custom-task-node:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  /* Project Container Styles */
  .vue-flow__node[data-type="project"],
  .vue-flow__node.project-node {
    /* Ensure Vue Flow respects our custom dimensions */
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
  }

  .custom-project-container {
    background: transparent;
    border: 3px solid #4A148C;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 6px 24px rgba(106, 27, 154, 0.3);
    transition: all 0.2s ease;
    color: #4A148C;
    position: relative;
    min-width: 300px;
    min-height: 200px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .custom-project-container:hover {
    box-shadow: 0 8px 32px rgba(106, 27, 154, 0.4);
  }

  .project-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid rgba(74, 20, 140, 0.3);
  }

  .project-icon {
    flex-shrink: 0;
  }

  .project-icon .v-icon {
    color: #4A148C !important;
  }

  .project-title {
    font-size: 18px;
    font-weight: bold;
    line-height: 1.2;
    color: #4A148C;
  }

  .project-content {
    flex: 1;
    position: relative;
    background: transparent;
    border-radius: 8px;
    min-height: 120px;
    overflow: visible; /* Allow child nodes to be visible */
  }

  /* Legacy Project Node Styles (hidden, replaced by container) */
  .custom-project-node {
    display: none;
  }

  /* Current Task Node Styles */
  .custom-current-task-node {
    background: linear-gradient(135deg, #1976D2, #2196F3);
    border: 3px solid #0D47A1;
    border-radius: 10px;
    padding: 16px 20px;
    width: 200px;
    min-height: 100px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
    transition: all 0.2s ease;
    color: white;
    position: relative;
  }

  .custom-current-task-node:hover {
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
    transform: translateY(-2px);
  }

  /* Predecessor Task Node Styles */
  .custom-predecessor-node {
    background: linear-gradient(135deg, #FF8F00, #FFA726);
    border: 2px solid #E65100;
    border-radius: 8px;
    padding: 12px 16px;
    width: 200px;
    min-height: 100px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 3px 12px rgba(255, 143, 0, 0.3);
    transition: all 0.2s ease;
    color: white;
    position: relative;
  }

  .custom-predecessor-node:hover {
    box-shadow: 0 4px 16px rgba(255, 143, 0, 0.4);
    transform: translateY(-1px);
  }

  /* Child Task Node Styles */
  .custom-child-task-node {
    background: linear-gradient(135deg, #388E3C, #4CAF50);
    border: 2px solid #1B5E20;
    border-radius: 8px;
    padding: 12px 16px;
    width: 200px;
    min-height: 100px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 3px 12px rgba(56, 142, 60, 0.3);
    transition: all 0.2s ease;
    color: white;
    position: relative;
  }

  .custom-child-task-node:hover {
    box-shadow: 0 4px 16px rgba(56, 142, 60, 0.4);
    transform: translateY(-1px);
  }

  .node-icon {
    flex-shrink: 0;
  }

  .node-content {
    flex: 1;
  }

  .node-name {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .node-project {
    font-size: 11px;
    opacity: 0.9;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .node-type {
    font-size: 10px;
    font-weight: 500;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .node-status {
    font-size: 11px;
    opacity: 0.9;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  /* Specific color overrides for legacy node */
  .custom-task-node .node-name {
    color: #1976D2;
  }

  .custom-task-node .node-project {
    color: #666;
  }

  /* Task Node Handle Styles */
  .task-handle {
    width: 8px;
    height: 8px;
    background: #fff;
    border: 2px solid #666;
    border-radius: 50%;
  }

  .task-handle.connectable {
    border-color: #2196F3;
  }

  .task-handle.connectingfrom {
    border-color: #FF9800;
  }

  /* Status Indicator Styles */
  .task-status-indicator {
    position: absolute;
    top: -3px;
    right: -3px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    z-index: 10;
  }

  .task-status-indicator.grey { background-color: #9e9e9e; }
  .task-status-indicator.blue { background-color: #2196f3; }
  .task-status-indicator.green { background-color: #4caf50; }
  .task-status-indicator.orange { background-color: #ff9800; }
  .task-status-indicator.red { background-color: #f44336; }

  /* Priority Badge Styles */
  .task-priority-badge {
    position: absolute;
    top: -6px;
    left: -6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: white;
    z-index: 10;
  }

  .task-priority-badge.priority-low { background-color: #4caf50; }
  .task-priority-badge.priority-medium { background-color: #ff9800; }
  .task-priority-badge.priority-high { background-color: #f44336; }
  .task-priority-badge.priority-critical {
    background-color: #d32f2f;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
    100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
  }

  /* Progress Bar Styles */
  .node-progress {
    margin-top: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .progress-text {
    font-size: 10px;
    font-weight: bold;
    min-width: 30px;
  }

  /* Date Info Styles */
  .node-dates {
    margin-top: 4px;
  }

  .date-info {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    opacity: 0.8;
  }

  /* Status Class Modifiers */
  .status-completed {
    border-color: #4caf50 !important;
  }

  .status-in-progress {
    border-color: #2196f3 !important;
  }

  .status-on-hold {
    border-color: #ff9800 !important;
    opacity: 0.8;
  }

  .status-cancelled {
    border-color: #f44336 !important;
    opacity: 0.6;
  }
</style>
