<template>
  <v-card width="400">
    <form @submit.prevent="onRegister">
      <v-card-title>Register</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="email"
          autocomplete="email"
          label="Email"
          type="email"
        />
        <v-text-field v-model="firstName" label="First Name" />
        <v-text-field v-model="lastName" label="Last Name" />
        <v-text-field v-model="note" label="Note" />
        <v-text-field
          v-model="password"
          autocomplete="new-password"
          label="Password"
          type="password"
        />
        <v-text-field
          v-model="confirm"
          autocomplete="new-password"
          :error="confirm !== '' && !match"
          :error-messages="
            confirm !== '' && !match ? 'Passwords do not match' : ''
          "
          label="Confirm Password"
          type="password"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="!match" type="submit">Register</v-btn>
        <v-btn type="button" @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  /** Email address for the new account. */
  const email = ref('')
  /** Optional first name for the account. */
  const firstName = ref('')
  /** Optional last name for the account. */
  const lastName = ref('')
  /** Optional user note. */
  const note = ref('')
  /** Password for the new account. */
  const password = ref('')
  /** Second password field to ensure they match. */
  const confirm = ref('')

  /** True when the password and confirmation match. */
  const match = computed(
    () => password.value !== '' && password.value === confirm.value,
  )

  const emit = defineEmits<{
    (
      e: 'register',
      payload: {
        email: string
        password: string
        firstName?: string
        lastName?: string
        note?: string
      },
    ): void
    (e: 'cancel'): void
  }>()

  /** Emit the register event when the user submits the form. */
  function onRegister () {
    emit('register', {
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      note: note.value,
    })
  }
</script>
