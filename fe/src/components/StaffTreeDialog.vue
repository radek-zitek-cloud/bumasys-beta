<!--
  @fileoverview Staff Tree Dialog Component

  This component displays the hierarchical organizational structure using d3.js.
  It shows staff names and their roles in a graphical tree format.
  Uses the supervisorId relationship to build the hierarchy.
-->

<template>
  <v-card width="1000">
    <v-card-title>
      <v-icon class="mr-2">mdi-account-supervisor</v-icon>
      Organization Structure
    </v-card-title>
    <v-card-text>
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular color="primary" indeterminate />
        <p class="mt-2">Loading organization structure...</p>
      </div>
      <div v-else-if="error" class="text-center pa-4">
        <v-icon class="mb-2" color="error" size="48">mdi-alert-circle</v-icon>
        <p class="text-error">{{ error }}</p>
      </div>
      <div v-else>
        <div id="staff-tree-container" ref="treeContainer" class="tree-container" />
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" variant="text" @click="emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Staff } from '../services/staff'
  import { nextTick, onMounted, ref } from 'vue'
  import { type TreeNodeData, useD3Tree } from '../composables/useD3Tree'
  import * as staffService from '../services/staff'

  /** Component props */
  const props = defineProps<{
    staff: Staff
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Reactive state */
  const loading = ref(true)
  const error = ref<string | null>(null)
  const treeContainer = ref<HTMLElement>()

  /** D3 tree composable */
  const { createTree, error: treeError } = useD3Tree()

  /** Find the root staff member (highest in hierarchy) for the given staff member */
  function findRootStaff (allStaff: Staff[], startingStaff: Staff): Staff {
    let currentStaff = startingStaff
    const visited = new Set<string>()

    // Traverse up the hierarchy to find the root (no supervisor or supervisor not found)
    while (currentStaff.supervisorId && !visited.has(currentStaff.id)) {
      visited.add(currentStaff.id)
      const supervisor = allStaff.find(s => s.id === currentStaff.supervisorId)
      if (!supervisor) break
      currentStaff = supervisor
    }

    return currentStaff
  }

  /** Build tree structure from staff data */
  function buildStaffTree (allStaff: Staff[], rootStaff: Staff): TreeNodeData {
    // Helper function to build tree recursively
    function buildNode (staff: Staff): TreeNodeData {
      const subordinates = allStaff
        .filter(s => s.supervisorId === staff.id)
        .map(subordinate => buildNode(subordinate))

      return {
        name: `${staff.firstName} ${staff.lastName}`,
        title: staff.role,
        children: subordinates.length > 0 ? subordinates : undefined,
      }
    }

    return buildNode(rootStaff)
  }

  /** Initialize and render the tree */
  async function initializeTree () {
    try {
      loading.value = true
      error.value = null

      // Fetch all staff for the organization
      const staffResponse = await staffService.getStaff(props.staff.organizationId)
      const allStaff = staffResponse.staff

      if (allStaff.length === 0) {
        throw new Error('No staff members found for this organization')
      }

      // Find the root of the hierarchy for the selected staff member
      const rootStaff = findRootStaff(allStaff, props.staff)

      // Build tree structure starting from the root
      const treeStructure = buildStaffTree(allStaff, rootStaff)

      loading.value = false

      // Wait for DOM to update and container to be available
      await nextTick()

      // Wait for the container to be available with retry logic
      let retries = 0
      const maxRetries = 10
      while (retries < maxRetries && !treeContainer.value) {
        await new Promise(resolve => setTimeout(resolve, 50))
        retries++
      }

      if (!treeContainer.value) {
        throw new Error('Tree container not found')
      }

      // Create the d3.js tree
      createTree(treeStructure, {
        containerSelector: '#staff-tree-container',
        width: 950,
        height: 500,
        nodeColor: '#9C27B0',
        linkColor: '#9C27B0',
      })

      // Check for tree creation errors
      if (treeError.value) {
        throw new Error(treeError.value)
      }
    } catch (error_) {
      console.error('Error initializing staff tree:', error_)
      error.value = error_ instanceof Error ? error_.message : 'Failed to load organization structure'
      loading.value = false
    }
  }

  /** Initialize tree when component mounts */
  onMounted(() => {
    initializeTree()
  })
</script>

<style scoped>
  .tree-container {
    width: 100%;
    height: 500px;
    position: relative;
    overflow: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
    padding: 20px;
  }

  /* D3.js tree specific styles */
  :deep(svg) {
    width: 100%;
    height: 100%;
  }

  :deep(.node text) {
    font-family: 'Roboto', sans-serif;
  }
</style>
