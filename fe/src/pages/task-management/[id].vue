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
      <v-btn color="primary" prepend-icon="mdi-arrow-left" variant="outlined" @click="goBackToTasks">
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
            <!-- First row: task name, project, parent task -->
            <v-col cols="12" md="4">
              <v-text-field
                v-model="taskForm.name"
                density="compact"
                label="Task Name"
                prepend-icon="mdi-clipboard-text"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                density="compact"
                label="Project"
                :model-value="task.project?.name || 'Unknown'"
                prepend-icon="mdi-clipboard-outline"
                readonly
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="taskForm.parentTaskId"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="availableTasks.filter(t => t.id !== taskId)"
                label="Parent Task"
                prepend-icon="mdi-file-tree"
                variant="outlined"
              />
            </v-col>

            <!-- Second row: description -->
            <v-col cols="12">
              <v-textarea
                v-model="taskForm.description"
                density="compact"
                label="Description"
                prepend-icon="mdi-text-box"
                rows="2"
                variant="outlined"
              />
            </v-col>

            <!-- Third row: evaluator, status, priority, complexity -->
            <v-col cols="12" md="3">
              <v-select
                v-model="taskForm.evaluatorId"
                clearable
                density="compact"
                item-title="firstName"
                item-value="id"
                :items="availableStaff"
                label="Evaluator"
                prepend-icon="mdi-account-check"
                variant="outlined"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="`${item.raw.firstName} ${item.raw.lastName}`" />
                </template>
                <template #selection="{ item }">
                  {{ item.raw.firstName }} {{ item.raw.lastName }}
                </template>
              </v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="taskForm.statusId"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="availableStatuses"
                label="Status"
                prepend-icon="mdi-flag"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="taskForm.priorityId"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="availablePriorities"
                label="Priority"
                prepend-icon="mdi-priority-high"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="taskForm.complexityId"
                clearable
                density="compact"
                item-title="name"
                item-value="id"
                :items="availableComplexities"
                label="Complexity"
                prepend-icon="mdi-chart-line"
                variant="outlined"
              />
            </v-col>

            <!-- Fourth row: planned and actual dates -->
            <v-col cols="12" md="3">
              <v-text-field
                v-model="taskForm.plannedStartDate"
                density="compact"
                label="Planned Start Date"
                prepend-icon="mdi-calendar-start"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="taskForm.plannedEndDate"
                density="compact"
                label="Planned End Date"
                prepend-icon="mdi-calendar-end"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="taskForm.actualStartDate"
                density="compact"
                label="Actual Start Date"
                prepend-icon="mdi-calendar-check"
                type="date"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="taskForm.actualEndDate"
                density="compact"
                label="Actual End Date"
                prepend-icon="mdi-calendar-check-outline"
                type="date"
                variant="outlined"
              />
            </v-col>

            <!-- Save and Undo buttons -->
            <v-col class="d-flex gap-2" cols="12">
              <v-btn
                color="primary"
                :disabled="!taskFormModified"
                prepend-icon="mdi-content-save"
                @click="saveTaskChanges"
              >
                Save Changes
              </v-btn>
              <v-btn
                color="secondary"
                :disabled="!taskFormModified"
                prepend-icon="mdi-undo"
                variant="outlined"
                @click="undoTaskChanges"
              >
                Undo Changes
              </v-btn>
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
              <v-btn color="primary" icon="mdi-plus" size="small" @click="openAssigneeCreateDialog">
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
              <v-list-item v-for="assignee in assignees" :key="assignee.id" class="px-0">
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
              <v-btn color="primary" icon="mdi-plus" size="small" @click="openPredecessorCreateDialog">
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
              <v-list-item v-for="predecessor in predecessors" :key="predecessor.id" class="px-0">
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
              <v-btn color="primary" icon="mdi-plus" size="small" @click="openChildTaskCreateDialog">
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
              <v-list-item v-for="childTask in childTasks" :key="childTask.id" class="px-0">
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
                Progress Reports ({{ sortedProgressReports.length }})
              </span>
              <v-btn color="primary" icon="mdi-plus" size="small" @click="openProgressReportCreateDialog">
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Progress Report</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="sortedProgressReports.length === 0" class="text-center text-medium-emphasis py-4">
              No progress reports yet
            </div>
            <v-data-table
              v-else
              class="border"
              density="compact"
              :headers="[
                { title: 'Percentage', key: 'progressPercent', width: '120px' },
                { title: 'Note', key: 'notes', sortable: false },
                { title: 'Creator', key: 'creator', width: '150px', sortable: false },
                { title: 'Date', key: 'reportDate', width: '120px' },
                { title: 'Actions', key: 'actions', width: '120px', sortable: false }
              ]"
              :items="sortedProgressReports"
            >
              <template #item.progressPercent="{ item }">
                <v-chip
                  :color="item.progressPercent < 25 ? 'error' :
                    item.progressPercent < 50 ? 'warning' :
                    item.progressPercent < 75 ? 'info' :
                    item.progressPercent < 100 ? 'success' : 'purple'"
                  size="small"
                  variant="flat"
                >
                  {{ item.progressPercent }}%
                </v-chip>
              </template>

              <template #item.notes="{ item }">
                <span class="text-body-2">{{ item.notes || 'No notes' }}</span>
              </template>

              <template #item.creator="{ item }">
                <span v-if="item.creator" class="text-body-2">
                  {{ item.creator.firstName }} {{ item.creator.lastName }}
                </span>
                <span v-else class="text-medium-emphasis">Unknown</span>
              </template>

              <template #item.reportDate="{ item }">
                <span class="text-body-2">{{ formatDate(item.reportDate) }}</span>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    color="primary"
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="openProgressReportEditDialog(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">Edit Report</v-tooltip>
                  </v-btn>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="openProgressReportDeleteDialog(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Delete Report</v-tooltip>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
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
                Status Reports ({{ sortedStatusReports.length }})
              </span>
              <v-btn color="primary" icon="mdi-plus" size="small" @click="openStatusReportCreateDialog">
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="top">Add Status Report</v-tooltip>
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="sortedStatusReports.length === 0" class="text-center text-medium-emphasis py-4">
              No status reports yet
            </div>
            <v-data-table
              v-else
              class="border"
              density="compact"
              :headers="[
                { title: 'Summary', key: 'statusSummary', sortable: false },
                { title: 'Creator', key: 'creator', width: '150px', sortable: false },
                { title: 'Date', key: 'reportDate', width: '120px' },
                { title: 'Actions', key: 'actions', width: '120px', sortable: false }
              ]"
              :items="sortedStatusReports"
            >
              <template #item.statusSummary="{ item }">
                <span
                  class="text-body-2"
                  :class="item.statusSummary ? 'text-high-emphasis' : 'text-medium-emphasis'"
                >
                  {{ item.statusSummary || 'No status summary provided' }}
                </span>
              </template>

              <template #item.creator="{ item }">
                <span v-if="item.creator" class="text-body-2">
                  {{ item.creator.firstName }} {{ item.creator.lastName }}
                </span>
                <span v-else class="text-medium-emphasis">Unknown</span>
              </template>

              <template #item.reportDate="{ item }">
                <span class="text-body-2">{{ formatDate(item.reportDate) }}</span>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex gap-1">
                  <v-btn
                    color="primary"
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="openStatusReportEditDialog(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">Edit Report</v-tooltip>
                  </v-btn>
                  <v-btn
                    color="error"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    @click="openStatusReportDeleteDialog(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">Delete Report</v-tooltip>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Back Button - Bottom -->
    <div class="d-flex justify-center mb-6">
      <v-btn color="primary" prepend-icon="mdi-arrow-left" variant="outlined" @click="goBackToTasks">
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

    <v-dialog v-model="showPredecessorCreateDialog" max-width="700" persistent>
      <TaskPredecessorDialog
        :available-complexities="availableComplexities"
        :available-priorities="availablePriorities"
        :available-projects="availableProjects"
        :available-statuses="availableStatuses"
        :available-tasks="availableTasks"
        :current-predecessors="predecessors"
        :current-task-id="taskId"
        @cancel="showPredecessorCreateDialog = false"
        @predecessor-created="handlePredecessorCreated"
        @predecessor-selected="handlePredecessorSelected"
      />
    </v-dialog>

    <v-dialog v-model="showChildTaskCreateDialog" max-width="700" persistent>
      <TaskChildDialog
        :available-complexities="availableComplexities"
        :available-priorities="availablePriorities"
        :available-statuses="availableStatuses"
        :available-tasks="availableTasks"
        :current-child-tasks="childTasks"
        :parent-task-id="taskId"
        :project-id="task?.projectId || ''"
        @cancel="showChildTaskCreateDialog = false"
        @child-created="handleChildTaskCreated"
        @child-selected="handleChildTaskSelected"
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
        :eligible-staff="eligibleStaff"
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
        :eligible-staff="eligibleStaff"
        :status-report="selectedStatusReport"
        @cancel="showStatusReportEditDialog = false"
        @updated="handleStatusReportUpdated"
      />
    </v-dialog>

    <!-- Task Graph Dialog -->
    <v-dialog v-model="showTaskGraphDialog" fullscreen persistent>
      <TaskGraphDialog v-if="task" :task="task" @close="showTaskGraphDialog = false" />
    </v-dialog>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top" timeout="4000">
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
    UpdateTaskInput,
    UpdateTaskProgressInput,
    UpdateTaskStatusReportInput,
  } from '../../services/tasks'
  import { computed, onMounted, reactive, ref, watch } from 'vue'

  import { useRoute, useRouter } from 'vue-router'
  // Import dialog components
  import TaskAssigneeCreateDialog from '../../components/tasks/TaskAssigneeCreateDialog.vue'
  import TaskChildDialog from '../../components/tasks/TaskChildDialog.vue'
  import TaskGraphDialog from '../../components/tasks/TaskGraphDialog.vue'
  import TaskPredecessorDialog from '../../components/tasks/TaskPredecessorDialog.vue'
  import TaskProgressCreateDialog from '../../components/tasks/TaskProgressCreateDialog.vue'
  import TaskProgressEditDialog from '../../components/tasks/TaskProgressEditDialog.vue'

  import TaskStatusReportCreateDialog from '../../components/tasks/TaskStatusReportCreateDialog.vue'
  import TaskStatusReportEditDialog from '../../components/tasks/TaskStatusReportEditDialog.vue'
  import { getComplexities } from '../../services/complexity'
  import { getPriorities } from '../../services/priority'
  import { getProjects } from '../../services/projects'
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
    updateTask,
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
  const availableProjects = ref<Array<{ id: string, name: string }>>([])
  const availableStatuses = ref<Array<{ id: string, name: string }>>([])
  const availablePriorities = ref<Array<{ id: string, name: string }>>([])
  const availableComplexities = ref<Array<{ id: string, name: string }>>([])

  // Task editing form data
  const taskForm = reactive({
    name: '',
    description: '',
    parentTaskId: '',
    evaluatorId: '',
    statusId: '',
    priorityId: '',
    complexityId: '',
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
  })

  // Track if task form has been modified
  const taskFormModified = ref(false)

  // Watch for changes to task form to enable/disable save button
  watch(taskForm, () => {
    taskFormModified.value = true
  }, { deep: true })

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

  // Sorted progress reports (descending by date)
  const sortedProgressReports = computed(() => {
    return [...progressReports.value].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
  })

  // Sorted status reports (newest first)
  const sortedStatusReports = computed(() => {
    return [...statusReports.value].sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
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

  // Task form functions
  function populateTaskForm () {
    if (!task.value) return

    taskForm.name = task.value.name || ''
    taskForm.description = task.value.description || ''
    taskForm.parentTaskId = task.value.parentTaskId || ''
    taskForm.evaluatorId = task.value.evaluatorId || ''
    taskForm.statusId = task.value.statusId || ''
    taskForm.priorityId = task.value.priorityId || ''
    taskForm.complexityId = task.value.complexityId || ''
    taskForm.plannedStartDate = task.value.plannedStartDate || ''
    taskForm.plannedEndDate = task.value.plannedEndDate || ''
    taskForm.actualStartDate = task.value.actualStartDate || ''
    taskForm.actualEndDate = task.value.actualEndDate || ''

    taskFormModified.value = false
  }

  async function saveTaskChanges () {
    if (!task.value || !taskFormModified.value) return

    try {
      const updateData: UpdateTaskInput = {
        id: task.value.id,
        name: taskForm.name || undefined,
        description: taskForm.description || undefined,
        parentTaskId: taskForm.parentTaskId || undefined,
        evaluatorId: taskForm.evaluatorId || undefined,
        statusId: taskForm.statusId || undefined,
        priorityId: taskForm.priorityId || undefined,
        complexityId: taskForm.complexityId || undefined,
        plannedStartDate: taskForm.plannedStartDate || undefined,
        plannedEndDate: taskForm.plannedEndDate || undefined,
        actualStartDate: taskForm.actualStartDate || undefined,
        actualEndDate: taskForm.actualEndDate || undefined,
      }

      const { updateTask: updatedTask } = await updateTask(updateData)
      task.value = updatedTask
      taskFormModified.value = false
      showNotification('Task updated successfully')
    } catch (error) {
      console.error('Failed to update task:', error)
      showNotification(`Failed to update task: ${(error as Error).message}`, false)
    }
  }

  async function undoTaskChanges () {
    populateTaskForm()
    showNotification('Changes reverted')
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

  async function handlePredecessorSelected (predecessorTaskId: string) {
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

  async function handlePredecessorCreated (taskData: CreateTaskInput) {
    try {
      // First create the task
      const { createTask: newTask } = await createTask(taskData)
      // Then add it as a predecessor
      await addTaskPredecessor(taskId.value, newTask.id)
      showNotification(`Task "${newTask.name}" created and added as predecessor`)
      showPredecessorCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to create predecessor task:', error)
      showNotification(`Failed to create predecessor task: ${(error as Error).message}`, false)
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

  async function handleChildTaskSelected (childTaskId: string) {
    try {
      // Update the selected task to set its parent
      await updateTask({
        id: childTaskId,
        parentTaskId: taskId.value,
      })
      showNotification('Task converted to child task successfully')
      showChildTaskCreateDialog.value = false
      await loadTaskData()
    } catch (error) {
      console.error('Failed to set task as child:', error)
      showNotification(`Failed to set task as child: ${(error as Error).message}`, false)
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

      // Populate the task form with loaded data
      populateTaskForm()

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
      const [staffResponse, tasksResponse, projectsResponse, statusesResponse, prioritiesResponse, complexitiesResponse] = await Promise.all([
        getStaff(),
        getTasks(),
        getProjects(),
        getStatuses(),
        getPriorities(),
        getComplexities(),
      ])

      availableStaff.value = staffResponse.staff || []
      availableTasks.value = tasksResponse.tasks || []
      availableProjects.value = projectsResponse.projects?.map(p => ({ id: p.id, name: p.name })) || []
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
