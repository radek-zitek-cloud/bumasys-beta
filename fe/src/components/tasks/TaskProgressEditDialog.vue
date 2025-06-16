<!--
  @fileoverview Task Progress Edit Dialog Component

  This component provides a form interface for editing existing task progress reports.
  It pre-fills the form with existing data and allows updating progress information.
-->

<template>
  <v-card width="500">
    <form @submit.prevent="onSubmit">
      <v-card-title>
        <v-icon class="mr-2">mdi-chart-line</v-icon>
        Edit Progress Report
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

          <!-- Progress Percentage -->
          <v-col cols="12">
            <v-text-field
              v-model.number="form.progressPercent"
              label="Progress Percentage *"
              max="100"
              min="0"
              prepend-icon="mdi-percent"
              required
              :rules="progressRules"
              suffix="%"
              type="number"
              variant="outlined"
            />
          </v-col>

          <!-- Progress Slider for Visual Feedback -->
          <v-col cols="12">
            <v-slider
              v-model="form.progressPercent"
              color="primary"
              :max="100"
              :min="0"
              :step="1"
              thumb-label="always"
              track-color="grey-lighten-2"
            >
              <template #append>
                <v-chip
                  :color="getProgressColor(form.progressPercent)"
                  label
                  size="small"
                >
                  {{ form.progressPercent }}%
                </v-chip>
              </template>
            </v-slider>
          </v-col>

          <!-- Notes -->
          <v-col cols="12">
            <v-textarea
              v-model="form.notes"
              label="Notes"
              placeholder="Optional notes about this progress update..."
              prepend-icon="mdi-note-text"
              rows="3"
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
              Select the staff member who created this report.
            </div>
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
          Update Progress Report
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { TaskProgress, UpdateTaskProgressInput, Staff } from '../../services/tasks'
  import { computed, reactive, ref, watch } from 'vue'

  /** Component props */
  const props = defineProps<{
    progressReport: TaskProgress
    eligibleStaff: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    updated: [data: UpdateTaskProgressInput]
  }>()

  /** Form data reactive object */
  const form = reactive({
    reportDate: '',
    progressPercent: 0,
    notes: '',
    creatorId: '' as string | null,
  })

  /** Staff options with display names */
  const staffOptions = computed(() => 
    props.eligibleStaff.map(staff => ({
      ...staff,
      displayName: `${staff.firstName} ${staff.lastName} (${staff.email})`,
    }))
  )

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Initialize form with existing data */
  watch(() => props.progressReport, report => {
    if (report) {
      form.reportDate = report.reportDate.split('T')[0] // Convert to YYYY-MM-DD format
      form.progressPercent = report.progressPercent
      form.notes = report.notes || ''
      form.creatorId = report.creatorId || null
    }
  }, { immediate: true })

  /** Validation rules */
  const dateRules = [
    (v: string) => !!v || 'Report date is required',
  ]

  const progressRules = [
    (v: number) => v !== null && v !== undefined || 'Progress percentage is required',
    (v: number) => v >= 0 || 'Progress cannot be negative',
    (v: number) => v <= 100 || 'Progress cannot exceed 100%',
  ]

  /**
   * Get color based on progress percentage
   */
  function getProgressColor (progress: number): string {
    if (progress < 25) return 'error'
    if (progress < 50) return 'warning'
    if (progress < 75) return 'info'
    if (progress < 100) return 'success'
    return 'primary'
  }

  /**
   * Handle form submission
   * Validates form data and emits updated event with progress data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.reportDate || form.progressPercent === null || form.progressPercent === undefined) {
      return
    }

    processing.value = true
    try {
      // Create progress data
      const progressData: UpdateTaskProgressInput = {
        id: props.progressReport.id,
        reportDate: form.reportDate,
        progressPercent: form.progressPercent,
        notes: form.notes || undefined,
        creatorId: form.creatorId || undefined,
      }

      // Emit the progress data to parent for actual API call
      emit('updated', progressData)
    } finally {
      processing.value = false
    }
  }
</script>
