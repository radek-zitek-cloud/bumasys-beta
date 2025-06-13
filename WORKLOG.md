2025-06-13

- Added navigation drawer toggle and theme switcher in App.vue.
- Updated README with project sections.
- Created WORKLOG to track development actions.
- Fixed ESLint warnings in router configuration.
  2025-06-13
- Implemented mock navigation items with icons and descriptions in the navigation drawer.
- Ran pnpm lint and type-check to ensure code quality.
  2025-06-13
- Added Express/Apollo backend with JWT auth skeleton and tests.
- Integrated ESLint, Prettier, Jest and Supertest.
- Updated README with backend instructions.
  2025-06-13
- Added dedicated pages for all navigation drawer items and updated the drawer links.
- Introduced Home item leading to the main page.
- Updated README examples section and ran pnpm lint and type-check.
  2025-06-13
- Migrated backend to TypeScript and upgraded to @apollo/server.
- Updated eslint to handle TS and added ts-jest configuration.
- Adjusted README with TypeScript instructions.
- Ran npm run lint and npm test to ensure code quality.
  2025-06-13
- Replaced deprecated body-parser usage with express.json in the backend.
- Installed dependencies and executed npm run lint and npm test.
- Installed front-end dependencies and ran pnpm lint to verify.
  2025-06-13
- Switched backend configuration to use node-config with JSON files in be/config.
- Updated tests and README accordingly.
- Ran npm run lint and npm test to verify.
  2025-06-13
- Implemented refresh tokens and logout invalidation in backend.
- Added unit tests for refresh and logout.
- Updated README with refresh token usage.
- Added environment variable override mapping and related tests.
- Updated README with override instructions.
- Ran npm run lint and npm test.
  2025-06-13
- Added health GraphQL query and resolver returning readiness state.
- Documented usage in README and added health tests.
- Ran npm install, lint and tests.
  2025-06-13
- Configured Vite dev server proxy to backend GraphQL on port 4000.
- Updated README with proxy note.
- Ran pnpm install, lint, and npm install, lint, test.
- Display backend readiness in the front-end footer using the health query.
- Updated README with footer description.
- Ran pnpm lint, npm run lint and npm test.
  2025-06-13
- Added authentication menu with two states using Pinia.
- Created reusable dialog cards for login, registration, password reset, profile, password change and logout.
- Documented the menu behaviour in README.
- Ran pnpm lint in `fe` and npm run lint & npm test in `be`.
  2025-06-13
- Adjusted authentication dialogs to open below the app bar on the top-right.
- Documented UI change in README.
- Ran pnpm lint in `fe` and npm run lint & npm test in `be`.
  2025-06-13
- Added optional firstName, lastName and note fields to user model and implemented authenticated CRUD GraphQL operations.
- Wrote unit tests covering user CRUD operations.
- Updated README with new user fields and CRUD operation summary.
- Ran npm lint and test to ensure quality.
  2025-06-13
- Fixed TypeScript type errors in backend auth token generation.
- Cast JWT expiration config values to ms.StringValue and adjusted imports.
- Ran npm lint and tests successfully after patch.
2025-06-13
- Connected frontend authentication dialogs to backend GraphQL services using fetch-based API helpers.
- Added auth store fields for tokens and user data.
- Updated README with note about dialogs communicating with the API.
- Adjusted config environment test secret length to pass validation.
