<!--
  @fileoverview Complexity edit dialog component
  
  This component provides a form dialog for editing existing complexity entries.
  It follows Vuetify Material Design patterns and includes proper validation.
-->

<template>
  <v-card width="400">
    <form @submit.prevent="onSubmit">
      <v-card-title>Edit Complexity</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              label="Complexity Name *"
              prepend-icon="mdi-chart-bar"
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
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Update Complexity</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { Complexity, UpdateComplexityInput } from '../services/complexity'
  import { computed, reactive, watch } from 'vue'

  /** Define component props */
  const props = defineProps<{
    /** Complexity object to be edited */
    complexity: Complexity | null
  }>()

  /** Reactive form data */
  const form = reactive<UpdateComplexityInput>({
    id: '',
    name: '',
  })

  /** Watch for changes to the complexity prop and update form */
  watch(
    () => props.complexity,
    (newComplexity) => {
      if (newComplexity) {
        form.id = newComplexity.id
        form.name = newComplexity.name
      }
    },
    { immediate: true }
  )

  /** Name validation rules */
  const nameRules = [
    (v: string) => !!v || 'Complexity name is required',
    (v: string) => v.length >= 2 || 'Complexity name must be at least 2 characters',
    (v: string) => v.length <= 50 || 'Complexity name must be less than 50 characters',
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
    (e: 'submit', data: UpdateComplexityInput): void
    /** Emitted when editing is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value) return

    const cleanData: UpdateComplexityInput = {
      id: form.id,
      name: form.name.trim(),
    }

    emit('submit', cleanData)
  }
</script>