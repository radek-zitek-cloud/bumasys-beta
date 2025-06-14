<!--
  @fileoverview Priority creation dialog component
  
  This component provides a form dialog for creating new priority entries.
  It follows Vuetify Material Design patterns and includes proper validation.
-->

<template>
  <v-card width="400">
    <form @submit.prevent="onSubmit">
      <v-card-title>Create New Priority</v-card-title>
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
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Create Priority</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { CreatePriorityInput } from '../services/priority'
  import { computed, reactive } from 'vue'

  /** Reactive form data */
  const form = reactive<CreatePriorityInput>({
    name: '',
  })

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
    (e: 'submit', data: CreatePriorityInput): void
    /** Emitted when creation is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value) return

    const cleanData: CreatePriorityInput = {
      name: form.name.trim(),
    }

    emit('submit', cleanData)
  }
</script>