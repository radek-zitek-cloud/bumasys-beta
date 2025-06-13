<template>
  <v-footer app height="40">
    <a
      v-for="item in items"
      :key="item.title"
      class="d-inline-block mx-2 social-link"
      :href="item.href"
      rel="noopener noreferrer"
      target="_blank"
      :title="item.title"
    >
      <v-icon :icon="item.icon" :size="item.icon === '$vuetify' ? 24 : 16" />
    </a>

    <div
      class="text-caption text-disabled"
      style="position: absolute; right: 16px"
    >
      <span :class="ready ? 'text-success' : 'text-error'">
        Backend: {{ ready ? "ready" : "offline" }}
      </span>
      <template v-if="userSummary"
        >&nbsp;|&nbsp;Logged in as {{ userSummary }}</template
      >
      &nbsp;|&nbsp;© {{ new Date().getFullYear() }}
      <span class="d-none d-sm-inline-block">Radek Zitek</span>
    </div>
  </v-footer>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";

const items = [
  {
    title: "Vuetify Documentation",
    icon: `$vuetify`,
    href: "https://vuetifyjs.com/",
  },
];

/** Indicates whether the backend server is ready. */
const ready = ref<boolean | null>(null);

/** Authentication store for user details */
const auth = useAuthStore();
const { user } = storeToRefs(auth);

/** Display name and email for authenticated user */
const userSummary = computed(() => {
  if (!user.value) return "";
  const name = [user.value.firstName, user.value.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name ? `${name} (${user.value.email})` : user.value.email;
});

/**
 * Query the backend health endpoint and update the readiness state.
 */
onMounted(async () => {
  try {
    const res = await fetch("/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "query{ health }" }),
    });
    const json = await res.json();
    ready.value = json?.data?.health === true;
  } catch {
    ready.value = false;
  }
});
</script>

<style scoped lang="sass">
.social-link :deep(.v-icon)
  color: rgba(var(--v-theme-on-background), var(--v-disabled-opacity))
  text-decoration: none
  transition: .2s ease-in-out

  &:hover
    color: rgba(25, 118, 210, 1)
</style>
