<!--
  @fileoverview Priority edit dialog component
  
  This component provides a form dialog for editing existing priority entries.
  It follows Vuetify Material Design patterns and includes proper validation.
-->

<template>
  <v-card width="400">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Priority</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Priority Name *"
              prepend-icon="mdi-priority-high"
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
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Update Priority</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { Priority, UpdatePriorityInput } from '../services/priority'
  import { computed, reactive, watch } from 'vue'

  /** Define component props */
  const props = defineProps<{
    /** Priority object to be edited */
    priority: Priority | null
  }>()

  /** Reactive form data */
  const form = reactive<UpdatePriorityInput>({
    id: '',
    name: '',
  })

  /** Watch for changes to the priority prop and update form */
  watch(
    () => props.priority,
    (newPriority) => {
      if (newPriority) {
        form.id = newPriority.id
        form.name = newPriority.name
      }
    },
    { immediate: true }
  )

  /** Name validation rules */
  const nameRules = [
    (v: string) => !!v || 'Priority name is required',
    (v: string) => v.length >= 2 || 'Priority name must be at least 2 characters',
    (v: string) => v.length <= 50 || 'Priority name must be less than 50 characters',
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
    (e: 'submit', data: UpdatePriorityInput): void
    /** Emitted when editing is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value) return

    const cleanData: UpdatePriorityInput = {
      id: form.id,
      name: form.name.trim(),
    }

    emit('submit', cleanData)
  }
</script>