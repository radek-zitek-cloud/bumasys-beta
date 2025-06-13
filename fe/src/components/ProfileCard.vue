<template>
  <v-card width="400">
    <form @submit.prevent="onSave">
      <v-card-title>Profile</v-card-title>
      <v-card-text>
        <v-text-field v-model="firstName" label="First Name" />
        <v-text-field v-model="lastName" label="Last Name" />
        <v-text-field v-model="note" label="Note" />
        <v-text-field v-model="email" label="Email" readonly type="email" />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" type="submit">Save</v-btn>
        <v-btn type="button" @click="$emit('cancel')">Cancel</v-btn>
      </v-card-actions>
    </form>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

/** Auth store to prefill user information. */
const auth = useAuthStore();

/** User email address. */
const email = ref(auth.user?.email ?? "");
/** User first name. */
const firstName = ref(auth.user?.firstName ?? "");
/** User last name. */
const lastName = ref(auth.user?.lastName ?? "");
/** Optional user note. */
const note = ref(auth.user?.note ?? "");

const emit = defineEmits<{
  (
    e: "save",
    payload: { firstName: string; lastName: string; note: string },
  ): void;
  (e: "cancel"): void;
}>();

/** Emit the save event with updated profile fields. */
function onSave() {
  emit("save", {
    firstName: firstName.value,
    lastName: lastName.value,
    note: note.value,
  });
}
</script>
