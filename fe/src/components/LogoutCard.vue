<template>
  <v-card width="300">
    <v-card-title>Logout</v-card-title>
    <v-card-text>Are you sure you want to logout?</v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click="$emit('logout')">Logout</v-btn>
      <v-btn @click="$emit('cancel')">Cancel</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
/** Emits logout or cancel actions. */
  defineEmits<{
    (e: 'logout' | 'cancel'): void
  }>()
</script>
