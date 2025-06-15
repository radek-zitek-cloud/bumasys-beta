/**
 * @fileoverview Unit tests for staff service
 */

import { StaffService } from '../../../src/services/staff.service';
import type { Database, Staff, CreateStaffInput, UpdateStaffInput, Department, Organization } from '../../../src/types';

describe('StaffService', () => {
  let staffService: StaffService;
  let mockDb: Database;

  const mockOrganization: Organization = {
    id: 'org-1',
    name: 'Test Organization',
    description: 'Test Description',
    rootStaffId: undefined,
  };

  const mockDepartment: Department = {
    id: 'dept-1',
    name: 'Engineering',
    description: 'Engineering Department',
    organizationId: 'org-1',
    parentDepartmentId: undefined,
    managerId: undefined,
  };

  const mockStaff: Staff = {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    role: 'Engineer',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    supervisorId: undefined,
  };

  const mockSupervisor: Staff = {
    id: 'staff-2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@test.com',
    phone: '+1234567891',
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
        departments: [mockDepartment],
        staff: [mockStaff, mockSupervisor],
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

    staffService = new StaffService(mockDb);
  });

  describe('findById', () => {
    it('should return staff when found by ID', () => {
      const result = staffService.findById('staff-1');
      expect(result).toEqual(mockStaff);
    });

    it('should return undefined when staff not found by ID', () => {
      const result = staffService.findById('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should return staff when found by email', () => {
      const result = staffService.findByEmail('john.doe@test.com');
      expect(result).toEqual(mockStaff);
    });

    it('should return undefined when staff not found by email', () => {
      const result = staffService.findByEmail('nonexistent@test.com');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllStaff', () => {
    it('should return all staff members', () => {
      const result = staffService.getAllStaff();
      expect(result).toHaveLength(2);
      expect(result).toContain(mockStaff);
      expect(result).toContain(mockSupervisor);
    });
  });

  describe('getStaffByOrganization', () => {
    it('should return staff for a specific organization', () => {
      const result = staffService.getStaffByOrganization('org-1');
      expect(result).toHaveLength(2);
      expect(result).toContain(mockStaff);
      expect(result).toContain(mockSupervisor);
    });

    it('should return empty array for non-existent organization', () => {
      const result = staffService.getStaffByOrganization('org-nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('getStaffByDepartment', () => {
    it('should return staff for a specific department', () => {
      const result = staffService.getStaffByDepartment('dept-1');
      expect(result).toHaveLength(2);
      expect(result).toContain(mockStaff);
      expect(result).toContain(mockSupervisor);
    });

    it('should return empty array for non-existent department', () => {
      const result = staffService.getStaffByDepartment('dept-nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('getSubordinates', () => {
    beforeEach(() => {
      // Set up supervision hierarchy
      mockDb.data.staff[0].supervisorId = 'staff-2';
    });

    it('should return subordinates of a supervisor', () => {
      const result = staffService.getSubordinates('staff-2');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockStaff);
    });

    it('should return empty array for staff with no subordinates', () => {
      const result = staffService.getSubordinates('staff-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('createStaff', () => {
    const createStaffInput: CreateStaffInput = {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@test.com',
      phone: '+1234567892',
      role: 'Developer',
      organizationId: 'org-1',
      departmentId: 'dept-1',
      supervisorId: 'staff-2',
    };

    it('should create new staff successfully', async () => {
      const result = await staffService.createStaff(createStaffInput);

      expect(result).toMatchObject({
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@test.com',
        phone: '+1234567892',
        role: 'Developer',
        organizationId: 'org-1',
        departmentId: 'dept-1',
        supervisorId: 'staff-2',
      });
      expect(result.id).toBeDefined();
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when email already exists', async () => {
      const duplicateInput = { ...createStaffInput, email: 'john.doe@test.com' };
      
      await expect(staffService.createStaff(duplicateInput)).rejects.toThrow('Email already in use');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when organization not found', async () => {
      const invalidInput = { ...createStaffInput, organizationId: 'org-invalid' };
      
      await expect(staffService.createStaff(invalidInput)).rejects.toThrow('Organization not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when department not found', async () => {
      const invalidInput = { ...createStaffInput, departmentId: 'dept-invalid' };
      
      await expect(staffService.createStaff(invalidInput)).rejects.toThrow(
        'Department not found or does not belong to the specified organization'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when department belongs to different organization', async () => {
      // Add department for different organization
      const otherDept: Department = {
        id: 'dept-2',
        name: 'Other Dept',
        description: 'Other Department',
        organizationId: 'org-2',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(otherDept);

      const invalidInput = { ...createStaffInput, departmentId: 'dept-2' };
      
      await expect(staffService.createStaff(invalidInput)).rejects.toThrow(
        'Department not found or does not belong to the specified organization'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when supervisor not found', async () => {
      const invalidInput = { ...createStaffInput, supervisorId: 'supervisor-invalid' };
      
      await expect(staffService.createStaff(invalidInput)).rejects.toThrow(
        'Supervisor not found or does not belong to the same organization'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when supervisor belongs to different organization', async () => {
      // Add staff from different organization
      const otherOrgStaff: Staff = {
        id: 'staff-3',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@test.com',
        phone: '+1234567893',
        role: 'Manager',
        organizationId: 'org-2',
        departmentId: 'dept-2',
        supervisorId: undefined,
      };
      mockDb.data.staff.push(otherOrgStaff);

      const invalidInput = { ...createStaffInput, supervisorId: 'staff-3' };
      
      await expect(staffService.createStaff(invalidInput)).rejects.toThrow(
        'Supervisor not found or does not belong to the same organization'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should create staff without supervisor', async () => {
      const inputWithoutSupervisor = { ...createStaffInput, supervisorId: undefined };
      
      const result = await staffService.createStaff(inputWithoutSupervisor);
      
      expect(result.supervisorId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('updateStaff', () => {
    const updateStaffInput: UpdateStaffInput = {
      id: 'staff-1',
      firstName: 'Johnny',
      email: 'johnny.doe@test.com',
    };

    it('should update staff successfully', async () => {
      const result = await staffService.updateStaff(updateStaffInput);

      expect(result.firstName).toBe('Johnny');
      expect(result.email).toBe('johnny.doe@test.com');
      expect(result.lastName).toBe('Doe'); // Unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when staff not found', async () => {
      const invalidUpdate = { ...updateStaffInput, id: 'staff-invalid' };
      
      await expect(staffService.updateStaff(invalidUpdate)).rejects.toThrow('Staff member not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when email already in use by another staff', async () => {
      const conflictUpdate = { ...updateStaffInput, email: 'jane.smith@test.com' };
      
      await expect(staffService.updateStaff(conflictUpdate)).rejects.toThrow('Email already in use');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should allow updating to same email', async () => {
      const sameEmailUpdate = { ...updateStaffInput, email: 'john.doe@test.com' };
      
      const result = await staffService.updateStaff(sameEmailUpdate);
      
      expect(result.email).toBe('john.doe@test.com');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should update department when valid', async () => {
      // Add another department
      const newDept: Department = {
        id: 'dept-2',
        name: 'Marketing',
        description: 'Marketing Department',
        organizationId: 'org-1',
        parentDepartmentId: undefined,
        managerId: undefined,
      };
      mockDb.data.departments.push(newDept);

      const deptUpdate = { ...updateStaffInput, departmentId: 'dept-2' };
      
      const result = await staffService.updateStaff(deptUpdate);
      
      expect(result.departmentId).toBe('dept-2');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when department not found or belongs to different organization', async () => {
      const invalidDeptUpdate = { ...updateStaffInput, departmentId: 'dept-invalid' };
      
      await expect(staffService.updateStaff(invalidDeptUpdate)).rejects.toThrow(
        'Department not found or does not belong to the same organization'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should update supervisor when valid', async () => {
      const supervisorUpdate = { ...updateStaffInput, supervisorId: 'staff-2' };
      
      const result = await staffService.updateStaff(supervisorUpdate);
      
      expect(result.supervisorId).toBe('staff-2');
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when supervisor not found', async () => {
      const invalidSupervisorUpdate = { ...updateStaffInput, supervisorId: 'supervisor-invalid' };
      
      await expect(staffService.updateStaff(invalidSupervisorUpdate)).rejects.toThrow(
        'Supervisor not found or does not belong to the same organization'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when staff tries to supervise themselves', async () => {
      const selfSupervisorUpdate = { ...updateStaffInput, supervisorId: 'staff-1' };
      
      await expect(staffService.updateStaff(selfSupervisorUpdate)).rejects.toThrow(
        'Staff member cannot supervise themselves'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when update would create circular supervision', async () => {
      // Set up hierarchy: staff-2 supervises staff-1
      mockDb.data.staff[0].supervisorId = 'staff-2';
      
      // Try to make staff-2 report to staff-1 (would create circle)
      const circularUpdate = { id: 'staff-2', supervisorId: 'staff-1' };
      
      await expect(staffService.updateStaff(circularUpdate)).rejects.toThrow(
        'Update would create circular supervision hierarchy'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should not update supervisor when set to undefined', async () => {
      // First set a supervisor
      const originalSupervisorId = mockDb.data.staff[0].supervisorId;
      
      const clearSupervisorUpdate = { ...updateStaffInput, supervisorId: undefined };
      
      const result = await staffService.updateStaff(clearSupervisorUpdate);
      
      expect(result.supervisorId).toBe(originalSupervisorId); // Should remain unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('deleteStaff', () => {
    it('should delete staff successfully when no dependencies', async () => {
      const result = await staffService.deleteStaff('staff-1');

      expect(result).toBe(true);
      expect(mockDb.data.staff).toHaveLength(1);
      expect(mockDb.data.staff[0]).toEqual(mockSupervisor);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should return false when staff not found', async () => {
      const result = await staffService.deleteStaff('staff-invalid');

      expect(result).toBe(false);
      expect(mockDb.data.staff).toHaveLength(2);
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when staff has subordinates', async () => {
      // Set up supervision hierarchy
      mockDb.data.staff[0].supervisorId = 'staff-2';

      await expect(staffService.deleteStaff('staff-2')).rejects.toThrow(
        'Cannot delete staff member who has subordinates or manages departments'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when staff manages departments', async () => {
      // Set staff as department manager
      mockDb.data.departments[0].managerId = 'staff-1';

      await expect(staffService.deleteStaff('staff-1')).rejects.toThrow(
        'Cannot delete staff member who has subordinates or manages departments'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should clear root staff reference from organization when deleting root staff', async () => {
      // Use a staff member without dependencies for this test
      // Set staff-2 as root staff of organization (staff-2 might have dependencies from other tests)
      // So let's create a clean staff member just for this test
      const cleanStaff: Staff = {
        id: 'staff-clean',
        firstName: 'Clean',
        lastName: 'Staff',
        email: 'clean.staff@test.com',
        role: 'Engineer',
        organizationId: 'org-1',
        departmentId: 'dept-1',
        supervisorId: undefined,
      };
      mockDb.data.staff.push(cleanStaff);
      mockDb.data.organizations[0].rootStaffId = 'staff-clean';

      const result = await staffService.deleteStaff('staff-clean');

      expect(result).toBe(true);
      expect(mockDb.data.organizations[0].rootStaffId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('getStaffWithStats', () => {
    beforeEach(() => {
      // Reset staff array to ensure clean state with fresh objects
      const freshMockStaff: Staff = {
        id: 'staff-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+1234567890',
        role: 'Engineer',
        organizationId: 'org-1',
        departmentId: 'dept-1',
        supervisorId: 'staff-2',
      };

      const freshMockSupervisor: Staff = {
        id: 'staff-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
        phone: '+1234567891',
        role: 'Manager',
        organizationId: 'org-1',
        departmentId: 'dept-1',
        supervisorId: undefined,
      };

      mockDb.data.staff = [freshMockStaff, freshMockSupervisor];
      
      // Add another subordinate that also reports to staff-2
      const subordinate: Staff = {
        id: 'staff-3',
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob.wilson@test.com',
        phone: '+1234567893',
        role: 'Developer',
        organizationId: 'org-1',
        departmentId: 'dept-1',
        supervisorId: 'staff-2',
      };
      mockDb.data.staff.push(subordinate);
    });

    it('should return staff with subordinate counts', () => {
      const result = staffService.getStaffWithStats();

      expect(result).toHaveLength(3);
      
      const supervisor = result.find(s => s.id === 'staff-2');
      expect(supervisor?.subordinateCount).toBe(2);
      
      const subordinate = result.find(s => s.id === 'staff-1');
      expect(subordinate?.subordinateCount).toBe(0);
    });

    it('should filter by organization ID', () => {
      // Add staff from different organization
      const otherOrgStaff: Staff = {
        id: 'staff-4',
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@test.com',
        phone: '+1234567894',
        role: 'Manager',
        organizationId: 'org-2',
        departmentId: 'dept-2',
        supervisorId: undefined,
      };
      mockDb.data.staff.push(otherOrgStaff);

      const result = staffService.getStaffWithStats('org-1');

      expect(result).toHaveLength(3);
      expect(result.every(s => s.organizationId === 'org-1')).toBe(true);
    });

    it('should filter by department ID', () => {
      // Add staff from different department
      const otherDeptStaff: Staff = {
        id: 'staff-4',
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice.brown@test.com',
        phone: '+1234567894',
        role: 'Manager',
        organizationId: 'org-1',
        departmentId: 'dept-2',
        supervisorId: undefined,
      };
      mockDb.data.staff.push(otherDeptStaff);

      const result = staffService.getStaffWithStats(undefined, 'dept-1');

      expect(result).toHaveLength(3);
      expect(result.every(s => s.departmentId === 'dept-1')).toBe(true);
    });

    it('should filter by both organization and department ID', () => {
      const result = staffService.getStaffWithStats('org-1', 'dept-1');

      expect(result).toHaveLength(3);
      expect(result.every(s => s.organizationId === 'org-1' && s.departmentId === 'dept-1')).toBe(true);
    });
  });
});
