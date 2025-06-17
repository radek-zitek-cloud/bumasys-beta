<!--
  @fileoverview Home Page Component

  This is the main landing page for the Fulcrum application. It provides
  an overview of the application's purpose and serves as the welcome screen
  for both authenticated and unauthenticated users.

  Features:
  - Centered card layout with application branding
  - Clear description of application purpose and capabilities
  - Responsive design that works on all screen sizes
  - Consistent with overall application design theme

  The page serves as the entry point for new users and provides context
  about what the application does for departmental management.

  Usage:
  This page is automatically displayed at the root route ('/') and requires
  no props or configuration.
-->

<template>
  <v-container fill-height>
    <v-row align="center" class="fill-height" justify="center">
      <v-col cols="12" lg="8" md="10" sm="12">
        <!-- Welcome Section -->
        <div class="text-center mb-8">
          <v-card class="mx-auto" :elevation="24" max-width="500">
            <v-img
              alt="Fulcrum application logo"
              cover
              height="200"
              src="@/assets/fulcrum-mid.png"
            />
            <v-card-title class="text-h4 text-center">
              <span v-if="auth.loggedIn">Welcome back, {{ userDisplayName }}!</span>
              <span v-else>Welcome to Fulcrum</span>
            </v-card-title>
            <v-card-subtitle class="text-h6 text-center pa-4">
              Welcome to Fulcrum!
            </v-card-subtitle>
            <v-card-text class="text-body-1 pa-6">
              <p class="mb-4">
                Fulcrum is a full-stack web application designed to serve as the central coordination hub for
                departmental management. It provides an integrated environment for handling human resources,
                performance tracking, budget oversight, and workload planning—turning disjointed spreadsheets
                and tools into a single, consistent source of operational truth.
              </p>
              <p v-if="!auth.loggedIn" class="text-medium-emphasis">
                Sign in to access your departmental management dashboard and start organizing your workflow.
              </p>
            </v-card-text>
          </v-card>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
/**
 * @fileoverview Home Page Script
 *
 * Enhanced home page with authentication-aware content and quick actions.
 * Provides personalized welcome messages for authenticated users and
 * convenient access to common application features.
 *
 * Features:
 * - Personalized welcome message for authenticated users
 * - Quick action buttons for common tasks
 * - System statistics overview
 * - Responsive design with proper accessibility
 *
 * TODO: Add application statistics from real data
 * TODO: Implement user onboarding flow for new users
 * TODO: Add recent activity summary
 * TODO: Add customizable dashboard widgets
 */

  import { computed, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  /**
   * Interface for quick action items
   */
  interface QuickAction {
    title: string
    description: string
    icon: string
    to: string
    disabled?: boolean
  }

  /**
   * Interface for system statistics
   */
  interface SystemStat {
    label: string
    value: string | number
    icon: string
    color: string
  }

  // Authentication store for user state
  const auth = useAuthStore()

  // Control visibility of statistics section
  const showStats = ref(true)

  /**
   * Computed property for user display name
   */
  const userDisplayName = computed(() => {
    if (!auth.user) return 'User'
    const { firstName, lastName } = auth.user
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    }
    if (firstName) return firstName
    if (lastName) return lastName
    return auth.user.email?.split('@')[0] || 'User'
  })

</script>

<style scoped>
/**
 * Enhanced styling for the home page
 * Provides smooth animations and improved visual hierarchy
 */

/* Smooth transitions for interactive elements */
.v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Card hover effects */
.v-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-card:hover {
  transform: translateY(-1px);
}

/* Enhance the main welcome card */
.v-card .v-img {
  transition: transform 0.3s ease;
}

.v-card:hover .v-img {
  transform: scale(1.02);
}

/* Statistics section styling */
.v-icon + .text-h6 {
  margin-top: 8px;
}

/* Responsive font adjustments */
@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.75rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }
}

/* Accessibility improvements */
.v-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Loading animation for stats */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card:nth-child(odd) {
  animation: fadeInUp 0.6s ease-out;
}

.v-card:nth-child(even) {
  animation: fadeInUp 0.6s ease-out 0.1s;
  animation-fill-mode: both;
}
</style>
