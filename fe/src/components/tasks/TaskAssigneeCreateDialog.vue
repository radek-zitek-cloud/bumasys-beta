<!--
  @fileoverview Task Assignee Create Dialog Component

  This component provides a form interface for adding staff members to tasks.
  It includes dropdown selection for available staff members.
-->

<template>
  <v-card width="500">
    <form @submit.prevent="onSubmit">
      <v-card-title>Add Assignee to Task</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="form.staffId"
              item-title="title"
              item-value="value"
              :items="staffOptions"
              label="Staff Member *"
              prepend-icon="mdi-account"
              required
              :rules="staffRules"
            />
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
          Add Assignee
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Staff } from '../../services/tasks'
  import { computed, reactive, ref } from 'vue'

  /** Component props */
  const props = defineProps<{
    availableStaff: Staff[]
    currentAssignees: Staff[]
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    created: [staffId: string]
  }>()

  /** Form data reactive object */
  const form = reactive({
    staffId: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Staff options filtered to exclude current assignees */
  const staffOptions = computed(() => {
    const currentAssigneeIds = new Set(props.currentAssignees.map(assignee => assignee.id))
    return props.availableStaff
      .filter(staff => !currentAssigneeIds.has(staff.id))
      .map(staff => ({
        title: `${staff.firstName} ${staff.lastName} - ${staff.role} (${staff.department?.name || 'No Department'})`,
        value: staff.id,
      }))
  })

  /** Validation rules */
  const staffRules = [
    (v: string) => !!v || 'Staff member is required',
  ]

  /**
   * Handle form submission
   * Validates form data and emits created event with staff ID
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.staffId) {
      return
    }

    processing.value = true
    try {
      // Emit the staff ID to parent for actual API call
      emit('created', form.staffId)
    } finally {
      processing.value = false
    }
  }
</script>
