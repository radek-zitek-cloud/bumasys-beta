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
              <div class="custom-project-node">
                <div class="node-icon">
                  <v-icon color="white">mdi-folder-outline</v-icon>
                </div>
                <div class="node-content">
                  <div class="node-name">{{ data.name }}</div>
                  <div class="node-type">Project</div>
                </div>
              </div>
            </template>

            <!-- Current Task Node Template -->
            <template #node-currentTask="{ data }">
              <div class="custom-current-task-node">
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

  import { VueFlow } from '@vue-flow/core'

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

      // Calculate positioning
      const centerX = 400
      const centerY = 300
      const nodeSpacing = 250

      // 1. Create project node (as a container/parent)
      if (task.project) {
        nodes.push({
          id: `project-${task.project.id}`,
          type: 'project',
          position: { x: centerX - 150, y: centerY - 200 },
          data: {
            name: task.project.name,
            type: 'project',
          },
        })
      }

      // 2. Create current task node (center)
      nodes.push({
        id: task.id,
        type: 'currentTask',
        position: { x: centerX, y: centerY },
        data: {
          name: task.name,
          project: task.project?.name || 'Unknown Project',
          type: 'current',
        },
      })

      // 3. Create predecessor nodes (to the left)
      if (task.predecessors && task.predecessors.length > 0) {
        for (const [index, predecessor] of task.predecessors.entries()) {
          const predecessorX = centerX - nodeSpacing - 100
          const predecessorY = centerY + (index - (task.predecessors!.length - 1) / 2) * 120

          nodes.push({
            id: predecessor.id,
            type: 'predecessor',
            position: { x: predecessorX, y: predecessorY },
            data: {
              name: predecessor.name,
              project: predecessor.project?.name || 'Unknown Project',
              type: 'predecessor',
            },
          })

          // Add edge from predecessor to current task
          edges.push({
            id: `edge-${predecessor.id}-${task.id}`,
            source: predecessor.id,
            target: task.id,
            sourceHandle: 'right',
            targetHandle: 'left',
            type: 'straight',
            style: { stroke: '#2196F3', strokeWidth: 2 },
          })
        }
      }

      // 4. Create child task nodes (below)
      if (task.childTasks && task.childTasks.length > 0) {
        for (const [index, childTask] of task.childTasks.entries()) {
          const childX = centerX + (index - (task.childTasks!.length - 1) / 2) * 200
          const childY = centerY + nodeSpacing

          nodes.push({
            id: childTask.id,
            type: 'childTask',
            position: { x: childX, y: childY },
            data: {
              name: childTask.name,
              project: childTask.project?.name || task.project?.name || 'Unknown Project',
              status: childTask.status?.name || 'Unknown',
              type: 'child',
            },
          })

          // Add edge from current task to child task
          edges.push({
            id: `edge-${task.id}-${childTask.id}`,
            source: task.id,
            target: childTask.id,
            sourceHandle: 'bottom',
            targetHandle: 'top',
            type: 'straight',
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
    min-width: 200px;
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

  /* Project Node Styles */
  .custom-project-node {
    background: linear-gradient(135deg, #6A1B9A, #8E24AA);
    border: 2px solid #4A148C;
    border-radius: 12px;
    padding: 16px 20px;
    min-width: 250px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 4px 16px rgba(106, 27, 154, 0.3);
    transition: all 0.2s ease;
    color: white;
  }

  .custom-project-node:hover {
    box-shadow: 0 6px 20px rgba(106, 27, 154, 0.4);
    transform: translateY(-2px);
  }

  /* Current Task Node Styles */
  .custom-current-task-node {
    background: linear-gradient(135deg, #1976D2, #2196F3);
    border: 3px solid #0D47A1;
    border-radius: 10px;
    padding: 16px 20px;
    min-width: 220px;
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
    min-width: 200px;
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
    min-width: 200px;
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
</style>
