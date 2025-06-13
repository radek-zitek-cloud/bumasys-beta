<template>
  <v-card width="400">
    <form @submit.prevent="onChange">
      <v-card-title>Change Password</v-card-title>
      <v-card-text>
        <!-- Hidden username field for accessibility -->
        <v-text-field
          v-model="username"
          aria-hidden="true"
          autocomplete="username"
          label="Username"
          style="display: none"
          type="text"
        />
        <v-text-field
          v-model="oldPass"
          autocomplete="current-password"
          label="Old Password"
          type="password"
        />
        <v-text-field
          v-model="newPass"
          autocomplete="new-password"
          label="New Password"
          type="password"
        />
        <v-text-field
          v-model="confirm"
          autocomplete="new-password"
          :error="confirm !== '' && !match"
          :error-messages="
            confirm !== '' && !match ? 'Passwords do not match' : ''
          "
          label="Confirm New Password"
          type="password"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="!match" type="submit">Change</v-btn>
        <v-btn type="button" @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

/** Username field for accessibility (hidden). */
const username = ref("");
/** Current password. */
const oldPass = ref("");
/** New password to set. */
const newPass = ref("");
/** Confirmation field for the new password. */
const confirm = ref("");

/** True when the new password and confirmation match. */
const match = computed(
  () => newPass.value !== "" && newPass.value === confirm.value,
);

const emit = defineEmits<{
  (e: "change", payload: { oldPassword: string; newPassword: string }): void;
  (e: "cancel"): void;
}>();

/** Emit the change event with the old and new password. */
function onChange() {
  emit("change", { oldPassword: oldPass.value, newPassword: newPass.value });
}
</script>
