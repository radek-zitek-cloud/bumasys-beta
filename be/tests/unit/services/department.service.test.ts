/**
 * @fileoverview Unit tests for department service
 */

import { DepartmentService } from '../../../src/services/department.service';
import type {
  Database,
  Department,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  Organization,
  Staff,
} from '../../../src/types';

describe('DepartmentService', () => {
  let departmentService: DepartmentService;
  let mockDb: Database;

  const mockOrganization: Organization = {
    id: 'org-1',
    name: 'Test Organization',
    description: 'Test Description',
    rootStaffId: undefined,
    rootDepartmentId: undefined,
  };

  const mockDepartment: Department = {
    id: 'dept-1',
    name: 'Engineering',
    description: 'Engineering Department',
    organizationId: 'org-1',
    parentDepartmentId: undefined,
    managerId: undefined,
  };

  const mockChildDepartment: Department = {
    id: 'dept-2',
    name: 'Frontend Team',
    description: 'Frontend Development Team',
    organizationId: 'org-1',
    parentDepartmentId: 'dept-1',
    managerId: undefined,
  };

  const mockStaff: Staff = {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    role: 'Manager',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    supervisorId: undefined,
  };

  beforeEach(() => {
    mockDb = {
      data: {
        users: [],
        sessions: [],
        organizations: [mockOrganization],
        departments: [mockDepartment, mockChildDepartment],
        staff: [mockStaff],
        projects: [],
        tasks: [],
        taskAssignees: [],
        taskPredecessors: [],
        priorities: [],
        statuses: [],
        complexities: [],
        taskEvaluations: [],
        taskProgress: [],
        taskStatusReports: [],
        projectStatusReports: [],
        teams: [],
        teamMembers: [],
      },
      write: jest.fn().mockResolvedValue(undefined),
    };

    departmentService = new DepartmentService(mockDb);
  });

  describe('findById', () => {
    it('should return department when found by ID', () => {
      const result = departmentService.findById('dept-1');
      expect(result).toEqual(mockDepartment);
    });

    it('should return undefined when department not found by ID', () => {
      const result = departmentService.findById('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllDepartments', () => {
    it('should return all departments', () => {
      const result = departmentService.getAllDepartments();
      expect(result).toHaveLength(2);
      expect(result).toContain(mockDepartment);
      expect(result).toContain(mockChildDepartment);
    });
  });

  describe('getDepartmentsByOrganization', () => {
    it('should return departments for a specific organization', () => {
      const result = departmentService.getDepartmentsByOrganization('org-1');
      expect(result).toHaveLength(2);
      expect(result).toContain(mockDepartment);
      expect(result).toContain(mockChildDepartment);
    });

    it('should return empty array for non-existent organization', () => {
      const result =
        departmentService.getDepartmentsByOrganization('org-nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should filter departments correctly', () => {
      // Add department for different organization
      const otherOrgDept: Department = {
        id: 'dept-3',
        name: 'Other Dept',
        description: 'Department for other org',
        organizationId: 'org-2',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(otherOrgDept);

      const result = departmentService.getDepartmentsByOrganization('org-1');
      expect(result).toHaveLength(2);
      expect(result.every((dept) => dept.organizationId === 'org-1')).toBe(
        true,
      );
    });
  });

  describe('getChildDepartments', () => {
    it('should return child departments of a parent', () => {
      const result = departmentService.getChildDepartments('dept-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockChildDepartment);
    });

    it('should return empty array for department with no children', () => {
      const result = departmentService.getChildDepartments('dept-2');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for non-existent department', () => {
      const result = departmentService.getChildDepartments('dept-nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('createDepartment', () => {
    const createDepartmentInput: CreateDepartmentInput = {
      name: 'New Department',
      description: 'A new department',
      organizationId: 'org-1',
      parentDepartmentId: 'dept-1',
    };

    it('should create new department successfully', async () => {
      const result = await departmentService.createDepartment(
        createDepartmentInput,
      );

      expect(result).toMatchObject({
        name: 'New Department',
        description: 'A new department',
        organizationId: 'org-1',
        parentDepartmentId: 'dept-1',
      });
      expect(result.id).toBeDefined();
      expect(mockDb.data.departments).toHaveLength(3);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should create department without parent department', async () => {
      const inputWithoutParent = {
        ...createDepartmentInput,
        parentDepartmentId: undefined,
      };

      const result =
        await departmentService.createDepartment(inputWithoutParent);

      expect(result.parentDepartmentId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when organization not found', async () => {
      const invalidInput = {
        ...createDepartmentInput,
        organizationId: 'org-invalid',
      };

      await expect(
        departmentService.createDepartment(invalidInput),
      ).rejects.toThrow('Organization not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent department not found', async () => {
      const invalidInput = {
        ...createDepartmentInput,
        parentDepartmentId: 'dept-invalid',
      };

      await expect(
        departmentService.createDepartment(invalidInput),
      ).rejects.toThrow('Parent department not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent department belongs to different organization', async () => {
      // Add department for different organization
      const otherOrgDept: Department = {
        id: 'dept-other',
        name: 'Other Dept',
        description: 'Department for other org',
        organizationId: 'org-2',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(otherOrgDept);

      const invalidInput = {
        ...createDepartmentInput,
        parentDepartmentId: 'dept-other',
      };

      await expect(
        departmentService.createDepartment(invalidInput),
      ).rejects.toThrow(
        'Parent department must belong to the same organization',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should create department with minimal required fields', async () => {
      const minimalInput: CreateDepartmentInput = {
        name: 'Minimal Department',
        description: 'A minimal department',
        organizationId: 'org-1',
        parentDepartmentId: undefined,
      };

      const result = await departmentService.createDepartment(minimalInput);

      expect(result.name).toBe('Minimal Department');
      expect(result.organizationId).toBe('org-1');
      expect(result.parentDepartmentId).toBeUndefined();
      expect(result.managerId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('updateDepartment', () => {
    const updateDepartmentInput: UpdateDepartmentInput = {
      id: 'dept-1',
      name: 'Updated Engineering',
      description: 'Updated Engineering Department',
    };

    beforeEach(() => {
      // Reset departments to clean state for each test
      mockDb.data.departments = [
        { ...mockDepartment },
        { ...mockChildDepartment },
      ];
    });

    it('should update department successfully', async () => {
      const result = await departmentService.updateDepartment(
        updateDepartmentInput,
      );

      expect(result.name).toBe('Updated Engineering');
      expect(result.description).toBe('Updated Engineering Department');
      expect(result.organizationId).toBe('org-1'); // Unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when department not found', async () => {
      const invalidUpdate = { ...updateDepartmentInput, id: 'dept-invalid' };

      await expect(
        departmentService.updateDepartment(invalidUpdate),
      ).rejects.toThrow('Department not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should update parent department when valid', async () => {
      // Add another root department
      const newRootDept: Department = {
        id: 'dept-root-2',
        name: 'Sales',
        description: 'Sales Department',
        organizationId: 'org-1',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(newRootDept);

      const parentUpdate = {
        ...updateDepartmentInput,
        id: 'dept-2',
        parentDepartmentId: 'dept-root-2',
      };

      const result = await departmentService.updateDepartment(parentUpdate);

      expect(result.parentDepartmentId).toBe('dept-root-2');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should not update parent department when set to undefined', async () => {
      const clearParentUpdate = {
        ...updateDepartmentInput,
        id: 'dept-2',
        parentDepartmentId: undefined,
      };

      const result =
        await departmentService.updateDepartment(clearParentUpdate);

      // Should remain unchanged (the original value from mockChildDepartment)
      expect(result.parentDepartmentId).toBe('dept-1');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when parent department not found', async () => {
      const invalidParentUpdate = {
        ...updateDepartmentInput,
        parentDepartmentId: 'dept-invalid',
      };

      await expect(
        departmentService.updateDepartment(invalidParentUpdate),
      ).rejects.toThrow('Parent department not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when parent department belongs to different organization', async () => {
      // Add department for different organization
      const otherOrgDept: Department = {
        id: 'dept-other',
        name: 'Other Dept',
        description: 'Department for other org',
        organizationId: 'org-2',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(otherOrgDept);

      const invalidParentUpdate = {
        ...updateDepartmentInput,
        parentDepartmentId: 'dept-other',
      };

      await expect(
        departmentService.updateDepartment(invalidParentUpdate),
      ).rejects.toThrow(
        'Parent department must belong to the same organization',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when department tries to be its own parent', async () => {
      const selfParentUpdate = {
        ...updateDepartmentInput,
        parentDepartmentId: 'dept-1',
      };

      await expect(
        departmentService.updateDepartment(selfParentUpdate),
      ).rejects.toThrow('Department cannot be its own parent');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when update would create circular reference', async () => {
      // Try to make the parent department a child of its current child
      const circularUpdate = { id: 'dept-1', parentDepartmentId: 'dept-2' };

      await expect(
        departmentService.updateDepartment(circularUpdate),
      ).rejects.toThrow(
        'Update would create circular reference in department hierarchy',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should update manager when valid', async () => {
      const managerUpdate = { ...updateDepartmentInput, managerId: 'staff-1' };

      const result = await departmentService.updateDepartment(managerUpdate);

      expect(result.managerId).toBe('staff-1');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should not update manager when set to undefined', async () => {
      // First set a manager
      const originalManagerId = mockDb.data.departments[0].managerId;

      const clearManagerUpdate = {
        ...updateDepartmentInput,
        managerId: undefined,
      };

      const result =
        await departmentService.updateDepartment(clearManagerUpdate);

      expect(result.managerId).toBe(originalManagerId); // Should remain unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when manager not found or belongs to different organization', async () => {
      const invalidManagerUpdate = {
        ...updateDepartmentInput,
        managerId: 'staff-invalid',
      };

      await expect(
        departmentService.updateDepartment(invalidManagerUpdate),
      ).rejects.toThrow(
        'Manager not found or does not belong to this organization',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when manager belongs to different organization', async () => {
      // Add staff from different organization
      const otherOrgStaff: Staff = {
        id: 'staff-other',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+1234567891',
        role: 'Manager',
        organizationId: 'org-2',
        departmentId: 'dept-other',
        supervisorId: undefined,
      };
      mockDb.data.staff.push(otherOrgStaff);

      const invalidManagerUpdate = {
        ...updateDepartmentInput,
        managerId: 'staff-other',
      };

      await expect(
        departmentService.updateDepartment(invalidManagerUpdate),
      ).rejects.toThrow(
        'Manager not found or does not belong to this organization',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('deleteDepartment', () => {
    it('should delete department successfully when no dependencies', async () => {
      // Remove dependencies
      mockDb.data.departments = [mockDepartment]; // Remove child department
      mockDb.data.staff = []; // Remove staff

      const result = await departmentService.deleteDepartment('dept-1');

      expect(result).toBe(true);
      expect(mockDb.data.departments).toHaveLength(0);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should return false when department not found', async () => {
      const result = await departmentService.deleteDepartment('dept-invalid');

      expect(result).toBe(false);
      expect(mockDb.data.departments).toHaveLength(2);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when department has child departments', async () => {
      await expect(
        departmentService.deleteDepartment('dept-1'),
      ).rejects.toThrow(
        'Cannot delete department with existing child departments or staff members',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when department has staff members', async () => {
      // Remove child departments but keep staff
      mockDb.data.departments = [mockDepartment];

      await expect(
        departmentService.deleteDepartment('dept-1'),
      ).rejects.toThrow(
        'Cannot delete department with existing child departments or staff members',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should clear root department reference from organization when deleting root department', async () => {
      // Set department as root department of organization
      mockDb.data.organizations[0].rootDepartmentId = 'dept-1';
      // Remove dependencies
      mockDb.data.departments = [mockDepartment];
      mockDb.data.staff = [];

      const result = await departmentService.deleteDepartment('dept-1');

      expect(result).toBe(true);
      expect(mockDb.data.organizations[0].rootDepartmentId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should allow deleting child department with no dependencies', async () => {
      // Reset to clean state and remove staff from child department
      mockDb.data.departments = [
        { ...mockDepartment },
        { ...mockChildDepartment },
      ];
      mockDb.data.staff = [];

      const result = await departmentService.deleteDepartment('dept-2');

      expect(result).toBe(true);
      expect(mockDb.data.departments).toHaveLength(1);
      expect(mockDb.data.departments[0]).toEqual(mockDepartment);
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('getDepartmentsWithStats', () => {
    beforeEach(() => {
      // Reset to clean state
      mockDb.data.departments = [
        { ...mockDepartment },
        { ...mockChildDepartment },
      ];
      mockDb.data.staff = [mockStaff];

      // Add more staff to different departments
      const staff2: Staff = {
        id: 'staff-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+1234567891',
        role: 'Developer',
        organizationId: 'org-1',
        departmentId: 'dept-2',
        supervisorId: undefined,
      };
      const staff3: Staff = {
        id: 'staff-3',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@test.com',
        phone: '+1234567892',
        role: 'Developer',
        organizationId: 'org-1',
        departmentId: 'dept-2',
        supervisorId: undefined,
      };
      mockDb.data.staff.push(staff2, staff3);

      // Add another child department
      const grandchildDept: Department = {
        id: 'dept-3',
        name: 'UI Team',
        description: 'UI Development Team',
        organizationId: 'org-1',
        parentDepartmentId: 'dept-2',
        managerId: undefined,
      };
      mockDb.data.departments.push(grandchildDept);
    });

    it('should return departments with staff and child department counts', () => {
      const result = departmentService.getDepartmentsWithStats();

      expect(result).toHaveLength(3);

      const engineeringDept = result.find((d) => d.id === 'dept-1');
      expect(engineeringDept?.staffCount).toBe(1);
      expect(engineeringDept?.childDepartmentCount).toBe(1);

      const frontendDept = result.find((d) => d.id === 'dept-2');
      expect(frontendDept?.staffCount).toBe(2);
      expect(frontendDept?.childDepartmentCount).toBe(1);

      const uiDept = result.find((d) => d.id === 'dept-3');
      expect(uiDept?.staffCount).toBe(0);
      expect(uiDept?.childDepartmentCount).toBe(0);
    });

    it('should filter by organization ID', () => {
      // Add department from different organization
      const otherOrgDept: Department = {
        id: 'dept-other',
        name: 'Other Dept',
        description: 'Department for other org',
        organizationId: 'org-2',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(otherOrgDept);

      const result = departmentService.getDepartmentsWithStats('org-1');

      expect(result).toHaveLength(3);
      expect(result.every((d) => d.organizationId === 'org-1')).toBe(true);
    });

    it('should return all departments when no organization filter is provided', () => {
      // Add department from different organization
      const otherOrgDept: Department = {
        id: 'dept-other',
        name: 'Other Dept',
        description: 'Department for other org',
        organizationId: 'org-2',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(otherOrgDept);

      const result = departmentService.getDepartmentsWithStats();

      expect(result).toHaveLength(4);
    });

    it('should return empty array for non-existent organization', () => {
      const result =
        departmentService.getDepartmentsWithStats('org-nonexistent');

      expect(result).toHaveLength(0);
    });
  });
});
