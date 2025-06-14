/**
 * @fileoverview Main application entry point
 *
 * This module sets up the Express server with Apollo GraphQL server,
 * configures middleware, initializes the database, and starts the server.
 * It serves as the main orchestrator for the entire backend application.
 */

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createDatabase } from './utils/database.utils';
import type { Database } from './types';
import config from './utils/config';
import logger from './utils/logger';
import { typeDefs } from './schema';
import { resolvers, initializeResolvers } from './resolvers';
import { createGraphQLContext, initializeAuthMiddleware } from './middleware';
import {
  AuthService,
  UserService,
  OrganizationService,
  DepartmentService,
  StaffService,
  StatusService,
  PriorityService,
  ComplexityService,
  ProjectService,
  TaskService,
  TaskProgressService,
  TaskEvaluationService,
  TaskStatusReportService,
  ProjectStatusReportService,
} from './services';
import { validateDatabase } from './utils';

/**
 * Application configuration and instances
 */
interface AppInstances {
  /** Express application instance */
  app: express.Application;
  /** Apollo GraphQL server instance */
  server: ApolloServer;
  /** Database instance */
  db: Database;
  /** Authentication service instance */
  authService: AuthService;
  /** User service instance */
  userService: UserService;
  /** Organization service instance */
  organizationService: OrganizationService;
  /** Department service instance */
  departmentService: DepartmentService;
  /** Staff service instance */
  staffService: StaffService;
}

/**
 * Create and configure the Express application with Apollo GraphQL server
 *
 * This function:
 * 1. Initializes the database
 * 2. Sets up service instances
 * 3. Configures Apollo Server with GraphQL schema
 * 4. Sets up Express middleware for GraphQL endpoint
 * 5. Configures authentication context
 *
 * @returns Promise resolving to application instances
 */
export async function createApp(): Promise<AppInstances> {
  logger.info('Starting application initialization...');

  // Initialize Express application
  const app = express();

  // Initialize database
  logger.info('Initializing database...');
  const db = await createDatabase(config.dbFile);
  await validateDatabase(db);

  // Initialize services
  logger.info('Setting up services...');
  const authService = new AuthService(db);
  const userService = new UserService(db);
  const organizationService = new OrganizationService(db);
  const departmentService = new DepartmentService(db);
  const staffService = new StaffService(db);
  const statusService = new StatusService(db);
  const priorityService = new PriorityService(db);
  const complexityService = new ComplexityService(db);
  const projectService = new ProjectService(db);
  const taskService = new TaskService(db);
  const taskProgressService = new TaskProgressService(db);
  const taskEvaluationService = new TaskEvaluationService(db);
  const taskStatusReportService = new TaskStatusReportService(db);
  const projectStatusReportService = new ProjectStatusReportService(db);

  // Initialize resolvers with all services
  initializeResolvers(
    authService,
    userService,
    organizationService,
    departmentService,
    staffService,
    statusService,
    priorityService,
    complexityService,
    projectService,
    taskService,
    taskProgressService,
    taskEvaluationService,
    taskStatusReportService,
    projectStatusReportService,
  );

  // Initialize middleware with services
  initializeAuthMiddleware(authService, userService);

  // Initialize Apollo Server with GraphQL schema
  logger.info('Setting up GraphQL server...');
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // Enable GraphQL Playground in development
    introspection: process.env.NODE_ENV !== 'production',
  });

  // Start Apollo Server
  await server.start();
  logger.info('Apollo Server started successfully');

  // Configure Express middleware for GraphQL
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: createGraphQLContext,
    }),
  );

  // Health check endpoint (REST)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: Boolean(db),
    });
  });

  // Basic error handling middleware
  app.use(
    (
      err: Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      logger.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    },
  );

  logger.info('Application initialization completed');

  return {
    app,
    server,
    db,
    authService,
    userService,
    organizationService,
    departmentService,
    staffService,
  };
}

/**
 * Start the HTTP server and begin listening for requests
 *
 * @returns Promise that resolves when the server is listening
 */
export async function start(): Promise<void> {
  try {
    const { app } = await createApp();

    const server = app.listen(config.port, () => {
      logger.info(
        `🚀 Server running on http://localhost:${config.port}/graphql`,
      );
      logger.info(
        `📊 Health check available at http://localhost:${config.port}/health`,
      );
      logger.info(
        `🎮 GraphQL Playground available at http://localhost:${config.port}/graphql`,
      );
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  start().catch((err) => {
    logger.error('Fatal error during startup:', err);
    process.exit(1);
  });
}
