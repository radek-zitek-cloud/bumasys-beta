/**
 * @fileoverview Unit tests for project service
 */

import { ProjectService } from '../../../src/services/project.service';
import type {
  Database,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Staff,
  Task,
  ProjectStatusReport,
} from '../../../src/types';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mockDb: Database;

  const mockStaff: Staff = {
    id: 'staff-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@test.com',
    phone: '+1234567890',
    role: 'Project Manager',
    organizationId: 'org-1',
    departmentId: 'dept-1',
    supervisorId: undefined,
  };

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'A test project',
    leadStaffId: 'staff-1',
    plannedStartDate: '2024-01-01',
    plannedEndDate: '2024-12-31',
    actualStartDate: '2024-01-15',
    actualEndDate: undefined,
  };

  const mockTask: Task = {
    id: 'task-1',
    name: 'Test Task',
    description: 'A test task',
    projectId: 'project-1',
    parentTaskId: undefined,
    evaluatorId: 'staff-1',
    statusId: 'status-1',
    priorityId: 'priority-1',
    complexityId: 'complexity-1',
    plannedStartDate: '2024-01-01',
    plannedEndDate: '2024-01-31',
    actualStartDate: undefined,
    actualEndDate: undefined,
  };

  const mockProjectStatusReport: ProjectStatusReport = {
    id: 'report-1',
    projectId: 'project-1',
    reportDate: '2024-01-15',
    statusSummary: 'Project is progressing well',
  };

  beforeEach(() => {
    mockDb = {
      data: {
        users: [],
        sessions: [],
        organizations: [],
        departments: [],
        staff: [mockStaff],
        projects: [mockProject],
        tasks: [mockTask],
        taskAssignees: [],
        taskPredecessors: [],
        priorities: [],
        statuses: [],
        complexities: [],
        taskEvaluations: [],
        taskProgress: [],
        taskStatusReports: [],
        projectStatusReports: [mockProjectStatusReport],
        teams: [],
        teamMembers: [],
      },
      write: jest.fn().mockResolvedValue(undefined),
    };

    projectService = new ProjectService(mockDb);
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const result = await projectService.getAllProjects();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockProject);
    });

    it('should return empty array when no projects exist', async () => {
      mockDb.data.projects = [];

      const result = await projectService.getAllProjects();

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return project when found by ID', async () => {
      const result = await projectService.findById('project-1');

      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found by ID', async () => {
      const result = await projectService.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    const createProjectInput: CreateProjectInput = {
      name: 'New Project',
      description: 'A new project',
      leadStaffId: 'staff-1',
      plannedStartDate: '2024-02-01',
      plannedEndDate: '2024-11-30',
      actualStartDate: undefined,
      actualEndDate: undefined,
    };

    it('should create new project successfully', async () => {
      const result = await projectService.createProject(createProjectInput);

      expect(result).toMatchObject({
        name: 'New Project',
        description: 'A new project',
        leadStaffId: 'staff-1',
        plannedStartDate: '2024-02-01',
        plannedEndDate: '2024-11-30',
        actualStartDate: undefined,
        actualEndDate: undefined,
      });
      expect(result.id).toBeDefined();
      expect(mockDb.data.projects).toHaveLength(2);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should create project without lead staff', async () => {
      const inputWithoutLead = {
        ...createProjectInput,
        leadStaffId: undefined,
      };

      const result = await projectService.createProject(inputWithoutLead);

      expect(result.leadStaffId).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when lead staff not found', async () => {
      const invalidInput = {
        ...createProjectInput,
        leadStaffId: 'staff-invalid',
      };

      await expect(projectService.createProject(invalidInput)).rejects.toThrow(
        'Lead staff member not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when planned start date is after planned end date', async () => {
      const invalidInput = {
        ...createProjectInput,
        plannedStartDate: '2024-12-01',
        plannedEndDate: '2024-01-01',
      };

      await expect(projectService.createProject(invalidInput)).rejects.toThrow(
        'Planned start date must be before planned end date',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when actual start date is after actual end date', async () => {
      const invalidInput = {
        ...createProjectInput,
        actualStartDate: '2024-12-01',
        actualEndDate: '2024-01-01',
      };

      await expect(projectService.createProject(invalidInput)).rejects.toThrow(
        'Actual start date must be before actual end date',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should allow equal planned start and end dates', async () => {
      const inputWithEqualDates = {
        ...createProjectInput,
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-01',
      };

      await expect(
        projectService.createProject(inputWithEqualDates),
      ).rejects.toThrow('Planned start date must be before planned end date');
    });

    it('should create project with only start date', async () => {
      const inputWithOnlyStart = {
        ...createProjectInput,
        plannedStartDate: '2024-02-01',
        plannedEndDate: undefined,
      };

      const result = await projectService.createProject(inputWithOnlyStart);

      expect(result.plannedStartDate).toBe('2024-02-01');
      expect(result.plannedEndDate).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    const updateProjectInput: UpdateProjectInput = {
      id: 'project-1',
      name: 'Updated Project',
      description: 'An updated project',
    };

    it('should update project successfully', async () => {
      const result = await projectService.updateProject(updateProjectInput);

      expect(result.name).toBe('Updated Project');
      expect(result.description).toBe('An updated project');
      expect(result.leadStaffId).toBe('staff-1'); // Unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when project not found', async () => {
      const invalidUpdate = { ...updateProjectInput, id: 'project-invalid' };

      await expect(projectService.updateProject(invalidUpdate)).rejects.toThrow(
        'Project not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when lead staff not found', async () => {
      const invalidUpdate = {
        ...updateProjectInput,
        leadStaffId: 'staff-invalid',
      };

      await expect(projectService.updateProject(invalidUpdate)).rejects.toThrow(
        'Lead staff member not found',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should not update lead staff when set to undefined', async () => {
      const clearLeadUpdate = { ...updateProjectInput, leadStaffId: undefined };

      const result = await projectService.updateProject(clearLeadUpdate);

      expect(result.leadStaffId).toBe('staff-1'); // Should remain unchanged
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should validate planned dates when both are updated', async () => {
      const invalidDateUpdate = {
        ...updateProjectInput,
        plannedStartDate: '2024-12-01',
        plannedEndDate: '2024-01-01',
      };

      await expect(
        projectService.updateProject(invalidDateUpdate),
      ).rejects.toThrow('Planned start date must be before planned end date');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should validate actual dates when both are updated', async () => {
      const invalidDateUpdate = {
        ...updateProjectInput,
        actualStartDate: '2024-12-01',
        actualEndDate: '2024-01-01',
      };

      await expect(
        projectService.updateProject(invalidDateUpdate),
      ).rejects.toThrow('Actual start date must be before actual end date');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should validate dates using existing values when only one date is updated', async () => {
      // Update only planned end date to be before existing start date
      const invalidDateUpdate = {
        ...updateProjectInput,
        plannedEndDate: '2023-12-31', // Before existing start date of 2024-01-01
      };

      await expect(
        projectService.updateProject(invalidDateUpdate),
      ).rejects.toThrow('Planned start date must be before planned end date');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should update all project fields correctly', async () => {
      const fullUpdate: UpdateProjectInput = {
        id: 'project-1',
        name: 'Fully Updated Project',
        description: 'Fully updated description',
        leadStaffId: 'staff-1',
        plannedStartDate: '2024-02-01',
        plannedEndDate: '2024-12-01',
        actualStartDate: '2024-02-15',
        actualEndDate: '2024-11-15',
      };

      const result = await projectService.updateProject(fullUpdate);

      expect(result).toMatchObject(fullUpdate);
      expect(mockDb.write).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully when no dependencies', async () => {
      // Remove task and status report dependencies
      mockDb.data.tasks = [];
      mockDb.data.projectStatusReports = [];

      const result = await projectService.deleteProject('project-1');

      expect(result).toBe(true);
      expect(mockDb.data.projects).toHaveLength(0);
      expect(mockDb.write).toHaveBeenCalled();
    });

    it('should throw error when project not found', async () => {
      await expect(
        projectService.deleteProject('project-invalid'),
      ).rejects.toThrow('Project not found');
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when project has associated tasks', async () => {
      await expect(projectService.deleteProject('project-1')).rejects.toThrow(
        'Cannot delete project: it has associated tasks',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });

    it('should throw error when project has status reports', async () => {
      // Remove task dependency but keep status report
      mockDb.data.tasks = [];

      await expect(projectService.deleteProject('project-1')).rejects.toThrow(
        'Cannot delete project: it has status reports',
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('getProjectTasks', () => {
    it('should return tasks for a specific project', async () => {
      const result = await projectService.getProjectTasks('project-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockTask);
    });

    it('should return empty array for project with no tasks', async () => {
      const result = await projectService.getProjectTasks(
        'project-nonexistent',
      );

      expect(result).toHaveLength(0);
    });

    it('should filter tasks correctly', async () => {
      // Add task for different project
      const otherProjectTask: Task = {
        id: 'task-2',
        name: 'Other Task',
        description: 'Task for other project',
        projectId: 'project-2',
        parentTaskId: undefined,
        evaluatorId: 'staff-1',
        statusId: 'status-1',
        priorityId: 'priority-1',
        complexityId: 'complexity-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-01-31',
        actualStartDate: undefined,
        actualEndDate: undefined,
      };
      mockDb.data.tasks.push(otherProjectTask);

      const result = await projectService.getProjectTasks('project-1');

      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('project-1');
    });
  });

  describe('getProjectStatusReports', () => {
    it('should return status reports for a specific project', async () => {
      const result = await projectService.getProjectStatusReports('project-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockProjectStatusReport);
    });

    it('should return empty array for project with no status reports', async () => {
      const result = await projectService.getProjectStatusReports(
        'project-nonexistent',
      );

      expect(result).toHaveLength(0);
    });

    it('should filter status reports correctly', async () => {
      // Add status report for different project
      const otherProjectReport: ProjectStatusReport = {
        id: 'report-2',
        projectId: 'project-2',
        reportDate: '2024-01-20',
        statusSummary: 'Project is facing delays',
      };
      mockDb.data.projectStatusReports.push(otherProjectReport);

      const result = await projectService.getProjectStatusReports('project-1');

      expect(result).toHaveLength(1);
      expect(result[0].projectId).toBe('project-1');
    });
  });
});
