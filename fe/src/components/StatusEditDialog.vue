<!--
  @fileoverview Status edit dialog component
  
  This component provides a form dialog for editing existing status entries.
  It follows Vuetify Material Design patterns and includes proper validation.
-->

<template>
  <v-card width="400">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Status</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Status Name *"
              prepend-icon="mdi-flag"
              required
              :rules="nameRules"
              counter="50"
              maxlength="50"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Update Status</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { Status, UpdateStatusInput } from '../services/status'
  import { computed, reactive, watch } from 'vue'

  /** Define component props */
  const props = defineProps<{
    /** Status object to be edited */
    status: Status | null
  }>()

  /** Reactive form data */
  const form = reactive<UpdateStatusInput>({
    id: '',
    name: '',
  })

  /** Watch for changes to the status prop and update form */
  watch(
    () => props.status,
    (newStatus) => {
      if (newStatus) {
        form.id = newStatus.id
        form.name = newStatus.name
      }
    },
    { immediate: true }
  )

  /** Name validation rules */
  const nameRules = [
    (v: string) => !!v || 'Status name is required',
    (v: string) => v.length >= 2 || 'Status name must be at least 2 characters',
    (v: string) => v.length <= 50 || 'Status name must be less than 50 characters',
  ]

  /** Check if form is valid */
  const isFormValid = computed(() => {
    return (
      form.name
      && form.name.trim().length >= 2
      && form.name.trim().length <= 50
    )
  })

  /** Define component events */
  const emit = defineEmits<{
    /** Emitted when form is submitted with valid data */
    (e: 'submit', data: UpdateStatusInput): void
    /** Emitted when editing is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value) return

    const cleanData: UpdateStatusInput = {
      id: form.id,
      name: form.name.trim(),
    }

    emit('submit', cleanData)
  }
</script>