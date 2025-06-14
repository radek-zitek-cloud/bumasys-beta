<!--
  @fileoverview Status creation dialog component

  This component provides a form dialog for creating new status entries.
  It follows Vuetify Material Design patterns and includes proper validation.
-->

<template>
  <v-card width="400">
    <form @submit.prevent="onSubmit">
      <v-card-title>Create New Status</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="form.name"
              counter="50"
              label="Status Name *"
              maxlength="50"
              prepend-icon="mdi-flag"
              required
              :rules="nameRules"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="$emit('cancel')">Cancel</v-btn>
        <v-btn color="primary" :disabled="!isFormValid" type="submit">Create Status</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import type { CreateStatusInput } from '../services/status'
  import { computed, reactive } from 'vue'

  /** Reactive form data */
  const form = reactive<CreateStatusInput>({
    name: '',
  })

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
    (e: 'submit', data: CreateStatusInput): void
    /** Emitted when creation is cancelled */
    (e: 'cancel'): void
  }>()

  /** Handle form submission */
  function onSubmit () {
    if (!isFormValid.value) return

    const cleanData: CreateStatusInput = {
      name: form.name.trim(),
    }

    emit('submit', cleanData)
  }
</script>
