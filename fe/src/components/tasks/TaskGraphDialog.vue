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
        <div class="graph-wrapper">
          <VueFlow
            v-model="elements"
            class="graph-container"
            :default-viewport="{ zoom: 0.8 }"
            :max-zoom="2"
            :min-zoom="0.3"
          >
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
              <div class="custom-current-task-node">
                <!-- Connection handles -->
                <Handle id="left" type="target" :position="Position.Left" class="task-handle" />
                <Handle id="right" type="source" :position="Position.Right" class="task-handle" />
                <Handle id="bottom" type="source" :position="Position.Bottom" class="task-handle" />
                <Handle id="top" type="target" :position="Position.Top" class="task-handle" />
                
                <div class="node-icon">
                  <v-icon color="white">mdi-clipboard-text</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                </div>
              </div>
            </template>

            <!-- Predecessor Task Node Template -->
            <template #node-predecessor="{ data }">
              <div class="custom-predecessor-node">
                <!-- Connection handles -->
                <Handle id="left" type="target" :position="Position.Left" class="task-handle" />
                <Handle id="right" type="source" :position="Position.Right" class="task-handle" />
                <Handle id="bottom" type="source" :position="Position.Bottom" class="task-handle" />
                <Handle id="top" type="target" :position="Position.Top" class="task-handle" />
                
                <div class="node-icon">
                  <v-icon color="white">mdi-arrow-right</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                  <div class="node-type">Predecessor</div>
                </div>
              </div>
            </template>

            <!-- Child Task Node Template -->
            <template #node-childTask="{ data }">
              <div class="custom-child-task-node">
                <!-- Connection handles -->
                <Handle id="left" type="target" :position="Position.Left" class="task-handle" />
                <Handle id="right" type="source" :position="Position.Right" class="task-handle" />
                <Handle id="bottom" type="source" :position="Position.Bottom" class="task-handle" />
                <Handle id="top" type="target" :position="Position.Top" class="task-handle" />
                
                <div class="node-icon">
                  <v-icon color="white">mdi-subdirectory-arrow-right</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div v-if="data.project" class="node-project">{{ data.project }}</div>
                  <div v-if="data.status" class="node-status">Status: {{ data.status }}</div>
                  <div class="node-type">Child Task</div>
                </div>
              </div>
            </template>

            <!-- Legacy Task Node Template (for backward compatibility) -->
            <template #node-task="{ data }">
              <div class="custom-task-node">
                <!-- Connection handles -->
                <Handle id="left" type="target" :position="Position.Left" class="task-handle" />
                <Handle id="right" type="source" :position="Position.Right" class="task-handle" />
                <Handle id="bottom" type="source" :position="Position.Bottom" class="task-handle" />
                <Handle id="top" type="target" :position="Position.Top" class="task-handle" />
                
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

  import { VueFlow, Handle, Position } from '@vue-flow/core'

  import { computed, onMounted, ref } from 'vue'

  import { getTaskWithManagementData } from '../../services/tasks'
  import '@vue-flow/core/dist/style.css'

  /** Component props */
  const props = defineProps<{
    task: Task
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Reactive state */
  const loading = ref(false)
  const error = ref<string | null>(null)
  const elements = ref<any[]>([])
  const taskData = ref<Task | null>(null)

  /** Dialog dimensions */
  const dialogWidth = computed(() => '90vw')
  const dialogHeight = computed(() => '80vh')

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
            tasks: []
          })
        }
        tasksByProject.get(projectId).tasks.push(t)
      }

      // Layout constants
      const projectSpacing = 500
      const taskSpacing = 200
      let currentProjectX = 100

      // Create nodes for each project and its tasks
      for (const [projectId, { project, tasks }] of tasksByProject.entries()) {
        // Calculate project dimensions based on contained tasks
        const tasksInProject = tasks.length
        const tasksPerRow = Math.ceil(Math.sqrt(tasksInProject)) // Arrange in roughly square grid
        const taskWidth = 220 // Approximate task node width
        const taskHeight = 100 // Approximate task node height
        const taskSpacing = 20 // Spacing between tasks
        const projectPadding = 60 // Padding inside project container
        
        const projectWidth = Math.max(300, (tasksPerRow * taskWidth) + ((tasksPerRow - 1) * taskSpacing) + (projectPadding * 2))
        const projectHeight = Math.max(200, (Math.ceil(tasksInProject / tasksPerRow) * taskHeight) + ((Math.ceil(tasksInProject / tasksPerRow) - 1) * taskSpacing) + (projectPadding * 2) + 60) // +60 for header

        // Create project container node
        nodes.push({
          id: `project-${projectId}`,
          type: 'project',
          position: { x: currentProjectX, y: 100 },
          resizing: true,
          data: {
            name: project.name,
            type: 'project',
          },
          style: {
            width: projectWidth,
            height: projectHeight,
          },
        })

        // Create task nodes as children of their project
        for (const [taskIndex, taskItem] of tasks.entries()) {
          let taskType = 'task'
          if (taskItem.id === task.id) {
            taskType = 'currentTask'
          } else if (task.predecessors?.some(p => p.id === taskItem.id)) {
            taskType = 'predecessor'
          } else if (task.childTasks?.some(c => c.id === taskItem.id)) {
            taskType = 'childTask'
          }

          // Position in grid layout within parent project
          const row = Math.floor(taskIndex / tasksPerRow)
          const col = taskIndex % tasksPerRow
          const taskX = projectPadding + (col * (taskWidth + taskSpacing))
          const taskY = projectPadding + 60 + (row * (taskHeight + taskSpacing)) // +60 for project header

          nodes.push({
            id: taskItem.id,
            type: taskType,
            position: { x: taskX, y: taskY },
            parentNode: `project-${projectId}`,
            extent: 'parent',
            expandParent: true,
            data: {
              name: taskItem.name,
              project: taskItem.project?.name || 'Unknown Project',
              status: taskItem.status?.name || 'Unknown',
              type: taskType === 'currentTask' ? 'current' : taskType,
            },
          })
        }

        currentProjectX += projectWidth + 100 // 100px spacing between projects
      }

      // Create edges between tasks
      if (task.predecessors && task.predecessors.length > 0) {
        for (const predecessor of task.predecessors) {
          edges.push({
            id: `edge-${predecessor.id}-${task.id}`,
            source: predecessor.id,
            target: task.id,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'bezier',
            style: { stroke: '#2196F3', strokeWidth: 2 },
          })
        }
      }

      if (task.childTasks && task.childTasks.length > 0) {
        for (const childTask of task.childTasks) {
          edges.push({
            id: `edge-${task.id}-${childTask.id}`,
            source: task.id,
            target: childTask.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'bezier',
            style: { stroke: '#4CAF50', strokeWidth: 2 },
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
  }

  .custom-task-node:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  /* Project Container Styles */
  .custom-project-container {
    background: transparent;
    border: 3px solid #4A148C;
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 6px 24px rgba(106, 27, 154, 0.3);
    transition: all 0.2s ease;
    color: #4A148C;
    position: relative;
    min-width: 300px;
    min-height: 200px;
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
    min-height: 80px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
    transition: all 0.2s ease;
    color: white;
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
    min-height: 80px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 3px 12px rgba(255, 143, 0, 0.3);
    transition: all 0.2s ease;
    color: white;
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
    min-height: 80px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 3px 12px rgba(56, 142, 60, 0.3);
    transition: all 0.2s ease;
    color: white;
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
</style>
