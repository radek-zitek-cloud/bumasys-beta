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
    <v-dialog v-model="dialogs.create.isOpen" max-width="600" persistent>
      <UserCreateDialog
        @cancel="closeDialog('create')"
        @submit="handleCreateUser"
      />
    </v-dialog>

    <v-dialog v-model="dialogs.edit.isOpen" max-width="600" persistent>
      <UserEditDialog
        :user="selectedUser"
        @cancel="closeDialog('edit')"
        @submit="handleUpdateUser"
      />
    </v-dialog>

    <v-dialog v-model="dialogs.view.isOpen" max-width="500" persistent>
      <UserViewDialog
        :user="selectedUser"
        @close="closeDialog('view')"
      />
    </v-dialog>

    <v-dialog v-model="dialogs.delete.isOpen" max-width="400" persistent>
      <UserDeleteDialog
        :user="selectedUser"
        @cancel="closeDialog('delete')"
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

    <!-- Global notification system handles notifications -->
  </v-container>
</template>

<script setup lang="ts">
  import type { VDataTable } from 'vuetify/components'
  import type { CreateUserInput, UpdateUserInput, User } from '../services/users'
  import { computed, onMounted, ref } from 'vue'
  import { useUserDialogManager } from '../composables/useUserDialogManager'
  import { useUserManagement } from '../composables/useUserManagement'

  // Combined composables approach for cleaner, more maintainable code
  const userManagement = useUserManagement()
  const userDialogs = useUserDialogManager()

  // Destructure for easier access
  const { users, loading, processing, loadUsers, createUser, updateUser, deleteUser, getFullName } = userManagement
  const {
    dialogs,
    selectedUser,
    openCreateDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    closeDialog,
    handleDialogSuccess,
    handleDialogError,
  } = userDialogs

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

  // Additional state for the page (not managed by composables)
  const search = ref('')
  const itemsPerPage = ref(10)
  const itemsPerPageOptions = [
    { value: 5, title: '5' },
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: -1, title: 'All' },
  ]

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

  /** Handle user creation */
  async function handleCreateUser (userData: CreateUserInput) {
    try {
      await createUser(userData)
      handleDialogSuccess('create', 'create')
    } catch (error) {
      handleDialogError('create', 'create', error as Error)
    }
  }

  /** Handle user update */
  async function handleUpdateUser (userData: UpdateUserInput) {
    try {
      await updateUser(userData)
      handleDialogSuccess('edit', 'update')
    } catch (error) {
      handleDialogError('edit', 'update', error as Error)
    }
  }

  /** Handle user deletion */
  async function handleDeleteUser () {
    if (!selectedUser.value) return

    try {
      await deleteUser(selectedUser.value.id, selectedUser.value.email)
      handleDialogSuccess('delete', 'delete')
    } catch (error) {
      handleDialogError('delete', 'delete', error as Error)
    }
  }

  /** Initialize component */
  onMounted(() => {
    loadUsers()
  })
</script>
