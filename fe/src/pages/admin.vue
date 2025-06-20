<!--
  @fileoverview Administration Page

  This page provides administrative tools and information including:
  - Debug information about authentication state
  - Backend configuration display
  - Database tag switching functionality
  - Database backup functionality

  Access is restricted to authenticated users only.
-->

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-black mb-6">Administration</h1>
        <v-alert
          v-if="!auth.loggedIn"
          color="warning"
          icon="mdi-shield-lock"
          prominent
          text="You must be logged in to access administrative functions."
          type="warning"
        />
      </v-col>
    </v-row>

    <!-- Administrative functions - only show if authenticated -->
    <template v-if="auth.loggedIn">
      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-bug</v-icon>
              Debug Information
            </v-card-title>
            <v-card-text>
              Current authentication state and debugging information.
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="showDebugInfo = true">
                View Debug Info
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-cog</v-icon>
              Backend Configuration
            </v-card-title>
            <v-card-text>
              View current backend configuration and settings.
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="showConfig = true">
                View Configuration
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-database-sync</v-icon>
              Database Management
            </v-card-title>
            <v-card-text>
              Switch between different database tags for data isolation.
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="showDatabaseSwitch = true">
                Switch Database Tag
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-icon class="mr-2">mdi-database-export</v-icon>
              Database Backup
            </v-card-title>
            <v-card-text>
              Create a backup copy of the current database.
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                :loading="backupLoading"
                @click="createBackup"
              >
                Create Backup
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Debug Info Dialog -->
    <v-dialog v-model="showDebugInfo" max-width="600" persistent>
      <DebugInfoCard @close="showDebugInfo = false" />
    </v-dialog>

    <!-- Config Display Dialog -->
    <v-dialog v-model="showConfig" max-width="600" persistent>
      <ConfigDisplayCard @close="showConfig = false" />
    </v-dialog>

    <!-- Database Switch Dialog -->
    <v-dialog v-model="showDatabaseSwitch" max-width="500" persistent>
      <DatabaseTagSwitchCard
        @cancel="showDatabaseSwitch = false"
        @switch="handleDatabaseSwitch"
      />
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
/**
 * @fileoverview Administration Page Script
 *
 * This script handles the administration page functionality including:
 * - Debug information display
 * - Backend configuration viewing
 * - Database tag switching
 * - Database backup operations
 */

  import { ref } from 'vue'
  import DatabaseTagSwitchCard from '../components/auth/DatabaseTagSwitchCard.vue'
  import ConfigDisplayCard from '../components/debug/ConfigDisplayCard.vue'
  import DebugInfoCard from '../components/debug/DebugInfoCard.vue'
  import { useLoading } from '../composables/useLoading'
  import { useLogger } from '../composables/useLogger'
  import { useNotifications } from '../composables/useNotifications'
  import { backupDatabase } from '../services/backup'
  import { useAuthStore } from '../stores/auth'

  const { logInfo, logError } = useLogger()
  const { notifySuccess, notifyError } = useNotifications()
  const { loading: backupLoading, withLoading: withBackupLoading } = useLoading('backup')
  const auth = useAuthStore()

  // Dialog visibility state
  const showDebugInfo = ref(false)
  const showConfig = ref(false)
  const showDatabaseSwitch = ref(false)

  // Note: Backup loading state now managed by useLoading composable

  /**
   * Handle database tag switch.
   * @param tag - The database tag to switch to
   */
  async function handleDatabaseSwitch (tag: string) {
    try {
      logInfo('Switching database tag', { tag })
      notifySuccess(`Successfully switched to database tag: ${tag}`)
      logInfo('Database tag switch completed successfully', { tag })
    } catch (error) {
      logError('Database tag switch failed', error)
      notifyError((error as Error).message)
    } finally {
      showDatabaseSwitch.value = false
    }
  }

  /**
   * Create a backup of the current database.
   */
  async function createBackup() {
    return withBackupLoading(async () => {
      try {
        logInfo('Creating database backup')
        const backupPath = await backupDatabase()
        notifySuccess(`Database backup created successfully: ${backupPath}`)
        logInfo('Database backup completed successfully', { backupPath })
      } catch (error) {
        logError('Database backup failed', error)
        notifyError((error as Error).message)
        throw error
      }
    })
  }
</script>

<style scoped>
.v-card {
  height: 100%;
}

.v-card-title {
  font-weight: 600;
}

.v-card-text {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>
