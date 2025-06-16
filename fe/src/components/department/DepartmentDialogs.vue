<!--
  @fileoverview Department Dialogs Component

  Wraps all department-related dialogs to reduce template complexity
  in the main people management page.
-->

<template>
  <!-- Department Create Dialog -->
  <v-dialog
    v-model="departmentManagement.showDepartmentCreateDialog.value"
    max-width="600"
    persistent
  >
    <DepartmentCreateDialog
      :departments="departments"
      :organizations="organizations"
      @cancel="departmentManagement.showDepartmentCreateDialog.value = false"
      @created="$emit('created', $event)"
    />
  </v-dialog>

  <!-- Department Edit Dialog -->
  <v-dialog
    v-model="departmentManagement.showDepartmentEditDialog.value"
    max-width="600"
    persistent
  >
    <DepartmentEditDialog
      v-if="departmentManagement.selectedDepartment.value"
      :department="departmentManagement.selectedDepartment.value"
      :departments="departments"
      :staff="staff"
      @cancel="departmentManagement.showDepartmentEditDialog.value = false"
      @updated="$emit('updated', $event)"
    />
  </v-dialog>

  <!-- Department View Dialog -->
  <v-dialog
    v-model="departmentManagement.showDepartmentViewDialog.value"
    max-width="600"
    persistent
  >
    <DepartmentViewDialog
      v-if="departmentManagement.selectedDepartment.value"
      :department="departmentManagement.selectedDepartment.value"
      :organizations="organizations"
      :staff="staff"
      @close="departmentManagement.showDepartmentViewDialog.value = false"
    />
  </v-dialog>

  <!-- Department Delete Dialog -->
  <v-dialog
    v-model="departmentManagement.showDepartmentDeleteDialog.value"
    max-width="500"
    persistent
  >
    <DepartmentDeleteDialog
      v-if="departmentManagement.selectedDepartment.value"
      :department="departmentManagement.selectedDepartment.value"
      @cancel="departmentManagement.showDepartmentDeleteDialog.value = false"
      @deleted="$emit('deleted', $event)"
    />
  </v-dialog>

  <!-- Department Tree Dialog -->
  <v-dialog
    v-model="departmentManagement.showDepartmentTreeDialog.value"
    persistent
  >
    <DepartmentTreeDialog
      v-if="departmentManagement.selectedDepartment.value"
      :department="departmentManagement.selectedDepartment.value"
      @close="departmentManagement.showDepartmentTreeDialog.value = false"
    />
  </v-dialog>
</template>

<script lang="ts" setup>
  import type { CreateDepartmentInput, Department, UpdateDepartmentInput } from '../../services/departments'
  import type { Organization } from '../../services/organizations'
  import type { Staff } from '../../services/staff'
  import DepartmentCreateDialog from '../organization/DepartmentCreateDialog.vue'
  import DepartmentDeleteDialog from '../organization/DepartmentDeleteDialog.vue'
  import DepartmentEditDialog from '../organization/DepartmentEditDialog.vue'
  import DepartmentTreeDialog from '../organization/DepartmentTreeDialog.vue'
  import DepartmentViewDialog from '../organization/DepartmentViewDialog.vue'

  /**
   * Component props
   */
  interface Props {
    departmentManagement: ReturnType<typeof import('../../composables/department/useDepartmentManagement').useDepartmentManagement>
    departments: Department[]
    organizations: Organization[]
    staff: Staff[]
  }

  /**
   * Component events
   */
  interface Emits {
    (e: 'created', data: CreateDepartmentInput): void
    (e: 'updated', data: UpdateDepartmentInput): void
    (e: 'deleted', id: string): void
  }

  defineProps<Props>()
  defineEmits<Emits>()
</script>
