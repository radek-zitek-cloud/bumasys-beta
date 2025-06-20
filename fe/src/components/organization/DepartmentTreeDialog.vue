<!--
  @fileoverview Department Tree Dialog Component

  This component displays the hierarchical structure of departments using d3.js.
  It shows department names and their managers in a graphical tree format.
  Uses the parentDepartmentId relationship to build the hierarchy.
-->

<template>
  <v-card
    class="department-tree-dialog"
    :height="dialogHeight"
    :width="dialogWidth"
  >
    <v-card-title class="dialog-header">
      <v-icon class="mr-2">mdi-file-tree</v-icon>
      Department Structure
    </v-card-title>
    <v-card-text class="dialog-content">
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular color="primary" indeterminate />
        <p class="mt-2">Loading department structure...</p>
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
  import type { Department } from '../../services/departments'
  import type { Staff } from '../../services/staff'
  import { computed, nextTick, onMounted, ref } from 'vue'
  import { type TreeNodeData, useD3Tree } from '../../composables/useD3Tree'
  import * as departmentService from '../../services/departments'
  import * as staffService from '../../services/staff'

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

  /** Dialog dimensions - use most of the available window space */
  const dialogWidth = computed(() => Math.min(window.innerWidth * 0.95, 1800))
  const dialogHeight = computed(() => Math.min(window.innerHeight * 0.9, 1000))

  /** Vue D3 tree composable */
  const { createTree, error: treeError, VueTreeComponent, vueTreeProps } = useD3Tree()

  /** Build tree structure from departments and staff data */
  function buildDepartmentTree (
    departments: Department[],
    staff: Staff[],
    startingDepartment: Department,
  ): TreeNodeData {
    // Helper function to get manager name
    function getManagerName (managerId?: string): string {
      if (!managerId) return 'No Manager'
      const manager = staff.find(s => s.id === managerId)
      return manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown Manager'
    }

    // Helper function to build tree recursively
    function buildNode (dept: Department): TreeNodeData {
      const children = departments
        .filter(d => d.parentDepartmentId === dept.id)
        .map(child => buildNode(child))

      return {
        name: dept.name,
        title: getManagerName(dept.managerId),
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

      // Create the Vue D3 tree (no DOM manipulation needed)
      createTree(treeStructure, {
        width: Math.max(dialogWidth.value - 80, 800), // Use most of dialog width minus padding
        height: Math.max(dialogHeight.value - 200, 600), // Use most of dialog height minus header/footer
        nodeColor: '#1976D2',
        linkColor: '#1976D2',
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
      console.error('Error initializing department tree:', error_)
      error.value = error_ instanceof Error ? error_.message : 'Failed to load department structure'
      loading.value = false
    }
  }

  /** Initialize tree when component mounts */
  onMounted(() => {
    initializeTree()
  })
</script>

<style scoped>
  .department-tree-dialog {
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
  }

  .dialog-content {
    flex: 1;
    padding: 0 !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .tree-content {
    flex: 1;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .tree-wrapper {
    flex: 1;
    width: 100%;
    position: relative;
    overflow: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: #fafafa;
    min-height: 600px; /* Minimum height for tree visibility */
  }

  .tree-container {
    width: 100%;
    height: 100%;
    min-height: 600px;
  }

  .dialog-actions {
    flex-shrink: 0;
    border-top: 1px solid #e0e0e0;
    padding: 16px 24px;
  }

  .custom-tree-node {
    background: white;
    border: 2px solid #1976D2;
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
    color: #1976D2;
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
    min-height: 600px;
  }

  :deep(.vue-tree) {
    width: 100%;
    height: 100%;
    min-height: 600px;
  }
</style>
