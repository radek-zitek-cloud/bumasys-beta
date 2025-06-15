<!--
  @fileoverview Department Tree Dialog Component

  This component displays the hierarchical structure of departments using Treant.js.
  It shows department names and their managers in a graphical tree format.
  Uses the parentDepartmentId relationship to build the hierarchy.
-->

<template>
  <v-card width="1000">
    <v-card-title>
      <v-icon class="mr-2">mdi-file-tree</v-icon>
      Department Structure
    </v-card-title>
    <v-card-text>
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular color="primary" indeterminate />
        <p class="mt-2">Loading department structure...</p>
      </div>
      <div v-else-if="error" class="text-center pa-4">
        <v-icon class="mb-2" color="error" size="48">mdi-alert-circle</v-icon>
        <p class="text-error">{{ error }}</p>
      </div>
      <div v-else>
        <div id="department-tree-container" ref="treeContainer" class="tree-container" />
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
  import type { Department } from '../services/departments'
  import type { Staff } from '../services/staff'
  import Tree from 'treant-js'
  import { nextTick, onMounted, ref } from 'vue'
  import * as departmentService from '../services/departments'
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
    department: Department
  }>()

  /** Component events */
  const emit = defineEmits<{
    close: []
  }>()

  /** Reactive state */
  const loading = ref(true)
  const error = ref<string | null>(null)
  const treeContainer = ref<HTMLElement>()

  /** Build tree structure from departments and staff data */
  function buildDepartmentTree (
    departments: Department[],
    staff: Staff[],
    startingDepartment: Department,
  ): TreeNode {
    // Helper function to get manager name
    function getManagerName (managerId?: string): string {
      if (!managerId) return 'No Manager'
      const manager = staff.find(s => s.id === managerId)
      return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown Manager'
    }

    // Helper function to build tree recursively
    function buildNode (dept: Department): TreeNode {
      const children = departments
        .filter(d => d.parentDepartmentId === dept.id)
        .map(child => buildNode(child))

      return {
        text: {
          name: dept.name,
          title: getManagerName(dept.managerId),
        },
        HTMLclass: 'department-node',
        children: children.length > 0 ? children : undefined,
      }
    }

    return buildNode(startingDepartment)
  }

  /** Initialize and render the tree */
  async function initializeTree () {
    try {
      loading.value = true
      error.value = null

      // Fetch all departments and staff for the organization
      const [departmentsResponse, staffResponse] = await Promise.all([
        departmentService.getDepartments(props.department.organizationId),
        staffService.getStaff(props.department.organizationId),
      ])

      const departments = departmentsResponse.departments
      const staff = staffResponse.staff

      // Build tree structure starting from the selected department
      const treeStructure = buildDepartmentTree(departments, staff, props.department)

      // Wait for DOM to update
      await nextTick()

      if (!treeContainer.value) {
        throw new Error('Tree container not found')
      }

      // Configure Treant.js
      const config: TreeConfig = {
        chart: {
          container: '#department-tree-container',
          levelSeparation: 40,
          siblingSeparation: 20,
          subTeeSeparation: 30,
          rootOrientation: 'NORTH',
          nodeAlign: 'CENTER',
          connectors: {
            type: 'straight',
            style: {
              'stroke-width': 2,
              'stroke': '#1976D2',
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
      console.error('Error initializing department tree:', error_)
      error.value = error_ instanceof Error ? error_.message : 'Failed to load department structure'
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
    border: 2px solid #1976D2;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-family: 'Roboto', sans-serif;
    text-align: center;
    min-width: 150px;
  }

  :deep(.department-node .name) {
    font-weight: 600;
    font-size: 14px;
    color: #1976D2;
    margin-bottom: 4px;
  }

  :deep(.department-node .title) {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
</style>
