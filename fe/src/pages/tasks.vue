<!--
  @fileoverview Projects and Tasks Management Page

  This page provides a comprehensive interface for managing projects and tasks.
  It follows the design patterns established in the user management and organization
  management interfaces with two separate tables for projects and tasks.
-->

<template>
  <v-container fluid>
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 mb-2">Projects and Tasks Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage projects and their associated tasks throughout the system
        </p>
      </div>
    </div>

    <!-- Projects Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Projects ({{ filteredProjects.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openProjectCreateDialog"
              >
                Add Project
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-text-field
              v-model="projectSearch"
              clearable
              density="compact"
              hide-details
              label="Search projects..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
            />
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="projectHeaders"
            :items="filteredProjects"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="projectLoading"
            no-data-text="No projects found"
          >
            <!-- Custom Name Column -->
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.id }}
                </div>
              </div>
            </template>

            <!-- Description Column -->
            <template #item.description="{ item }">
              <span v-if="item.description" class="text-body-2">
                {{ item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description }}
              </span>
              <span v-else class="text-caption text-medium-emphasis">No description</span>
            </template>

            <!-- Lead Staff Column -->
            <template #item.leadStaff="{ item }">
              <span v-if="item.leadStaff" class="text-body-2">
                {{ item.leadStaff.firstName }} {{ item.leadStaff.lastName }}
              </span>
              <span v-else class="text-caption text-medium-emphasis">No lead assigned</span>
            </template>

            <!-- Planned Dates Column -->
            <template #item.plannedDates="{ item }">
              <div class="text-body-2">
                <div v-if="item.plannedStartDate">
                  Start: {{ formatDate(item.plannedStartDate) }}
                </div>
                <div v-if="item.plannedEndDate">
                  End: {{ formatDate(item.plannedEndDate) }}
                </div>
                <span v-if="!item.plannedStartDate && !item.plannedEndDate" class="text-caption text-medium-emphasis">
                  No dates set
                </span>
              </div>
            </template>

            <!-- Actual Dates Column -->
            <template #item.actualDates="{ item }">
              <div class="text-body-2">
                <div v-if="item.actualStartDate">
                  Start: {{ formatDate(item.actualStartDate) }}
                </div>
                <div v-if="item.actualEndDate">
                  End: {{ formatDate(item.actualEndDate) }}
                </div>
                <span v-if="!item.actualStartDate && !item.actualEndDate" class="text-caption text-medium-emphasis">
                  No dates set
                </span>
              </div>
            </template>

            <!-- Status Column -->
            <template #item.status="{ item }">
              <v-chip
                :color="getProjectStatusColor(item)"
                size="small"
                variant="tonal"
              >
                {{ getProjectStatusText(item) }}
              </v-chip>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="openProjectViewDialog(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">View Details</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openProjectEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Project</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openProjectDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Project</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tasks Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <div class="d-flex justify-space-between align-center w-100">
              <span>Tasks ({{ filteredTasks.length }})</span>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                size="small"
                @click="openTaskCreateDialog"
              >
                Add Task
              </v-btn>
            </div>
          </v-card-title>

          <v-card-subtitle>
            <v-row>
              <v-col cols="8">
                <v-text-field
                  v-model="taskSearch"
                  clearable
                  density="compact"
                  hide-details
                  label="Search tasks..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="taskProjectFilter"
                  clearable
                  density="compact"
                  hide-details
                  item-title="name"
                  item-value="id"
                  :items="projects"
                  label="Filter by project"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-card-subtitle>

          <v-data-table
            density="compact"
            :headers="taskHeaders"
            :items="filteredTasks"
            :items-per-page="itemsPerPage"
            :items-per-page-options="itemsPerPageOptions"
            :loading="taskLoading"
            no-data-text="No tasks found"
          >
            <!-- Custom Name Column -->
            <template #item.name="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  ID: {{ item.id }}
                </div>
              </div>
            </template>

            <!-- Project Column -->
            <template #item.project="{ item }">
              <v-chip
                color="primary"
                size="small"
                variant="outlined"
              >
                {{ item.project?.name || 'Unknown Project' }}
              </v-chip>
            </template>

            <!-- Parent Task Column -->
            <template #item.parentTask="{ item }">
              <span v-if="item.parentTask" class="text-body-2">
                {{ item.parentTask.name }}
              </span>
              <span v-else class="text-caption text-medium-emphasis">No parent</span>
            </template>

            <!-- Planned Dates Column -->
            <template #item.plannedDates="{ item }">
              <div class="text-body-2">
                <div v-if="item.plannedStartDate">
                  Start: {{ formatDate(item.plannedStartDate) }}
                </div>
                <div v-if="item.plannedEndDate">
                  End: {{ formatDate(item.plannedEndDate) }}
                </div>
                <span v-if="!item.plannedStartDate && !item.plannedEndDate" class="text-caption text-medium-emphasis">
                  No dates set
                </span>
              </div>
            </template>

            <!-- Actual Dates Column -->
            <template #item.actualDates="{ item }">
              <div class="text-body-2">
                <div v-if="item.actualStartDate">
                  Start: {{ formatDate(item.actualStartDate) }}
                </div>
                <div v-if="item.actualEndDate">
                  End: {{ formatDate(item.actualEndDate) }}
                </div>
                <span v-if="!item.actualStartDate && !item.actualEndDate" class="text-caption text-medium-emphasis">
                  No dates set
                </span>
              </div>
            </template>

            <!-- Actions Column -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-btn
                  icon="mdi-eye"
                  size="small"
                  variant="text"
                  @click="openTaskViewDialog(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                  <v-tooltip activator="parent" location="top">View Details</v-tooltip>
                </v-btn>
                <v-btn
                  color="primary"
                  icon="mdi-cog"
                  size="small"
                  variant="text"
                  @click="openTaskManagementPage(item)"
                >
                  <v-icon>mdi-cog</v-icon>
                  <v-tooltip activator="parent" location="top">Manage Task</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="openTaskEditDialog(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent" location="top">Edit Task</v-tooltip>
                </v-btn>
                <v-btn
                  color="error"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click="openTaskDeleteDialog(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent" location="top">Delete Task</v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Project Dialogs -->
    <v-dialog v-model="showProjectCreateDialog" max-width="800" persistent>
      <ProjectCreateDialog
        @cancel="showProjectCreateDialog = false"
        @submit="handleCreateProject"
      />
    </v-dialog>

    <v-dialog v-model="showProjectEditDialog" max-width="800" persistent>
      <ProjectEditDialog
        :project="selectedProject"
        @cancel="showProjectEditDialog = false"
        @submit="handleUpdateProject"
      />
    </v-dialog>

    <v-dialog v-model="showProjectViewDialog" max-width="800" persistent>
      <ProjectViewDialog
        :project="selectedProject"
        @close="showProjectViewDialog = false"
      />
    </v-dialog>

    <v-dialog v-model="showProjectDeleteDialog" max-width="500" persistent>
      <ProjectDeleteDialog
        :project="selectedProject"
        @cancel="showProjectDeleteDialog = false"
        @confirm="handleDeleteProject"
      />
    </v-dialog>

    <!-- Task Dialogs -->
    <v-dialog v-model="showTaskCreateDialog" max-width="900" persistent>
      <TaskCreateDialog
        @cancel="showTaskCreateDialog = false"
        @submit="handleCreateTask"
      />
    </v-dialog>

    <v-dialog v-model="showTaskEditDialog" max-width="900" persistent>
      <TaskEditDialog
        :task="selectedTask"
        @cancel="showTaskEditDialog = false"
        @submit="handleUpdateTask"
      />
    </v-dialog>

    <v-dialog v-model="showTaskViewDialog" max-width="900" persistent>
      <TaskViewDialog
        :task="selectedTask"
        @close="showTaskViewDialog = false"
      />
    </v-dialog>

    <v-dialog v-model="showTaskDeleteDialog" max-width="500" persistent>
      <TaskDeleteDialog
        :task="selectedTask"
        @cancel="showTaskDeleteDialog = false"
        @confirm="handleDeleteTask"
      />
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  import type { VDataTable } from 'vuetify/components'
  // Import services
  import type { CreateProjectInput, Project, UpdateProjectInput } from '../services/projects'

  import type { CreateTaskInput, Task, UpdateTaskInput } from '../services/tasks'
  import { computed, onMounted, ref } from 'vue'
  import { useNotifications } from '../composables/useNotifications'
  import { useRouter } from 'vue-router'
  import { createProject, deleteProject, getProjects, updateProject } from '../services/projects'
  import { createTask, deleteTask, getTasks, updateTask } from '../services/tasks'

  // Router for navigation
  const router = useRouter()

  // Reactive data
  const projects = ref<Project[]>([])
  const tasks = ref<Task[]>([])
  const projectLoading = ref(false)
  const taskLoading = ref(false)

  // Search and filter
  const projectSearch = ref('')
  const taskSearch = ref('')
  const taskProjectFilter = ref<string | undefined>(undefined)

  // Pagination
  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  // Dialog states
  const showProjectCreateDialog = ref(false)
  const showProjectEditDialog = ref(false)
  const showProjectViewDialog = ref(false)
  const showProjectDeleteDialog = ref(false)
  const showTaskCreateDialog = ref(false)
  const showTaskEditDialog = ref(false)
  const showTaskViewDialog = ref(false)
  const showTaskDeleteDialog = ref(false)

  // Selected items
  const selectedProject = ref<Project>({} as Project)
  const selectedTask = ref<Task>({} as Task)

  // Notifications
  const { notifySuccess, notifyError } = useNotifications()

  // Types for data table headers
  type DataTableHeaders = VDataTable['$props']['headers']

  // Table headers
  const projectHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Description', key: 'description', sortable: false },
    { title: 'Lead Staff', key: 'leadStaff', sortable: false },
    { title: 'Planned Dates', key: 'plannedDates', sortable: false },
    { title: 'Actual Dates', key: 'actualDates', sortable: false },
    { title: 'Status', key: 'status', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false, width: '120' },
  ]

  const taskHeaders: DataTableHeaders = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Project', key: 'project', sortable: false },
    { title: 'Parent Task', key: 'parentTask', sortable: false },
    { title: 'Planned Dates', key: 'plannedDates', sortable: false },
    { title: 'Actual Dates', key: 'actualDates', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false, width: '120' },
  ]

  // Computed properties for filtering
  const filteredProjects = computed(() => {
    if (!projectSearch.value) return projects.value
    const search = projectSearch.value.toLowerCase()
    return projects.value.filter(project =>
      project.name.toLowerCase().includes(search)
      || project.description?.toLowerCase().includes(search)
      || project.leadStaff?.firstName?.toLowerCase().includes(search)
      || project.leadStaff?.lastName?.toLowerCase().includes(search),
    )
  })

  const filteredTasks = computed(() => {
    let filtered = tasks.value

    // Filter by project if selected
    if (taskProjectFilter.value) {
      filtered = filtered.filter(task => task.projectId === taskProjectFilter.value)
    }

    // Filter by search term
    if (taskSearch.value) {
      const search = taskSearch.value.toLowerCase()
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(search)
        || task.description?.toLowerCase().includes(search)
        || task.project?.name?.toLowerCase().includes(search),
      )
    }

    return filtered
  })



  function formatDate (dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  function getProjectStatusColor (project: Project): string {
    const now = new Date()
    const startDate = project.actualStartDate ? new Date(project.actualStartDate) : null
    const endDate = project.actualEndDate ? new Date(project.actualEndDate) : null
    const plannedEndDate = project.plannedEndDate ? new Date(project.plannedEndDate) : null

    if (endDate) return 'success' // Completed
    if (startDate) return 'info' // In Progress
    if (plannedEndDate && now > plannedEndDate) return 'error' // Overdue
    return 'warning' // Not Started
  }

  function getProjectStatusText (project: Project): string {
    const now = new Date()
    const startDate = project.actualStartDate ? new Date(project.actualStartDate) : null
    const endDate = project.actualEndDate ? new Date(project.actualEndDate) : null
    const plannedEndDate = project.plannedEndDate ? new Date(project.plannedEndDate) : null

    if (endDate) return 'Completed'
    if (startDate) return 'In Progress'
    if (plannedEndDate && now > plannedEndDate) return 'Overdue'
    return 'Not Started'
  }

  // Data loading functions
  async function loadProjects () {
    projectLoading.value = true
    try {
      const { projects: projectData } = await getProjects()
      projects.value = projectData
    } catch (error) {
      console.error('Failed to load projects:', error)
      notifyError('Failed to load projects')
    } finally {
      projectLoading.value = false
    }
  }

  async function loadTasks () {
    taskLoading.value = true
    try {
      const { tasks: taskData } = await getTasks()
      tasks.value = taskData
    } catch (error) {
      console.error('Failed to load tasks:', error)
      notifyError('Failed to load tasks')
    } finally {
      taskLoading.value = false
    }
  }

  // Project dialog functions
  function openProjectCreateDialog () {
    showProjectCreateDialog.value = true
  }

  function openProjectEditDialog (project: Project) {
    selectedProject.value = project
    showProjectEditDialog.value = true
  }

  function openProjectViewDialog (project: Project) {
    selectedProject.value = project
    showProjectViewDialog.value = true
  }

  function openProjectDeleteDialog (project: Project) {
    selectedProject.value = project
    showProjectDeleteDialog.value = true
  }

  // Task dialog functions
  function openTaskCreateDialog () {
    showTaskCreateDialog.value = true
  }

  function openTaskEditDialog (task: Task) {
    selectedTask.value = task
    showTaskEditDialog.value = true
  }

  function openTaskViewDialog (task: Task) {
    selectedTask.value = task
    showTaskViewDialog.value = true
  }

  function openTaskDeleteDialog (task: Task) {
    selectedTask.value = task
    showTaskDeleteDialog.value = true
  }

  // Task management page navigation
  function openTaskManagementPage (task: Task) {
    router.push(`/task-management/${task.id}`)
  }

  // Project CRUD handlers
  async function handleCreateProject (projectData: CreateProjectInput) {
    try {
      await createProject(projectData)
      notifySuccess('Project created successfully')
      showProjectCreateDialog.value = false
      await loadProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
      notifyError(`Failed to create project: ${(error as Error).message}`)
    }
  }

  async function handleUpdateProject (projectData: UpdateProjectInput) {
    try {
      await updateProject(projectData)
      notifySuccess('Project updated successfully')
      showProjectEditDialog.value = false
      await loadProjects()
    } catch (error) {
      console.error('Failed to update project:', error)
      notifyError(`Failed to update project: ${(error as Error).message}`)
    }
  }

  async function handleDeleteProject (project: Project) {
    try {
      await deleteProject(project.id)
      notifySuccess('Project deleted successfully')
      showProjectDeleteDialog.value = false
      await loadProjects()
      await loadTasks() // Refresh tasks as they may be affected
    } catch (error) {
      console.error('Failed to delete project:', error)
      notifyError(`Failed to delete project: ${(error as Error).message}`)
    }
  }

  // Task CRUD handlers
  async function handleCreateTask (taskData: CreateTaskInput) {
    try {
      await createTask(taskData)
      notifySuccess('Task created successfully')
      showTaskCreateDialog.value = false
      await loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
      notifyError(`Failed to create task: ${(error as Error).message}`)
    }
  }

  async function handleUpdateTask (taskData: UpdateTaskInput) {
    try {
      await updateTask(taskData)
      notifySuccess('Task updated successfully')
      showTaskEditDialog.value = false
      await loadTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
      notifyError(`Failed to update task: ${(error as Error).message}`)
    }
  }

  async function handleDeleteTask (task: Task) {
    try {
      await deleteTask(task.id)
      notifySuccess('Task deleted successfully')
      showTaskDeleteDialog.value = false
      await loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
      notifyError(`Failed to delete task: ${(error as Error).message}`)
    }
  }

  // Initialize data when component mounts
  onMounted(async () => {
    await Promise.all([loadProjects(), loadTasks()])
  })
</script>
