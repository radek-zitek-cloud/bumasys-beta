<!--
  @fileoverview Task Status Report Edit Dialog Component

  This component provides a form interface for editing existing task status reports.
  It pre-fills the form with existing data and allows updating status information.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>
        <v-icon class="mr-2">mdi-flag</v-icon>
        Edit Status Report
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
          Update Status Report
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { TaskStatusReport, UpdateTaskStatusReportInput } from '../../services/tasks'
  import { reactive, ref, watch } from 'vue'

  /** Component props */
  const props = defineProps<{
    statusReport: TaskStatusReport
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    updated: [data: UpdateTaskStatusReportInput]
  }>()

  /** Form data reactive object */
  const form = reactive({
    reportDate: '',
    statusSummary: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Initialize form with existing data */
  watch(() => props.statusReport, report => {
    if (report) {
      form.reportDate = report.reportDate.split('T')[0] // Convert to YYYY-MM-DD format
      form.statusSummary = report.statusSummary || ''
    }
  }, { immediate: true })

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
   * Validates form data and emits updated event with status report data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.reportDate || !form.statusSummary) {
      return
    }

    processing.value = true
    try {
      // Create status report data
      const statusReportData: UpdateTaskStatusReportInput = {
        id: props.statusReport.id,
        reportDate: form.reportDate,
        statusSummary: form.statusSummary,
      }

      // Emit the status report data to parent for actual API call
      emit('updated', statusReportData)
    } finally {
      processing.value = false
    }
  }
</script>
