<template>
  <v-container fluid>
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 mb-2">User Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage system users, their roles, and permissions
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        @click="openCreateDialog"
      >
        Create User
      </v-btn>
    </div>

    <!-- Data Table -->
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <span>Users ({{ filteredUsers.length }})</span>
          <v-text-field
            v-model="search"
            clearable
            density="compact"
            label="Search users..."
            prepend-inner-icon="mdi-magnify"
            style="max-width: 300px"
            variant="outlined"
          />
        </div>
      </v-card-title>

      <v-data-table
        class="elevation-0"
        :headers="headers"
        item-key="id"
        :items="filteredUsers"
        :items-per-page="itemsPerPage"
        :items-per-page-options="itemsPerPageOptions"
        :loading="loading"
        :search="search"
      >
        <!-- Custom Name Column -->
        <template #item.name="{ item }">
          <div>
            <div class="font-weight-medium">
              {{ getFullName(item) || 'Unnamed User' }}
            </div>
            <div class="text-caption text-medium-emphasis">
              ID: {{ item.id }}
            </div>
          </div>
        </template>

        <!-- Custom Email Column -->
        <template #item.email="{ item }">
          <v-chip
            prepend-icon="mdi-email"
            size="small"
            variant="tonal"
          >
            {{ item.email }}
          </v-chip>
        </template>

        <!-- Custom Note Column -->
        <template #item.note="{ item }">
          <span v-if="item.note" class="text-body-2">
            {{ item.note.length > 50 ? item.note.substring(0, 50) + '...' : item.note }}
          </span>
          <span v-else class="text-caption text-medium-emphasis">No note</span>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              @click="openViewDialog(item)"
            >
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top">View Details</v-tooltip>
            </v-btn>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              @click="openEditDialog(item)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top">Edit User</v-tooltip>
            </v-btn>
            <v-btn
              color="error"
              icon="mdi-delete"
              size="small"
              variant="text"
              @click="openDeleteDialog(item)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">Delete User</v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialogs -->
    <v-dialog v-model="showCreateDialog" max-width="600" persistent>
      <UserCreateDialog
        @cancel="showCreateDialog = false"
        @submit="handleCreateUser"
      />
    </v-dialog>

    <v-dialog v-model="showEditDialog" max-width="600" persistent>
      <UserEditDialog
        :user="selectedUser"
        @cancel="showEditDialog = false"
        @submit="handleUpdateUser"
      />
    </v-dialog>

    <v-dialog v-model="showViewDialog" max-width="500" persistent>
      <UserViewDialog
        :user="selectedUser"
        @close="showViewDialog = false"
      />
    </v-dialog>

    <v-dialog v-model="showDeleteDialog" max-width="400" persistent>
      <UserDeleteDialog
        :user="selectedUser"
        @cancel="showDeleteDialog = false"
        @confirm="handleDeleteUser"
      />
    </v-dialog>

    <!-- Loading Overlay -->
    <v-overlay v-model="processing" class="d-flex align-center justify-center" persistent>
      <v-card class="pa-4">
        <v-progress-circular class="mr-3" indeterminate size="32" />
        Processing...
      </v-card>
    </v-overlay>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom"
      timeout="4000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import type { VDataTable } from 'vuetify/components'
  import type { CreateUserInput, UpdateUserInput, User } from '../services/users'
  import { computed, onMounted, reactive, ref } from 'vue'
  import * as userService from '../services/users'

  /** Data table configuration */
  type DataTableHeaders = VDataTable['$props']['headers']

  const headers: DataTableHeaders = [
    {
      title: 'Name',
      key: 'name',
      sortable: true,
    },
    {
      title: 'Email',
      key: 'email',
      sortable: true,
    },
    {
      title: 'Note',
      key: 'note',
      sortable: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      sortable: false,
      width: '150px',
    },
  ]

  /** Reactive data */
  const users = ref<User[]>([])
  const selectedUser = ref<User | null>(null)
  const search = ref('')
  const loading = ref(false)
  const processing = ref(false)
  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

  /** Dialog visibility flags */
  const showCreateDialog = ref(false)
  const showEditDialog = ref(false)
  const showViewDialog = ref(false)
  const showDeleteDialog = ref(false)

  /** Snackbar for notifications */
  const snackbar = reactive({
    show: false,
    message: '',
    color: 'success' as 'success' | 'error' | 'warning' | 'info',
  })

  /** Computed filtered users for the table */
  const filteredUsers = computed(() => {
    if (!search.value) return users.value

    const searchTerm = search.value.toLowerCase()
    return users.value.filter(user =>
      user.email.toLowerCase().includes(searchTerm)
      || user.firstName?.toLowerCase().includes(searchTerm)
      || user.lastName?.toLowerCase().includes(searchTerm)
      || user.note?.toLowerCase().includes(searchTerm),
    )
  })

  /** Helper function to get full name */
  function getFullName (user: User): string {
    const firstName = user.firstName?.trim() || ''
    const lastName = user.lastName?.trim() || ''
    return [firstName, lastName].filter(Boolean).join(' ')
  }

  /** Show notification */
  function notify (message: string, color: typeof snackbar.color = 'success') {
    snackbar.message = message
    snackbar.color = color
    snackbar.show = true
  }

  /** Load users from the API */
  async function loadUsers () {
    try {
      loading.value = true
      const response = await userService.getUsers()
      users.value = response.users
    } catch (error) {
      console.error('Failed to load users:', error)
      notify(
        error instanceof Error ? error.message : 'Failed to load users',
        'error',
      )
    } finally {
      loading.value = false
    }
  }

  /** Open create user dialog */
  function openCreateDialog () {
    showCreateDialog.value = true
  }

  /** Open view user dialog */
  function openViewDialog (user: User) {
    selectedUser.value = user
    showViewDialog.value = true
  }

  /** Open edit user dialog */
  function openEditDialog (user: User) {
    selectedUser.value = user
    showEditDialog.value = true
  }

  /** Open delete confirmation dialog */
  function openDeleteDialog (user: User) {
    selectedUser.value = user
    showDeleteDialog.value = true
  }

  /** Handle user creation */
  async function handleCreateUser (userData: CreateUserInput) {
    try {
      processing.value = true
      await userService.createUser(userData)
      notify('User created successfully')
      showCreateDialog.value = false
      await loadUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to create user:', error)
      notify(
        error instanceof Error ? error.message : 'Failed to create user',
        'error',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle user update */
  async function handleUpdateUser (userData: UpdateUserInput) {
    try {
      processing.value = true
      await userService.updateUser(userData)
      notify('User updated successfully')
      showEditDialog.value = false
      await loadUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to update user:', error)
      notify(
        error instanceof Error ? error.message : 'Failed to update user',
        'error',
      )
    } finally {
      processing.value = false
    }
  }

  /** Handle user deletion */
  async function handleDeleteUser () {
    if (!selectedUser.value) return

    try {
      processing.value = true
      await userService.deleteUser(selectedUser.value.id)
      notify('User deleted successfully')
      showDeleteDialog.value = false
      await loadUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error)
      notify(
        error instanceof Error ? error.message : 'Failed to delete user',
        'error',
      )
    } finally {
      processing.value = false
    }
  }

  /** Initialize component */
  onMounted(() => {
    loadUsers()
  })
</script>
