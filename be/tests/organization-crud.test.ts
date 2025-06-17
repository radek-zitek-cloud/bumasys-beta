import type { Application } from 'express';
import request from 'supertest';
import { createApp } from '../src/index';
import { setupTestDatabase, cleanupTestDatabases } from './test-utils';

let app: Application;

beforeAll(async () => {
  const dbFile = setupTestDatabase(__dirname, 'organization-db.json');
  const config = require('../src/utils/config').default;
  config.dbFile = dbFile;
  ({ app } = await createApp());
});

describe('Organization CRUD', () => {
  let authToken: string;
  let organizationId: string;
  let departmentId: string;
  let staffId: string;

  beforeAll(async () => {
    // Register a user to get auth token
    const reg = await request(app).post('/graphql').send({
      query: `mutation { register(email: "admin@example.com", password: "password123") { token } }`,
    });
    authToken = reg.body.data.register.token;
  });

  describe('Organization Operations', () => {
    test('create organization', async () => {
      const mutation = `
        mutation {
          createOrganization(
            name: "Test Corporation"
            description: "A test organization"
          ) {
            id
            name
            description
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: mutation });

      expect(res.body.data.createOrganization).toBeTruthy();
      expect(res.body.data.createOrganization.name).toBe('Test Corporation');
      expect(res.body.data.createOrganization.description).toBe(
        'A test organization',
      );
      organizationId = res.body.data.createOrganization.id;
    });

    test('get all organizations', async () => {
      const query = `
        query {
          organizations {
            id
            name
            description
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query });

      expect(res.body.data.organizations).toHaveLength(1);
      expect(res.body.data.organizations[0].name).toBe('Test Corporation');
    });

    test('get organization by id', async () => {
      const query = `
        query($id: ID!) {
          organization(id: $id) {
            id
            name
            description
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query,
          variables: { id: organizationId },
        });

      expect(res.body.data.organization).toBeTruthy();
      expect(res.body.data.organization.name).toBe('Test Corporation');
    });

    test('update organization', async () => {
      const mutation = `
        mutation($id: ID!) {
          updateOrganization(
            id: $id
            name: "Updated Corporation"
            description: "Updated description"
          ) {
            id
            name
            description
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: { id: organizationId },
        });

      expect(res.body.data.updateOrganization.name).toBe('Updated Corporation');
      expect(res.body.data.updateOrganization.description).toBe(
        'Updated description',
      );
    });

    test('create organization with duplicate name should fail', async () => {
      const mutation = `
        mutation {
          createOrganization(
            name: "Updated Corporation"
          ) {
            id
            name
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: mutation });

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors[0].message).toBe(
        'Organization name already in use',
      );
    });
  });

  describe('Department Operations', () => {
    test('create department', async () => {
      const mutation = `
        mutation($organizationId: ID!) {
          createDepartment(
            name: "Engineering"
            description: "Software development department"
            organizationId: $organizationId
          ) {
            id
            name
            description
            organizationId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: { organizationId },
        });

      expect(res.body.data.createDepartment).toBeTruthy();
      expect(res.body.data.createDepartment.name).toBe('Engineering');
      expect(res.body.data.createDepartment.organizationId).toBe(
        organizationId,
      );
      departmentId = res.body.data.createDepartment.id;
    });

    test('get departments for organization', async () => {
      const query = `
        query($organizationId: ID) {
          departments(organizationId: $organizationId) {
            id
            name
            organizationId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query,
          variables: { organizationId },
        });

      expect(res.body.data.departments).toHaveLength(1);
      expect(res.body.data.departments[0].name).toBe('Engineering');
    });

    test('create child department', async () => {
      const mutation = `
        mutation($organizationId: ID!, $parentDepartmentId: ID!) {
          createDepartment(
            name: "Frontend Team"
            organizationId: $organizationId
            parentDepartmentId: $parentDepartmentId
          ) {
            id
            name
            parentDepartmentId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: {
            organizationId,
            parentDepartmentId: departmentId,
          },
        });

      expect(res.body.data.createDepartment).toBeTruthy();
      expect(res.body.data.createDepartment.parentDepartmentId).toBe(
        departmentId,
      );
    });

    test('create department with invalid organization should fail', async () => {
      const mutation = `
        mutation {
          createDepartment(
            name: "Invalid Dept"
            organizationId: "invalid-id"
          ) {
            id
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ query: mutation });

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors[0].message).toBe('Organization not found');
    });
  });

  describe('Staff Operations', () => {
    test('create staff member', async () => {
      const mutation = `
        mutation($organizationId: ID!, $departmentId: ID!) {
          createStaff(
            firstName: "John"
            lastName: "Doe"
            email: "john.doe@example.com"
            phone: "+1234567890"
            role: "Software Engineer"
            organizationId: $organizationId
            departmentId: $departmentId
          ) {
            id
            firstName
            lastName
            email
            role
            organizationId
            departmentId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: {
            organizationId,
            departmentId,
          },
        });

      expect(res.body.data.createStaff).toBeTruthy();
      expect(res.body.data.createStaff.firstName).toBe('John');
      expect(res.body.data.createStaff.email).toBe('john.doe@example.com');
      staffId = res.body.data.createStaff.id;
    });

    test('get staff by organization', async () => {
      const query = `
        query($organizationId: ID) {
          staff(organizationId: $organizationId) {
            id
            firstName
            lastName
            email
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query,
          variables: { organizationId },
        });

      expect(res.body.data.staff).toHaveLength(1);
      expect(res.body.data.staff[0].firstName).toBe('John');
    });

    test('create staff with supervisor', async () => {
      const mutation = `
        mutation($organizationId: ID!, $departmentId: ID!, $supervisorId: ID!) {
          createStaff(
            firstName: "Jane"
            lastName: "Smith"
            email: "jane.smith@example.com"
            role: "Junior Developer"
            organizationId: $organizationId
            departmentId: $departmentId
            supervisorId: $supervisorId
          ) {
            id
            firstName
            supervisorId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: {
            organizationId,
            departmentId,
            supervisorId: staffId,
          },
        });

      expect(res.body.data.createStaff).toBeTruthy();
      expect(res.body.data.createStaff.supervisorId).toBe(staffId);
    });

    test('create staff with duplicate email should fail', async () => {
      const mutation = `
        mutation($organizationId: ID!, $departmentId: ID!) {
          createStaff(
            firstName: "Duplicate"
            lastName: "User"
            email: "john.doe@example.com"
            role: "Tester"
            organizationId: $organizationId
            departmentId: $departmentId
          ) {
            id
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: {
            organizationId,
            departmentId,
          },
        });

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors[0].message).toBe('Email already in use');
    });
  });

  describe('Organization Hierarchy with References', () => {
    test('update organization with root department and staff', async () => {
      const mutation = `
        mutation($id: ID!, $rootDepartmentId: ID!, $rootStaffId: ID!) {
          updateOrganization(
            id: $id
            rootDepartmentId: $rootDepartmentId
            rootStaffId: $rootStaffId
          ) {
            id
            rootDepartmentId
            rootStaffId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: {
            id: organizationId,
            rootDepartmentId: departmentId,
            rootStaffId: staffId,
          },
        });

      expect(res.body.data.updateOrganization.rootDepartmentId).toBe(
        departmentId,
      );
      expect(res.body.data.updateOrganization.rootStaffId).toBe(staffId);
    });

    test('update department with manager', async () => {
      const mutation = `
        mutation($id: ID!, $managerId: ID!) {
          updateDepartment(
            id: $id
            managerId: $managerId
          ) {
            id
            managerId
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: {
            id: departmentId,
            managerId: staffId,
          },
        });

      expect(res.body.data.updateDepartment.managerId).toBe(staffId);
    });

    test('query organization with nested relationships', async () => {
      const query = `
        query($id: ID!) {
          organization(id: $id) {
            id
            name
            rootDepartment {
              id
              name
              manager {
                id
                firstName
                lastName
              }
            }
            rootStaff {
              id
              firstName
              lastName
            }
            departments {
              id
              name
            }
            staff {
              id
              firstName
              lastName
            }
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query,
          variables: { id: organizationId },
        });

      const org = res.body.data.organization;
      expect(org.rootDepartment).toBeTruthy();
      expect(org.rootDepartment.manager).toBeTruthy();
      expect(org.rootStaff).toBeTruthy();
      expect(org.departments.length).toBeGreaterThan(0);
      expect(org.staff.length).toBeGreaterThan(0);
    });
  });

  describe('Deletion with Dependency Checks', () => {
    test('delete staff with dependencies should fail', async () => {
      const mutation = `
        mutation($id: ID!) {
          deleteStaff(id: $id)
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: { id: staffId },
        });

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors[0].message).toContain(
        'Cannot delete staff member',
      );
    });

    test('delete department with dependencies should fail', async () => {
      const mutation = `
        mutation($id: ID!) {
          deleteDepartment(id: $id)
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: { id: departmentId },
        });

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors[0].message).toContain('Cannot delete department');
    });

    test('delete organization with dependencies should fail', async () => {
      const mutation = `
        mutation($id: ID!) {
          deleteOrganization(id: $id)
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: mutation,
          variables: { id: organizationId },
        });

      expect(res.body.errors).toBeTruthy();
      expect(res.body.errors[0].message).toContain(
        'Cannot delete organization',
      );
    });
  });

  describe('Authentication Requirements', () => {
    test('queries require authentication', async () => {
      const query = `query { organizations { id } }`;

      const res = await request(app).post('/graphql').send({ query });

      expect(res.body.errors[0].message).toBe('Unauthenticated');
    });

    test('mutations require authentication', async () => {
      const mutation = `
        mutation {
          createOrganization(name: "Test") {
            id
          }
        }
      `;

      const res = await request(app).post('/graphql').send({ query: mutation });

      expect(res.body.errors[0].message).toBe('Unauthenticated');
    });
  });
});

afterAll(() => {
  cleanupTestDatabases(__dirname, 'organization-db.json');
});
