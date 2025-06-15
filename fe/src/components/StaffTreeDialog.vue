<!--
  @fileoverview Staff Tree Dialog Component

  This component displays the hierarchical organizational structure using Treant.js.
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
  import Tree from 'treant-js'
  import { nextTick, onMounted, ref } from 'vue'
  import * as staffService from '../services/staff'

  /** Local type definitions for Treant.js */
  interface TreeConfig {
    chart?: {
      container?: string
      levelSeparation?: number
      siblingSeparation?: number
      subTeeSeparation?: number
      rootOrientation?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
      nodeAlign?: 'TOP' | 'CENTER' | 'BOTTOM'
      connectors?: {
        type?: 'straight' | 'bezier' | 'step'
        style?: {
          'stroke-width'?: number
          'stroke'?: string
        }
      }
      node?: {
        HTMLclass?: string
        collapsable?: boolean
      }
    }
    nodeStructure?: TreeNode
  }

  interface TreeNode {
    text?: {
      [key: string]: any
      name?: string
      title?: string
    }
    HTMLclass?: string
    children?: TreeNode[]
  }

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
  function buildStaffTree (allStaff: Staff[], rootStaff: Staff): TreeNode {
    // Helper function to build tree recursively
    function buildNode (staff: Staff): TreeNode {
      const subordinates = allStaff
        .filter(s => s.supervisorId === staff.id)
        .map(subordinate => buildNode(subordinate))

      return {
        text: {
          name: `${staff.firstName} ${staff.lastName}`,
          title: staff.role,
        },
        HTMLclass: 'staff-node',
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

      // Configure Treant.js
      const config: TreeConfig = {
        chart: {
          container: '#staff-tree-container',
          levelSeparation: 40,
          siblingSeparation: 20,
          subTeeSeparation: 30,
          rootOrientation: 'NORTH',
          nodeAlign: 'CENTER',
          connectors: {
            type: 'straight',
            style: {
              'stroke-width': 2,
              'stroke': '#9C27B0',
            },
          },
          node: {
            HTMLclass: 'treant-node',
          },
        },
        nodeStructure: treeStructure,
      }

      // Create the tree
      new Tree(config)
    } catch (error_) {
      console.error('Error initializing staff tree:', error_)
      error.value = error_ instanceof Error ? error_.message : 'Failed to load organization structure'
    } finally {
      loading.value = false
    }
  }

  /** Initialize tree when component mounts */
  onMounted(() => {
    initializeTree()
  })
</script>

<style scoped>
  @import 'treant-js/Treant.css';

  .tree-container {
    min-height: 400px;
    overflow: auto;
    padding: 20px;
  }

  :deep(.treant-node) {
    padding: 12px;
    border: 2px solid #9C27B0;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', sans-serif;
    text-align: center;
    min-width: 150px;
  }

  :deep(.staff-node .name) {
    font-weight: 600;
    font-size: 14px;
    color: #9C27B0;
    margin-bottom: 4px;
  }

  :deep(.staff-node .title) {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
</style>
