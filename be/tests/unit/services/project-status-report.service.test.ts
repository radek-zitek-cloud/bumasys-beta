/**
 * @fileoverview Unit tests for ProjectStatusReportService
 */

import { ProjectStatusReportService } from '../../../src/services/project-status-report.service';
import type {
  Database,
  ProjectStatusReport,
  Project,
  CreateProjectStatusReportInput,
  UpdateProjectStatusReportInput,
} from '../../../src/types';

// Mock database
const createMockDatabase = (): Database => ({
  data: {
    users: [],
    sessions: [],
    organizations: [],
    departments: [],
    staff: [],
    projects: [
      {
        id: 'project-1',
        name: 'Test Project 1',
        description: 'Description 1',
        leadStaffId: 'staff-1',
        plannedStartDate: '2024-01-01',
        plannedEndDate: '2024-06-01',
        actualStartDate: '2024-01-01',
      },
      {
        id: 'project-2',
        name: 'Test Project 2',
        description: 'Description 2',
        leadStaffId: 'staff-2',
        plannedStartDate: '2024-02-01',
        plannedEndDate: '2024-08-01',
        actualStartDate: '2024-02-01',
      },
    ] as Project[],
    tasks: [],
    taskAssignees: [],
    taskPredecessors: [],
    taskStatusReports: [],
    taskProgress: [],
    taskEvaluations: [],
    projectStatusReports: [
      {
        id: 'report-1',
        projectId: 'project-1',
        reportDate: '2024-01-15',
        statusSummary: 'Project kickoff completed',
      },
      {
        id: 'report-2',
        projectId: 'project-1',
        reportDate: '2024-02-15',
        statusSummary: 'Phase 1 milestone reached',
      },
      {
        id: 'report-3',
        projectId: 'project-2',
        reportDate: '2024-02-15',
        statusSummary: 'Different project report',
      },
    ] as ProjectStatusReport[],
    priorities: [],
    statuses: [],
    complexities: [],
    teams: [],
    teamMembers: [],
  },
  write: jest.fn().mockResolvedValue(undefined),
});

describe('ProjectStatusReportService', () => {
  let service: ProjectStatusReportService;
  let mockDb: Database;

  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new ProjectStatusReportService(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProjectStatusReports', () => {
    it('should return all project status reports when no projectId provided', async () => {
      const result = await service.getAllProjectStatusReports();

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockDb.data.projectStatusReports);
    });

    it('should return filtered reports by projectId', async () => {
      const result = await service.getAllProjectStatusReports('project-1');

      expect(result).toHaveLength(2);
      expect(result.every(report => report.projectId === 'project-1')).toBe(true);
      expect(result[0].id).toBe('report-1');
      expect(result[1].id).toBe('report-2');
    });

    it('should return empty array for non-existent projectId', async () => {
      const result = await service.getAllProjectStatusReports('non-existent');

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return report when found', async () => {
      const result = await service.findById('report-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('report-1');
      expect(result?.projectId).toBe('project-1');
      expect(result?.statusSummary).toBe('Project kickoff completed');
    });

    it('should return null when report not found', async () => {
      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createProjectStatusReport', () => {
    it('should create a new project status report successfully', async () => {
      const reportData: CreateProjectStatusReportInput = {
        projectId: 'project-1',
        reportDate: '2024-03-15',
        statusSummary: 'Phase 2 milestone reached',
      };

      const result = await service.createProjectStatusReport(reportData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.projectId).toBe(reportData.projectId);
      expect(result.reportDate).toBe(reportData.reportDate);
      expect(result.statusSummary).toBe(reportData.statusSummary);
      expect(mockDb.data.projectStatusReports).toHaveLength(4);
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when project does not exist', async () => {
      const reportData: CreateProjectStatusReportInput = {
        projectId: 'non-existent-project',
        reportDate: '2024-03-15',
        statusSummary: 'Report for non-existent project',
      };

      await expect(service.createProjectStatusReport(reportData)).rejects.toThrow(
        'Project not found'
      );
      expect(mockDb.data.projectStatusReports).toHaveLength(3);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('updateProjectStatusReport', () => {
    it('should update project status report successfully', async () => {
      const updateData: UpdateProjectStatusReportInput = {
        id: 'report-1',
        reportDate: '2024-01-16',
        statusSummary: 'Updated project status',
      };

      const result = await service.updateProjectStatusReport(updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('report-1');
      expect(result.reportDate).toBe('2024-01-16');
      expect(result.statusSummary).toBe('Updated project status');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should update only provided fields', async () => {
      const originalReport = mockDb.data.projectStatusReports.find(r => r.id === 'report-1')!;
      const originalDate = originalReport.reportDate;

      const updateData: UpdateProjectStatusReportInput = {
        id: 'report-1',
        statusSummary: 'Only summary updated',
      };

      const result = await service.updateProjectStatusReport(updateData);

      expect(result.reportDate).toBe(originalDate); // Should remain unchanged
      expect(result.statusSummary).toBe('Only summary updated');
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when report not found', async () => {
      const updateData: UpdateProjectStatusReportInput = {
        id: 'non-existent',
        statusSummary: 'Updated summary',
      };

      await expect(service.updateProjectStatusReport(updateData)).rejects.toThrow(
        'Project status report not found'
      );
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });

  describe('deleteProjectStatusReport', () => {
    it('should delete project status report successfully', async () => {
      const initialCount = mockDb.data.projectStatusReports.length;

      const result = await service.deleteProjectStatusReport('report-1');

      expect(result).toBe(true);
      expect(mockDb.data.projectStatusReports).toHaveLength(initialCount - 1);
      expect(mockDb.data.projectStatusReports.find(r => r.id === 'report-1')).toBeUndefined();
      expect(mockDb.write).toHaveBeenCalledTimes(1);
    });

    it('should throw error when report not found', async () => {
      const initialCount = mockDb.data.projectStatusReports.length;

      await expect(service.deleteProjectStatusReport('non-existent')).rejects.toThrow(
        'Project status report not found'
      );
      expect(mockDb.data.projectStatusReports).toHaveLength(initialCount);
      expect(mockDb.write).not.toHaveBeenCalled();
    });
  });
});
