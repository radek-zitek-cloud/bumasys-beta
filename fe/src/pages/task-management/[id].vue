<!--
  @fileoverview Task Management Enhancement Page

  This page provides comprehensive management of a specific task including:
  - Task assignees (CRUD operations)
  - Task predecessors (CRUD operations) 
  - Child tasks (CRUD operations)
  - Progress reports (CRUD operations)
  - Status reports (CRUD operations)
  
  Follows the design patterns established in the user management interface.
-->

<template>
  <v-container fluid>
    <!-- Back Button - Top -->
    <div class="d-flex align-center mb-6">
      <v-btn
        color="primary"
        prepend-icon="mdi-arrow-left"
        variant="outlined"
        @click="goBackToTasks"
      >
        Back to Tasks
      </v-btn>
    </div>

    <!-- Page Header with Task Details -->
    <div class="mb-6">
      
      <!-- Task Details Card -->
      <v-card v-if="task" class="mb-6">
        <v-card-title class="bg-primary">
          <v-icon class="mr-2">mdi-clipboard-text</v-icon>
          Task Details: {{ task?.name || 'Loading...' }}
        </v-card-title>
        <v-card-text>
            <v-row class="pt-4">
            <!-- Basic Info -->
            <v-col cols="12" md="6">
              <v-text-field
              label="Task Name"
              :model-value="task.name"
              prepend-icon="mdi-clipboard-text"
              readonly
              variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
              label="Project"
              :model-value="task.project?.name || 'Unknown'"
              prepend-icon="mdi-clipboard-outline"
              readonly
              variant="outlined"
              />
            </v-col>
            
            <!-- Description -->
            <v-col cols="12">
              <v-textarea
              label="Description"
              :model-value="task.description || 'No description provided'"
              prepend-icon="mdi-text-box"
              readonly
              rows="2"
              variant="outlined"
              />
            </v-col>
            
            <!-- Status Info -->
            <v-col cols="12" md="4">
              <v-text-field
              label="Status"
              :model-value="task.status?.name || 'Not set'"
              prepend-icon="mdi-flag"
              readonly
              variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
              label="Priority"
              :model-value="task.priority?.name || 'Not set'"
              prepend-icon="mdi-priority-high"
              readonly
              variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
              label="Complexity"
              :model-value="task.complexity?.name || 'Not set'"
              prepend-icon="mdi-chart-line"
              readonly
              variant="outlined"
              />
            </v-col>
            </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Management Sections -->
    <v-row>
      <!-- Assignees Section -->
      <v-col cols="12" lg="4">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>
                <v-icon class="mr-2">mdi-account-group</v-icon>
                Assignees ({{ assignees.length }})
              </span>
              <v-btn
                color="primary"
                icon="mdi-plus"
                size="small"
                @click="openAssigneeCreateDialog"
              >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Assignee</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="assignees.length === 0" class="text-center text-medium-emphasis py-4">
              No assignees yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="assignee in assignees"
                :key="assignee.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="primary" size="32">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ assignee.firstName }} {{ assignee.lastName }}</v-list-item-title>
                <v-list-item-subtitle>{{ assignee.role }} - {{ assignee.department?.name }}</v-list-item-subtitle>
                <template #append>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="openAssigneeDeleteDialog(assignee)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Remove Assignee</v-tooltip>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Predecessors Section -->
      <v-col cols="12" lg="4">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>
                <v-icon class="mr-2">mdi-arrow-left-bold</v-icon>
                Predecessors ({{ predecessors.length }})
              </span>
              <v-btn
                color="primary"
                icon="mdi-plus"
                size="small"
                @click="openPredecessorCreateDialog"
              >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Predecessor</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="predecessors.length === 0" class="text-center text-medium-emphasis py-4">
              No predecessors yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="predecessor in predecessors"
                :key="predecessor.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="info" size="32">
                    <v-icon>mdi-clipboard-text</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ predecessor.name }}</v-list-item-title>
                <v-list-item-subtitle>Project: {{ predecessor.project?.name }}</v-list-item-subtitle>
                <template #append>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="openPredecessorDeleteDialog(predecessor)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Remove Predecessor</v-tooltip>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Child Tasks Section -->
      <v-col cols="12" lg="4">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>
                <v-icon class="mr-2">mdi-file-tree</v-icon>
                Child Tasks ({{ childTasks.length }})
              </span>
              <v-btn
                color="primary"
                icon="mdi-plus"
                size="small"
                @click="openChildTaskCreateDialog"
              >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Child Task</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="childTasks.length === 0" class="text-center text-medium-emphasis py-4">
              No child tasks yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="childTask in childTasks"
                :key="childTask.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="success" size="32">
                    <v-icon>mdi-clipboard-text</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ childTask.name }}</v-list-item-title>
                <v-list-item-subtitle>Status: {{ childTask.status?.name || 'Not set' }}</v-list-item-subtitle>
                <template #append>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="openChildTaskDeleteDialog(childTask)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Remove Child Task</v-tooltip>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Reports Section -->
    <v-row>
      <!-- Progress Reports Section -->
      <v-col cols="12" lg="6">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>
                <v-icon class="mr-2">mdi-chart-line</v-icon>
                Progress Reports ({{ progressReports.length }})
              </span>
              <v-btn
                color="primary"
                icon="mdi-plus"
                size="small"
                @click="openProgressReportCreateDialog"
              >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Progress Report</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="progressReports.length === 0" class="text-center text-medium-emphasis py-4">
              No progress reports yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="report in progressReports"
                :key="report.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="warning" size="32">
                    <span class="text-white font-weight-bold">{{ report.progressPercent }}%</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ formatDate(report.reportDate) }}</v-list-item-title>
                <v-list-item-subtitle>{{ report.notes || 'No notes' }}</v-list-item-subtitle>
                <template #append>
                  <div class="d-flex gap-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="openProgressReportEditDialog(report)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                      <v-tooltip activator="parent" location="top">Edit Report</v-tooltip>
                    </v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      @click="openProgressReportDeleteDialog(report)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">Delete Report</v-tooltip>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Status Reports Section -->
      <v-col cols="12" lg="6">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>
                <v-icon class="mr-2">mdi-flag</v-icon>
                Status Reports ({{ statusReports.length }})
              </span>
              <v-btn
                color="primary"
                icon="mdi-plus"
                size="small"
                @click="openStatusReportCreateDialog"
              >
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Status Report</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="statusReports.length === 0" class="text-center text-medium-emphasis py-4">
              No status reports yet
            </div>
            <v-list v-else>
              <v-list-item
                v-for="report in statusReports"
                :key="report.id"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="info" size="32">
                    <v-icon>mdi-flag</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ formatDate(report.reportDate) }}</v-list-item-title>
                <v-list-item-subtitle>{{ report.statusSummary || 'No summary' }}</v-list-item-subtitle>
                <template #append>
                  <div class="d-flex gap-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      @click="openStatusReportEditDialog(report)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                      <v-tooltip activator="parent" location="top">Edit Report</v-tooltip>
                    </v-btn>
                    <v-btn
                      color="error"
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      @click="openStatusReportDeleteDialog(report)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      <v-tooltip activator="parent" location="top">Delete Report</v-tooltip>
                    </v-btn>
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Back Button - Bottom -->
    <div class="d-flex justify-center mb-6">
      <v-btn
        color="primary"
        prepend-icon="mdi-arrow-left"
        variant="outlined"
        @click="goBackToTasks"
      >
        Back to Tasks
      </v-btn>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="top"
      timeout="4000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  // Import services and types
  import type { 
    Task, 
    Staff, 
    TaskProgress, 
    TaskStatusReport,
    CreateTaskProgressInput,
    UpdateTaskProgressInput,
    CreateTaskStatusReportInput,
    UpdateTaskStatusReportInput
  } from '../../services/tasks'
  import { 
    getTaskWithManagementData,
    assignStaffToTask,
    removeStaffFromTask,
    addTaskPredecessor,
    removeTaskPredecessor,
    createTaskProgress,
    updateTaskProgress,
    deleteTaskProgress,
    createTaskStatusReport,
    updateTaskStatusReport,
    deleteTaskStatusReport,
    getTasks
  } from '../../services/tasks'
  import { getStaff } from '../../services/staff'

  // Router and route
  const router = useRouter()
  const route = useRoute()
  
  // Task ID from route params
  const taskId = computed(() => (route.params as { id: string }).id)

  // Reactive data
  const task = ref<Task | null>(null)
  const assignees = ref<Staff[]>([])
  const predecessors = ref<Task[]>([])
  const childTasks = ref<Task[]>([])
  const progressReports = ref<TaskProgress[]>([])
  const statusReports = ref<TaskStatusReport[]>([])
  const loading = ref(false)

  // Available data for dropdowns
  const availableStaff = ref<Staff[]>([])
  const availableTasks = ref<Task[]>([])

  // Snackbar for notifications
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success' as 'success' | 'error',
  })

  // Utility functions
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString()
  }

  function showNotification(message: string, isSuccess = true) {
    snackbar.value.message = message
    snackbar.value.color = isSuccess ? 'success' : 'error'
    snackbar.value.show = true
  }

  function goBackToTasks() {
    router.push('/tasks')
  }

  // Dialog functions (placeholders for now - will implement dialogs next)
  function openAssigneeCreateDialog() {
    showNotification('Assignee creation dialog - coming soon', false)
  }

  async function openAssigneeDeleteDialog(assignee: Staff) {
    try {
      await removeStaffFromTask(taskId.value, assignee.id)
      showNotification(`Removed assignee ${assignee.firstName} ${assignee.lastName}`)
      await loadTaskData()
    } catch (error) {
      console.error('Failed to remove assignee:', error)
      showNotification(`Failed to remove assignee: ${(error as Error).message}`, false)
    }
  }

  function openPredecessorCreateDialog() {
    showNotification('Predecessor creation dialog - coming soon', false)
  }

  async function openPredecessorDeleteDialog(predecessor: Task) {
    try {
      await removeTaskPredecessor(taskId.value, predecessor.id)
      showNotification(`Removed predecessor ${predecessor.name}`)
      await loadTaskData()
    } catch (error) {
      console.error('Failed to remove predecessor:', error)
      showNotification(`Failed to remove predecessor: ${(error as Error).message}`, false)
    }
  }

  function openChildTaskCreateDialog() {
    showNotification('Child task creation dialog - coming soon', false)
  }

  function openChildTaskDeleteDialog(childTask: Task) {
    showNotification(`Remove child task ${childTask.name} - coming soon`, false)
  }

  function openProgressReportCreateDialog() {
    showNotification('Progress report creation dialog - coming soon', false)
  }

  function openProgressReportEditDialog(report: TaskProgress) {
    showNotification(`Edit progress report from ${formatDate(report.reportDate)} - coming soon`, false)
  }

  async function openProgressReportDeleteDialog(report: TaskProgress) {
    try {
      await deleteTaskProgress(report.id)
      showNotification('Progress report deleted')
      await loadTaskData()
    } catch (error) {
      console.error('Failed to delete progress report:', error)
      showNotification(`Failed to delete progress report: ${(error as Error).message}`, false)
    }
  }

  function openStatusReportCreateDialog() {
    showNotification('Status report creation dialog - coming soon', false)
  }

  function openStatusReportEditDialog(report: TaskStatusReport) {
    showNotification(`Edit status report from ${formatDate(report.reportDate)} - coming soon`, false)
  }

  async function openStatusReportDeleteDialog(report: TaskStatusReport) {
    try {
      await deleteTaskStatusReport(report.id)
      showNotification('Status report deleted')
      await loadTaskData()
    } catch (error) {
      console.error('Failed to delete status report:', error)
      showNotification(`Failed to delete status report: ${(error as Error).message}`, false)
    }
  }

  // Data loading function
  async function loadTaskData() {
    loading.value = true
    try {
      // Load the task with all management data
      const { task: taskData } = await getTaskWithManagementData(taskId.value)
      
      if (!taskData) {
        showNotification('Task not found', false)
        router.push('/tasks')
        return
      }

      task.value = taskData
      assignees.value = taskData.assignees || []
      predecessors.value = taskData.predecessors || []
      childTasks.value = taskData.childTasks || []
      progressReports.value = taskData.progressReports || []
      statusReports.value = taskData.statusReports || []

      showNotification('Task data loaded successfully')
    } catch (error) {
      console.error('Failed to load task data:', error)
      showNotification('Failed to load task data', false)
    } finally {
      loading.value = false
    }
  }

  // Load available staff and tasks for dropdowns
  async function loadDropdownData() {
    try {
      const [staffResponse, tasksResponse] = await Promise.all([
        getStaff(),
        getTasks()
      ])
      
      availableStaff.value = staffResponse.staff || []
      availableTasks.value = tasksResponse.tasks || []
    } catch (error) {
      console.error('Failed to load dropdown data:', error)
    }
  }

  // Load data on mount
  onMounted(async () => {
    await Promise.all([
      loadTaskData(),
      loadDropdownData()
    ])
  })
</script>