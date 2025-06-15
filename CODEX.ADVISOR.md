# Codebase Overview

## Backend (`be`)
- **Stack**: Node.js with TypeScript, Express, Apollo GraphQL.
- **Structure**: Service layer pattern (`services/`) separated from GraphQL resolvers (`resolvers/`). Types live in `types/`. Database utilities provide JSON-file storage for development.
- **Configuration**: Uses `config` package with environment overrides. Critical fields validated via Zod in `src/utils/config.ts`.
- **Logging**: Pino with optional BetterStack transport (`src/utils/logger.ts`).
- **Tests**: Jest for unit and integration tests under `be/tests`. Coverage for auth, user, and complexity services, plus integration tests for config and database migration.
- **Documentation**: Extensive README files per directory, technical debt tracking documents, and code review summary.

## Frontend (`fe`)
- **Stack**: Vue 3 + TypeScript + Vuetify, Vite build. State managed via Pinia, routing via vue-router with auto-generated routes.
- **Structure**: Components, pages, layouts, composables, stores. Auto-import plugins reduce manual imports. Services folder contains API calls and a generic GraphQL client with automatic token refresh.
- **Logging**: Pino-based client logger initialized through a composable. Logs can be forwarded to BetterStack depending on backend configuration.
- **Tests**: Vitest for unit tests, Playwright for end-to-end tests under `fe/tests`.
- **Documentation**: README and folder-specific docs describe usage. Pages include Organization, Teams, Projects/Tasks, Budget, References, Users.

# Identified Weaknesses

## Backend
1. **Lint Errors** – ESLint/Prettier reports many formatting issues (e.g., `team.service.ts`, `user.service.ts`).
2. **Unit Test Failures** – Tests in `tests/logging-config.test.ts`, `dynamic-config.test.ts`, `config-env.test.ts`, and `config-validation.test.ts` fail.
3. **Technical Debt** – `TECHNICAL_DEBT.md` lists missing unit tests for several services, lack of token blacklisting, and case-insensitive email handling.
4. **Database Performance** – JSON file database limits scalability; indexing and a real DB are recommended for production.
5. **Security Enhancements** – Rate limiting, audit logging, and session cleanup on user deletion are marked as TODOs.

## Frontend
1. **Lint Errors** – `pnpm lint` fails due to unused variables and preferred number check in composables.
2. **Unit Test Failures** – Many Vitest component tests fail; missing component imports or expectation mismatches.
3. **E2E Test Setup** – Playwright tests fail because browsers are not installed. Requires running `pnpm exec playwright install` before tests.
4. **Configuration Files** – Frontend config JSON files are mostly empty; dynamic configuration primarily relies on backend.
5. **Error Handling** – Some API functions lack comprehensive error handling; user feedback could be improved (e.g., when fetch fails).

# Suggested Improvements

1. **Fix Linting Issues** – Run ESLint with `--fix` and adjust code formatting to satisfy Prettier rules in both back and front end.
2. **Resolve Failing Tests** – Update tests and code to ensure all unit and integration tests pass. Install Playwright browsers for e2e tests.
3. **Increase Unit Test Coverage** – Add tests for remaining services (TaskService, ProjectService, etc.) as noted in `TECHNICAL_DEBT.md`.
4. **Implement Security TODOs** – Add rate limiting middleware, token blacklisting, and audit logging. Ensure case-insensitive email checks.
5. **Improve Database Layer** – Consider migrating from file-based JSON to a proper database or at least add indexing and cleanup utilities.
6. **Enhance Frontend Error Handling** – Provide user-friendly messages for API failures and add global error boundaries.
7. **Documentation Maintenance** – Keep README, docs, and worklog up to date with new features and configuration instructions.
8. **CI Integration** – Configure continuous integration to run linting and testing automatically on pull requests.

