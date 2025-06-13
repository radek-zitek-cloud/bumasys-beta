<template>
  <v-card width="400">
    <form @submit.prevent="onReset">
      <v-card-title>Password Reset</v-card-title>
      <v-card-text>
        <v-text-field v-model="email" label="Email" type="email" autocomplete="email" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn type="submit" color="primary">Reset</v-btn>
        <v-btn type="button" @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  /** Email address for password reset. */
  const email = ref('')

  const emit = defineEmits<{
    (e: 'reset', email: string): void
    (e: 'cancel'): void
  }>()

  /** Emit the reset event with the provided email. */
  function onReset () {
    emit('reset', email.value)
  }
</script>
