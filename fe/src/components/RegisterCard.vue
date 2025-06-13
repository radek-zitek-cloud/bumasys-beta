<template>
  <v-card width="400">
    <v-card-title>Register</v-card-title>
    <v-card-text>
      <v-text-field v-model="email" label="Email" type="email" />
      <v-text-field v-model="password" label="Password" type="password" />
      <v-text-field
        v-model="confirm"
        :error="confirm !== '' && !match"
        :error-messages="confirm !== '' && !match ? 'Passwords do not match' : ''"
        label="Confirm Password"
        type="password"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" :disabled="!match" @click="onRegister">Register</v-btn>
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  /** Email address for the new account. */
  const email = ref('')
  /** Password for the new account. */
  const password = ref('')
  /** Second password field to ensure they match. */
  const confirm = ref('')

  /** True when the password and confirmation match. */
  const match = computed(() => password.value !== '' && password.value === confirm.value)

  const emit = defineEmits<{
    (e: 'register', payload: { email: string, password: string }): void
    (e: 'cancel'): void
  }>()

  /** Emit the register event when the user submits the form. */
  function onRegister () {
    emit('register', { email: email.value, password: password.value })
  }
</script>
