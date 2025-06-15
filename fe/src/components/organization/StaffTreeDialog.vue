<!--
  @fileoverview Staff Tree Dialog Component

  This component displays the hierarchical organizational structure using d3.js.
  It shows staff names and their roles in a graphical tree format.
  Uses the supervisorId relationship to build the hierarchy.
-->

<template>
  <v-card 
    class="staff-tree-dialog"
    :width="dialogWidth"
    :height="dialogHeight"
  >

  <v-card-title class="dialog-header">
      <v-icon class="mr-2">mdi-account-supervisor</v-icon>
      Organization Structure
    </v-card-title>
    <v-card-text class="dialog-content">
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular color="primary" indeterminate />
        <p class="mt-2">Loading organization structure...</p>
      </div>
      <div v-else-if="error" class="text-center pa-4">
        <v-icon class="mb-2" color="error" size="48">mdi-alert-circle</v-icon>
        <p class="text-error">{{ error }}</p>
      </div>

      <div v-else class="tree-content">
        <div class="tree-wrapper">
          <component 
            :is="VueTreeComponent" 
            v-if="vueTreeProps" 
            v-bind="vueTreeProps"
            class="tree-container"
          >
            <template #node="{ data }">
              <div class="custom-tree-node">
                <div class="node-name">{{ data.name }}</div>
                <div v-if="data.title" class="node-title">{{ data.title }}</div>
              </div>
            </template>
          </component>
        </div>
      </div>
    </v-card-text>
    <v-card-actions class="dialog-actions">
      <v-spacer />
      <v-btn color="primary" variant="text" @click="emit('close')">
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" setup>
  import type { Staff } from '../../services/staff'
  import { computed, nextTick, onMounted, ref } from 'vue'
  import { type TreeNodeData, useD3Tree } from '../../composables/useD3Tree'
  import * as staffService from '../../services/staff'

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

  /** Dialog dimensions - use most of the available window space */
  const dialogWidth = computed(() => Math.min(window.innerWidth * 0.95, 1800))
  const dialogHeight = computed(() => Math.min(window.innerHeight * 0.90, 1000))

  /** Vue D3 tree composable */
  const { createTree, error: treeError, VueTreeComponent, vueTreeProps } = useD3Tree()

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

      // Create the Vue D3 tree (no DOM manipulation needed)
      createTree(treeStructure, {
        width: Math.max(dialogWidth.value - 80, 900), // Use most of dialog width minus padding
        height: Math.max(dialogHeight.value - 200, 650), // Use most of dialog height minus header/footer
        nodeColor: '#9C27B0',
        linkColor: '#9C27B0',
        direction: 'vertical',
        levelSeparation: 80,
        siblingSeparation: 60,
      })

      // Check for tree creation errors
      if (treeError.value) {
        throw new Error(treeError.value)
      }

      loading.value = false
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
  .staff-tree-dialog {
    max-width: 95vw !important;
    max-height: 90vh !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .dialog-header {
    flex-shrink: 0;
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 24px;
    min-height: 56px;
  }

  .dialog-content {
    flex: 1 1 auto;
    padding: 0 !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .tree-content {
    flex: 1 1 auto;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .tree-wrapper {
    flex: 1 1 auto;
    width: 100%;
    position: relative;
    overflow: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
    min-height: 650px; /* Minimum height for tree visibility */
  }

  .tree-container {
    width: 100%;
    height: 100%;
    min-height: 650px;
  }

  .dialog-actions {
    flex-shrink: 0;
    border-top: 1px solid #e0e0e0;
    padding: 16px 24px;
    min-height: 72px;
  }

  .custom-tree-node {
    background: white;
    border: 2px solid #9C27B0;
    border-radius: 8px;
    padding: 8px 12px;
    min-width: 120px;
    text-align: center;
    font-family: 'Roboto', sans-serif;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .node-name {
    font-size: 10px;
    font-weight: bold;
    color: #9C27B0;
    line-height: 1.2;
    margin-bottom: 4px;
  }

  .node-title {
    font-size: 9px;
    color: #666;
    line-height: 1.2;
  }

  /* Vue D3 Tree specific styles */
  :deep(svg) {
    width: 100%;
    height: 100%;
    min-height: 650px;
  }

  :deep(.vue-tree) {
    width: 100%;
    height: 100%;
    min-height: 650px;
  }
</style>
