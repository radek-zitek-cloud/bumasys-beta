<template>
  <v-card width="400">
    <v-card-title>Profile</v-card-title>
    <v-card-text>
      <v-text-field v-model="email" label="Email" type="email" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="onSave">Save</v-btn>
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  /** User email address. */
  const email = ref('')

  const emit = defineEmits<{
    (e: 'save', email: string): void
    (e: 'cancel'): void
  }>()

  /** Emit the save event when the form is submitted. */
  function onSave () {
    emit('save', email.value)
  }
</script>
