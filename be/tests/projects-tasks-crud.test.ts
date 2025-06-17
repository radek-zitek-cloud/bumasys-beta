import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;
let authToken: string;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'projects-tasks-db.json');
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());

  // Register and authenticate a user to get auth token
  const registerRes = await request(app)
    .post('/graphql')
    .send({
      query: `
        mutation {
          register(email: "test@example.com", password: "password123") {
            token
          }
        }
      `,
    });
  authToken = registerRes.body.data.register.token;
});

describe('Projects and Tasks CRUD', () => {
  let organizationId: string;
  let departmentId: string;
  let staffId: string;
  let statusId: string;
  let priorityId: string;
  let complexityId: string;
  let projectId: string;
  let taskId: string;

  test('setup organization, department, and staff', async () => {
    // Create organization
    const orgRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createOrganization(name: "Test Org", description: "Test organization") {
              id
              name
            }
          }
        `,
      });

    expect(orgRes.body.data.createOrganization).toBeTruthy();
    organizationId = orgRes.body.data.createOrganization.id;

    // Create department
    const deptRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createDepartment(
              name: "Engineering"
              description: "Engineering department"
              organizationId: "${organizationId}"
            ) {
              id
              name
            }
          }
        `,
      });

    expect(deptRes.body.data.createDepartment).toBeTruthy();
    departmentId = deptRes.body.data.createDepartment.id;

    // Create staff
    const staffRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createStaff(
              firstName: "John"
              lastName: "Doe"
              email: "john.doe@example.com"
              role: "Developer"
              organizationId: "${organizationId}"
              departmentId: "${departmentId}"
            ) {
              id
              firstName
              lastName
            }
          }
        `,
      });

    expect(staffRes.body.data.createStaff).toBeTruthy();
    staffId = staffRes.body.data.createStaff.id;
  });

  test('create reference data', async () => {
    // Create status
    const statusRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createStatus(name: "In Progress") {
              id
              name
            }
          }
        `,
      });

    expect(statusRes.body.data.createStatus).toBeTruthy();
    expect(statusRes.body.data.createStatus.name).toBe('In Progress');
    statusId = statusRes.body.data.createStatus.id;

    // Create priority
    const priorityRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createPriority(name: "High") {
              id
              name
            }
          }
        `,
      });

    expect(priorityRes.body.data.createPriority).toBeTruthy();
    expect(priorityRes.body.data.createPriority.name).toBe('High');
    priorityId = priorityRes.body.data.createPriority.id;

    // Create complexity
    const complexityRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createComplexity(name: "Medium") {
              id
              name
            }
          }
        `,
      });

    expect(complexityRes.body.data.createComplexity).toBeTruthy();
    expect(complexityRes.body.data.createComplexity.name).toBe('Medium');
    complexityId = complexityRes.body.data.createComplexity.id;
  });

  test('create and manage project', async () => {
    // Create project
    const createRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createProject(
              name: "Test Project"
              description: "A test project"
              leadStaffId: "${staffId}"
              plannedStartDate: "2024-01-01"
              plannedEndDate: "2024-12-31"
            ) {
              id
              name
              description
              leadStaffId
              plannedStartDate
              plannedEndDate
            }
          }
        `,
      });

    expect(createRes.body.data.createProject).toBeTruthy();
    expect(createRes.body.data.createProject.name).toBe('Test Project');
    expect(createRes.body.data.createProject.leadStaffId).toBe(staffId);
    projectId = createRes.body.data.createProject.id;

    // Update project
    const updateRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            updateProject(
              id: "${projectId}"
              name: "Updated Test Project"
              actualStartDate: "2024-01-15"
            ) {
              id
              name
              actualStartDate
            }
          }
        `,
      });

    expect(updateRes.body.data.updateProject).toBeTruthy();
    expect(updateRes.body.data.updateProject.name).toBe('Updated Test Project');
    expect(updateRes.body.data.updateProject.actualStartDate).toBe(
      '2024-01-15',
    );

    // Query projects
    const queryRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            projects {
              id
              name
              description
            }
          }
        `,
      });

    expect(queryRes.body.data.projects).toBeTruthy();
    expect(queryRes.body.data.projects.length).toBe(1);
    expect(queryRes.body.data.projects[0].name).toBe('Updated Test Project');
  });

  test('create and manage task', async () => {
    // Create task
    const createRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createTask(
              name: "Test Task"
              description: "A test task"
              projectId: "${projectId}"
              evaluatorId: "${staffId}"
              statusId: "${statusId}"
              priorityId: "${priorityId}"
              complexityId: "${complexityId}"
              plannedStartDate: "2024-02-01"
              plannedEndDate: "2024-03-01"
            ) {
              id
              name
              description
              projectId
              evaluatorId
              statusId
              priorityId
              complexityId
            }
          }
        `,
      });

    expect(createRes.body.data.createTask).toBeTruthy();
    expect(createRes.body.data.createTask.name).toBe('Test Task');
    expect(createRes.body.data.createTask.projectId).toBe(projectId);
    expect(createRes.body.data.createTask.statusId).toBe(statusId);
    taskId = createRes.body.data.createTask.id;

    // Update task
    const updateRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            updateTask(
              id: "${taskId}"
              name: "Updated Test Task"
              actualStartDate: "2024-02-05"
            ) {
              id
              name
              actualStartDate
            }
          }
        `,
      });

    expect(updateRes.body.data.updateTask).toBeTruthy();
    expect(updateRes.body.data.updateTask.name).toBe('Updated Test Task');
    expect(updateRes.body.data.updateTask.actualStartDate).toBe('2024-02-05');

    // Query tasks
    const queryRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            tasks {
              id
              name
              description
              projectId
            }
          }
        `,
      });

    expect(queryRes.body.data.tasks).toBeTruthy();
    expect(queryRes.body.data.tasks.length).toBe(1);
    expect(queryRes.body.data.tasks[0].name).toBe('Updated Test Task');
  });

  test('task assignments and relationships', async () => {
    // Assign staff to task
    const assignRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            assignStaffToTask(taskId: "${taskId}", staffId: "${staffId}")
          }
        `,
      });

    expect(assignRes.body.data.assignStaffToTask).toBe(true);

    // Create task progress report
    const progressRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation {
            createTaskProgress(
              taskId: "${taskId}"
              reportDate: "2024-02-10"
              progressPercent: 50
              notes: "Making good progress"
            ) {
              id
              taskId
              progressPercent
              notes
            }
          }
        `,
      });

    expect(progressRes.body.data.createTaskProgress).toBeTruthy();
    expect(progressRes.body.data.createTaskProgress.progressPercent).toBe(50);
    expect(progressRes.body.data.createTaskProgress.notes).toBe(
      'Making good progress',
    );
  });

  test('query reference data', async () => {
    // Query statuses
    const statusRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            statuses {
              id
              name
            }
          }
        `,
      });

    expect(statusRes.body.data.statuses).toBeTruthy();
    expect(statusRes.body.data.statuses.length).toBe(1);
    expect(statusRes.body.data.statuses[0].name).toBe('In Progress');

    // Query priorities
    const priorityRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            priorities {
              id
              name
            }
          }
        `,
      });

    expect(priorityRes.body.data.priorities).toBeTruthy();
    expect(priorityRes.body.data.priorities.length).toBe(1);
    expect(priorityRes.body.data.priorities[0].name).toBe('High');

    // Query complexities
    const complexityRes = await request(app)
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          query {
            complexities {
              id
              name
            }
          }
        `,
      });

    expect(complexityRes.body.data.complexities).toBeTruthy();
    expect(complexityRes.body.data.complexities.length).toBe(1);
    expect(complexityRes.body.data.complexities[0].name).toBe('Medium');
  });
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'projects-tasks-db.json');
});
