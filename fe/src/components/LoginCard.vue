<template>
  <v-card width="400">
    <form @submit.prevent="onLogin">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="email"
          aria-label="Email Address"
          autocomplete="email"
          label="Email"
          required
          type="email"
        />
        <v-text-field
          v-model="password"
          aria-label="Password"
          autocomplete="current-password"
          label="Password"
          required
          type="password"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" type="submit">Login</v-btn>
        <v-btn type="button" @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

/** Email address provided by the user. */
const email = ref("");
/** Password provided by the user. */
const password = ref("");

const emit = defineEmits<{
  (e: "login", payload: { email: string; password: string }): void;
  (e: "cancel"): void;
}>();

/** Emit the login event with the form data. */
function onLogin() {
  emit("login", { email: email.value, password: password.value });
}
</script>
