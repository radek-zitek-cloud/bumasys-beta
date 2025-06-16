<!--
  @fileoverview Task Status Report Create Dialog Component

  This component provides a form interface for creating task status reports.
  It includes fields for report date and status summary.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>
        <v-icon class="mr-2">mdi-flag</v-icon>
        Create Status Report
      </v-card-title>
      <v-card-text>
        <v-row>
          <!-- Report Date -->
          <v-col cols="12">
            <v-text-field
              v-model="form.reportDate"
              label="Report Date *"
              prepend-icon="mdi-calendar"
              required
              :rules="dateRules"
              type="date"
              variant="outlined"
            />
          </v-col>

          <!-- Status Summary -->
          <v-col cols="12">
            <v-textarea
              v-model="form.statusSummary"
              label="Status Summary *"
              placeholder="Describe the current status, progress, blockers, and next steps..."
              prepend-icon="mdi-text-box"
              required
              rows="4"
              :rules="summaryRules"
              variant="outlined"
            />
          </v-col>

          <!-- Creator -->
          <v-col cols="12">
            <v-select
              v-model="form.creatorId"
              clearable
              item-title="displayName"
              item-value="id"
              :items="staffOptions"
              label="Creator"
              prepend-icon="mdi-account-supervisor"
              variant="outlined"
            />
            <div class="text-caption text-medium-emphasis mt-1">
              Select the staff member creating this report. If your email matches an eligible staff member, it will be auto-selected.
            </div>
          </v-col>

          <!-- Info Alert -->
          <v-col cols="12">
            <v-alert
              icon="mdi-information"
              type="info"
              variant="tonal"
            >
              Status reports help communicate task progress and current situation to stakeholders.
              Be clear and concise about current status, any issues, and planned next steps.
            </v-alert>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" variant="text" @click="emit('cancel')">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="processing"
          type="submit"
          variant="flat"
        >
          Create Status Report
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { CreateTaskStatusReportInput, Staff } from '../../services/tasks'
  import { reactive, ref, computed, onMounted } from 'vue'
  import { useAuthStore } from '../../stores/auth'

  /** Component props */
  const props = defineProps<{
    taskId: string
    eligibleStaff?: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    created: [data: CreateTaskStatusReportInput]
  }>()

  /** Form data reactive object */
  const form = reactive({
    reportDate: new Date().toISOString().split('T')[0], // Default to today
    statusSummary: '',
    creatorId: '' as string,
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Auth store for getting current user */
  const authStore = useAuthStore()

  /** Available staff members formatted for dropdown */
  const staffOptions = computed(() => {
    if (!props.eligibleStaff) return []
    return props.eligibleStaff.map(staff => ({
      id: staff.id,
      displayName: `${staff.firstName} ${staff.lastName} (${staff.email})`,
      email: staff.email
    }))
  })

  /** Preset creator based on logged-in user email */
  function presetCreator () {
    if (!authStore.user?.email || !props.eligibleStaff) return
    
    const matchingStaff = props.eligibleStaff.find(staff => 
      staff.email.toLowerCase() === authStore.user?.email.toLowerCase()
    )
    
    if (matchingStaff) {
      form.creatorId = matchingStaff.id
    }
  }

  /** Validation rules */
  const dateRules = [
    (v: string) => !!v || 'Report date is required',
  ]

  const summaryRules = [
    (v: string) => !!v || 'Status summary is required',
    (v: string) => (v && v.length >= 10) || 'Status summary must be at least 10 characters',
    (v: string) => (v && v.length <= 1000) || 'Status summary must be less than 1000 characters',
  ]

  /**
   * Handle form submission
   * Validates form data and emits created event with status report data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.reportDate || !form.statusSummary) {
      return
    }

    processing.value = true
    try {
      // Create status report data
      const statusReportData: CreateTaskStatusReportInput = {
        taskId: props.taskId,
        reportDate: form.reportDate,
        statusSummary: form.statusSummary,
        creatorId: form.creatorId || undefined,
      }

      // Emit the status report data to parent for actual API call
      emit('created', statusReportData)
    } finally {
      processing.value = false
    }
  }

  /** Initialize component */
  onMounted(() => {
    presetCreator()
  })
</script>
