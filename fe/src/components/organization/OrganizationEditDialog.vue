<!--
  @fileoverview Organization Edit Dialog Component

  This component provides a form interface for editing existing organizations.
  It follows the same design patterns as UserEditDialog.vue with proper
  validation and error handling.
-->

<template>
  <v-card width="600">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Organization</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Organization Name *"
              prepend-icon="mdi-office-building"
              required
              :rules="nameRules"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description"
              prepend-icon="mdi-text-box"
              rows="3"
              :rules="descriptionRules"
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
          Update Organization
        </v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Organization, UpdateOrganizationInput } from '../../services/organizations'
  import { reactive, ref, watch } from 'vue'

  /** Component props */
  const props = defineProps<{
    organization: Organization
  }>()

  /** Component events */
  const emit = defineEmits<{
    cancel: []
    updated: [organization: UpdateOrganizationInput]
  }>()

  /** Form data reactive object */
  const form = reactive<Omit<UpdateOrganizationInput, 'id'>>({
    name: '',
    description: '',
  })

  /** Processing state for the submit button */
  const processing = ref(false)

  /** Validation rules for organization name */
  const nameRules = [
    (v: string) => !!v || 'Organization name is required',
    (v: string) => (v && v.length >= 2) || 'Name must be at least 2 characters',
    (v: string) => (v && v.length <= 100) || 'Name must be less than 100 characters',
  ]

  /** Validation rules for description */
  const descriptionRules = [
    (v: string) => !v || v.length <= 500 || 'Description must be less than 500 characters',
  ]

  /** Watch for changes to the organization prop and update form */
  watch(
    () => props.organization,
    newOrganization => {
      if (newOrganization) {
        form.name = newOrganization.name
        form.description = newOrganization.description || ''
      }
    },
    { immediate: true },
  )

  /**
   * Handle form submission
   * Validates form data and emits updated event with organization data
   */
  async function onSubmit () {
    // Validate required fields
    if (!form.name) {
      return
    }

    processing.value = true
    try {
      // Emit the organization data to parent for actual API call
      emit('updated', {
        id: props.organization.id,
        ...form,
      })
    } finally {
      processing.value = false
    }
  }
</script>
