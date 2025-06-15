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
      <v-col cols="12" lg="4" md="6" sm="8">
        <v-card :elevation="24" max-width="400">
          <v-img cover src="@/assets/fulcrum-mid.png" />
          <v-card-title class="text-h5">Fulcrum</v-card-title>
          <v-card-subtitle
            class="
          "
          >A Full-Stack Web Application for Departmental Management</v-card-subtitle>
          <v-card-text>
            Fulcrum is a full-stack web application designed to serve as the central coordination hub for departmental
            management. It provides an integrated environment for handling human resources, performance tracking, budget
            oversight, and workload planning—turning disjointed spreadsheets and tools into a single, consistent source
            of operational truth.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
/**
 * @fileoverview Home Page Script
 *
 * Minimal script setup for the home page. Currently contains no reactive
 * logic as the page is static, but provides the foundation for future
 * enhancements such as user-specific welcome messages or dashboard widgets.
 *
 * TODO: Add personalized welcome message for authenticated users
 * TODO: Consider adding quick action buttons for common tasks
 * TODO: Add application statistics or recent activity summary
 * TODO: Implement user onboarding flow for new users
 */

// Currently no reactive logic needed for static home page
// Future enhancements can be added here
</script>
