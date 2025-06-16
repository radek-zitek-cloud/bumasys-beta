<!--
  @fileoverview Task Progress Create Dialog Component

  This component provides a form interface for creating task progress reports.
  It includes fields for progress percentage, date, and optional notes.
-->

<template>
  <v-card width="500">
    <form @submit.prevent="onSubmit">
      <v-card-title>
        <v-icon class="mr-2">mdi-chart-line</v-icon>
        Create Progress Report
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
              Select the staff member creating this report. If your email matches an eligible staff member, it will be auto-selected.
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
          Create Progress Report
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { CreateTaskProgressInput, Staff } from '../../services/tasks'
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
    created: [data: CreateTaskProgressInput]
  }>()

  /** Form data reactive object */
  const form = reactive({
    reportDate: new Date().toISOString().split('T')[0], // Default to today
    progressPercent: 0,
    notes: '',
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
   * Validates form data and emits created event with progress data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.reportDate || form.progressPercent === null || form.progressPercent === undefined) {
      return
    }

    processing.value = true
    try {
      // Create progress data
      const progressData: CreateTaskProgressInput = {
        taskId: props.taskId,
        reportDate: form.reportDate,
        progressPercent: form.progressPercent,
        notes: form.notes || undefined,
        creatorId: form.creatorId || undefined,
      }

      // Emit the progress data to parent for actual API call
      emit('created', progressData)
    } finally {
      processing.value = false
    }
  }

  /** Initialize component */
  onMounted(() => {
    presetCreator()
  })
</script>
