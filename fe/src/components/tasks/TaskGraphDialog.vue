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
            :default-viewport="{ zoom: 1 }"
            :max-zoom="2"
            :min-zoom="0.5"
          >
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

  // Import Vue Flow styles
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

  /** Dialog dimensions */
  const dialogWidth = computed(() => '90vw')
  const dialogHeight = computed(() => '80vh')

  /** Initialize the graph with the current task */
  const initializeGraph = () => {
    try {
      loading.value = true
      error.value = null

      // Create a single node for the current task
      const taskNode = {
        id: props.task.id,
        type: 'task',
        position: { x: 250, y: 150 },
        data: {
          name: props.task.name,
          project: props.task.project?.name || 'Unknown Project',
        },
      }

      elements.value = [taskNode]
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

  .node-icon {
    flex-shrink: 0;
  }

  .node-content {
    flex: 1;
  }

  .node-name {
    font-size: 14px;
    font-weight: bold;
    color: #1976D2;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .node-project {
    font-size: 12px;
    color: #666;
    line-height: 1.2;
  }
</style>
