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
          <div class="d-flex justify-space-between align-center w-100">
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-clipboard-text</v-icon>
              Task Details: {{ task?.name || 'Loading...' }}
            </div>
            <v-btn
              color="white"
              icon="mdi-graph"
              size="small"
              variant="text"
              @click="openTaskGraphDialog"
            >
              <v-icon>mdi-graph</v-icon>
              <v-tooltip activator="parent" location="bottom">Display Graph</v-tooltip>
            </v-btn>
          </div>
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

    <!-- Task Management Dialogs -->
    <v-dialog v-model="showAssigneeCreateDialog" max-width="500" persistent>
      <TaskAssigneeCreateDialog
        :available-staff="availableStaff"
        :current-assignees="assignees"
        @cancel="showAssigneeCreateDialog = false"
        @created="handleAssigneeCreated"
      />
    </v-dialog>

    <v-dialog v-model="showPredecessorCreateDialog" max-width="600" persistent>
      <TaskPredecessorCreateDialog
        :available-tasks="availableTasks"
        :current-predecessors="predecessors"
        :current-task-id="taskId"
        @cancel="showPredecessorCreateDialog = false"
        @created="handlePredecessorCreated"
      />
    </v-dialog>

    <v-dialog v-model="showChildTaskCreateDialog" max-width="700" persistent>
      <TaskChildCreateDialog
        :available-complexities="availableComplexities"
        :available-priorities="availablePriorities"
        :available-statuses="availableStatuses"
        :parent-task-id="taskId"
        :project-id="task?.projectId || ''"
        @cancel="showChildTaskCreateDialog = false"
        @created="handleChildTaskCreated"
      />
    </v-dialog>

    <v-dialog v-model="showProgressReportCreateDialog" max-width="500" persistent>
      <TaskProgressCreateDialog
        :eligible-staff="eligibleStaff"
        :task-id="taskId"
        @cancel="showProgressReportCreateDialog = false"
        @created="handleProgressReportCreated"
      />
    </v-dialog>

    <v-dialog v-model="showProgressReportEditDialog" max-width="500" persistent>
      <TaskProgressEditDialog
        v-if="selectedProgressReport"
        :progress-report="selectedProgressReport"
        @cancel="showProgressReportEditDialog = false"
        @updated="handleProgressReportUpdated"
      />
    </v-dialog>

    <v-dialog v-model="showStatusReportCreateDialog" max-width="600" persistent>
      <TaskStatusReportCreateDialog
        :eligible-staff="eligibleStaff"
        :task-id="taskId"
        @cancel="showStatusReportCreateDialog = false"
        @created="handleStatusReportCreated"
      />
    </v-dialog>

    <v-dialog v-model="showStatusReportEditDialog" max-width="600" persistent>
      <TaskStatusReportEditDialog
        v-if="selectedStatusReport"
        :status-report="selectedStatusReport"
        @cancel="showStatusReportEditDialog = false"
        @updated="handleStatusReportUpdated"
      />
    </v-dialog>

    <!-- Task Graph Dialog -->
    <v-dialog v-model="showTaskGraphDialog" fullscreen persistent>
      <TaskGraphDialog
        v-if="task"
        :task="task"
        @close="showTaskGraphDialog = false"
      />
    </v-dialog>

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
  // Import services and types
  import type {
    CreateTaskInput,
    CreateTaskProgressInput,
    CreateTaskStatusReportInput,
    Staff,
    Task,
    TaskProgress,
    TaskStatusReport,
    UpdateTaskProgressInput,
    UpdateTaskStatusReportInput,
  } from '../../services/tasks'
  import { computed, onMounted, ref } from 'vue'

  import { useRoute, useRouter } from 'vue-router'
  // Import dialog components
  import TaskAssigneeCreateDialog from '../../components/tasks/TaskAssigneeCreateDialog.vue'
  import TaskChildCreateDialog from '../../components/tasks/TaskChildCreateDialog.vue'
  import TaskGraphDialog from '../../components/tasks/TaskGraphDialog.vue'
  import TaskPredecessorCreateDialog from '../../components/tasks/TaskPredecessorCreateDialog.vue'
  import TaskProgressCreateDialog from '../../components/tasks/TaskProgressCreateDialog.vue'
  import TaskProgressEditDialog from '../../components/tasks/TaskProgressEditDialog.vue'

  import TaskStatusReportCreateDialog from '../../components/tasks/TaskStatusReportCreateDialog.vue'
  import TaskStatusReportEditDialog from '../../components/tasks/TaskStatusReportEditDialog.vue'
  import { getComplexities } from '../../services/complexity'
  import { getPriorities } from '../../services/priority'
  import { getStaff } from '../../services/staff'
  import { getStatuses } from '../../services/status'
  import {
    addTaskPredecessor,
    assignStaffToTask,
    createTask,
    createTaskProgress,
    createTaskStatusReport,
    deleteTaskProgress,
    deleteTaskStatusReport,
    getTasks,
    getTaskWithManagementData,
    removeStaffFromTask,
    removeTaskPredecessor,
    updateTaskProgress,
    updateTaskStatusReport,
  } from '../../services/tasks'

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
  const availableStatuses = ref<Array<{ id: string, name: string }>>([])
  const availablePriorities = ref<Array<{ id: string, name: string }>>([])
  const availableComplexities = ref<Array<{ id: string, name: string }>>([])

  // Eligible staff for report creation (assigned to task + evaluator)
  const eligibleStaff = computed(() => {
    if (!task.value) return []

    const eligible: Staff[] = []

    // Add all assigned staff
    for (const staff of assignees.value) {
      if (!eligible.some(s => s.id === staff.id)) {
        eligible.push(staff)
      }
    }

    // Add evaluator if available
    if (task.value.evaluator) {
      const evaluator: Staff = {
        id: task.value.evaluator.id,
        firstName: task.value.evaluator.firstName,
        lastName: task.value.evaluator.lastName,
        email: task.value.evaluator.email,
        role: 'Evaluator', // We don't have the actual role, but this is descriptive
        department: undefined,
      }

      if (!eligible.some(s => s.id === evaluator.id)) {
        eligible.push(evaluator)
      }
    }

    return eligible
  })

  // Dialog visibility state
  const showAssigneeCreateDialog = ref(false)
  const showPredecessorCreateDialog = ref(false)
  const showChildTaskCreateDialog = ref(false)
  const showProgressReportCreateDialog = ref(false)
  const showProgressReportEditDialog = ref(false)
  const showStatusReportCreateDialog = ref(false)
  const showStatusReportEditDialog = ref(false)
  const showTaskGraphDialog = ref(false)

  // Selected items for editing
  const selectedProgressReport = ref<TaskProgress | null>(null)
  const selectedStatusReport = ref<TaskStatusReport | null>(null)

  // Snackbar for notifications
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success' as 'success' | 'error',
  })

  // Utility functions
  function formatDate (dateString: string): string {
    return new Date(dateString).toLocaleDateString()
  }

  function showNotification (message: string, isSuccess = true) {
    snackbar.value.message = message
    snackbar.value.color = isSuccess ? 'success' : 'error'
    snackbar.value.show = true
  }

  function goBackToTasks () {
    router.push('/tasks')
  }

  // Dialog functions
  function openAssigneeCreateDialog () {
    showAssigneeCreateDialog.value = true
  }

  function openTaskGraphDialog () {
    showTaskGraphDialog.value = true
  }

  async function handleAssigneeCreated (staffId: string) {
    try {
      await assignStaffToTask(taskId.value, staffId)
      showNotification('Assignee added successfully')
      showAssigneeCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to add assignee:', error)
      showNotification(`Failed to add assignee: ${(error as Error).message}`, false)
    }
  }

  async function openAssigneeDeleteDialog (assignee: Staff) {
    try {
      await removeStaffFromTask(taskId.value, assignee.id)
      showNotification(`Removed assignee ${assignee.firstName} ${assignee.lastName}`)
      await loadTaskData()
    } catch (error) {
      console.error('Failed to remove assignee:', error)
      showNotification(`Failed to remove assignee: ${(error as Error).message}`, false)
    }
  }

  function openPredecessorCreateDialog () {
    showPredecessorCreateDialog.value = true
  }

  async function handlePredecessorCreated (predecessorTaskId: string) {
    try {
      await addTaskPredecessor(taskId.value, predecessorTaskId)
      showNotification('Predecessor added successfully')
      showPredecessorCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to add predecessor:', error)
      showNotification(`Failed to add predecessor: ${(error as Error).message}`, false)
    }
  }

  async function openPredecessorDeleteDialog (predecessor: Task) {
    try {
      await removeTaskPredecessor(taskId.value, predecessor.id)
      showNotification(`Removed predecessor ${predecessor.name}`)
      await loadTaskData()
    } catch (error) {
      console.error('Failed to remove predecessor:', error)
      showNotification(`Failed to remove predecessor: ${(error as Error).message}`, false)
    }
  }

  function openChildTaskCreateDialog () {
    showChildTaskCreateDialog.value = true
  }

  async function handleChildTaskCreated (taskData: CreateTaskInput) {
    try {
      const { createTask: newTask } = await createTask(taskData)
      showNotification(`Child task "${newTask.name}" created successfully`)
      showChildTaskCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to create child task:', error)
      showNotification(`Failed to create child task: ${(error as Error).message}`, false)
    }
  }

  function openChildTaskDeleteDialog (childTask: Task) {
    showNotification(`Remove child task ${childTask.name} - coming soon`, false)
  }

  function openProgressReportCreateDialog () {
    showProgressReportCreateDialog.value = true
  }

  async function handleProgressReportCreated (progressData: CreateTaskProgressInput) {
    try {
      await createTaskProgress(progressData)
      showNotification('Progress report created successfully')
      showProgressReportCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to create progress report:', error)
      showNotification(`Failed to create progress report: ${(error as Error).message}`, false)
    }
  }

  function openProgressReportEditDialog (report: TaskProgress) {
    selectedProgressReport.value = report
    showProgressReportEditDialog.value = true
  }

  async function handleProgressReportUpdated (progressData: UpdateTaskProgressInput) {
    try {
      await updateTaskProgress(progressData)
      showNotification('Progress report updated successfully')
      showProgressReportEditDialog.value = false
      selectedProgressReport.value = null
      await loadTaskData()
    } catch (error) {
      console.error('Failed to update progress report:', error)
      showNotification(`Failed to update progress report: ${(error as Error).message}`, false)
    }
  }

  async function openProgressReportDeleteDialog (report: TaskProgress) {
    try {
      await deleteTaskProgress(report.id)
      showNotification('Progress report deleted')
      await loadTaskData()
    } catch (error) {
      console.error('Failed to delete progress report:', error)
      showNotification(`Failed to delete progress report: ${(error as Error).message}`, false)
    }
  }

  function openStatusReportCreateDialog () {
    showStatusReportCreateDialog.value = true
  }

  async function handleStatusReportCreated (statusData: CreateTaskStatusReportInput) {
    try {
      await createTaskStatusReport(statusData)
      showNotification('Status report created successfully')
      showStatusReportCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to create status report:', error)
      showNotification(`Failed to create status report: ${(error as Error).message}`, false)
    }
  }

  function openStatusReportEditDialog (report: TaskStatusReport) {
    selectedStatusReport.value = report
    showStatusReportEditDialog.value = true
  }

  async function handleStatusReportUpdated (statusData: UpdateTaskStatusReportInput) {
    try {
      await updateTaskStatusReport(statusData)
      showNotification('Status report updated successfully')
      showStatusReportEditDialog.value = false
      selectedStatusReport.value = null
      await loadTaskData()
    } catch (error) {
      console.error('Failed to update status report:', error)
      showNotification(`Failed to update status report: ${(error as Error).message}`, false)
    }
  }

  async function openStatusReportDeleteDialog (report: TaskStatusReport) {
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
  async function loadTaskData () {
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
  async function loadDropdownData () {
    try {
      const [staffResponse, tasksResponse, statusesResponse, prioritiesResponse, complexitiesResponse] = await Promise.all([
        getStaff(),
        getTasks(),
        getStatuses(),
        getPriorities(),
        getComplexities(),
      ])

      availableStaff.value = staffResponse.staff || []
      availableTasks.value = tasksResponse.tasks || []
      availableStatuses.value = statusesResponse.statuses || []
      availablePriorities.value = prioritiesResponse.priorities || []
      availableComplexities.value = complexitiesResponse.complexities || []
    } catch (error) {
      console.error('Failed to load dropdown data:', error)
    }
  }

  // Load data on mount
  onMounted(async () => {
    await Promise.all([
      loadTaskData(),
      loadDropdownData(),
    ])
  })
</script>
