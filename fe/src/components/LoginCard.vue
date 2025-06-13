<template>
  <v-card width="400">
    <v-card-title>Login</v-card-title>
    <v-card-text>
      <v-text-field v-model="email" label="Email" type="email" />
      <v-text-field v-model="password" label="Password" type="password" />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="onLogin">Login</v-btn>
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  /** Email address provided by the user. */
  const email = ref('')
  /** Password provided by the user. */
  const password = ref('')

  const emit = defineEmits<{
    (e: 'login', payload: { email: string, password: string }): void
    (e: 'cancel'): void
  }>()

  /** Emit the login event with the form data. */
  function onLogin () {
    emit('login', { email: email.value, password: password.value })
  }
</script>
