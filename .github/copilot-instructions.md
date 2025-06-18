## 🧠 AI Agent Custom Instructions

Welcome to the **Fulcrum project**! This document defines the expectations and rules for AI-generated code contributions. The AI agent is expected to follow professional standards, proven patterns for the tech stack in use, and support human developers by producing clean, modular, and well-documented code.

---

## ⚙️ Technology Stack Overview

### General Tooling

- **Node.js** for both backend and frontend
- **pnpm** as the package manager
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality and formatting
- **Git** for version control

### Backend:
- **Runtime:** Node.js
- **Framework:** Express.js
- **API Layer:** Apollo Server with GraphQL
- **Logging:** Pino (structured logging)

### Frontend:
- **Runtime:** Node.js
- **Framework:** Vue 3 (Composition API)
- **UI Library:** Vuetify 3
- **State Management:** Pinia

---

## 📊 General Principles

### Separation of Concerns (SoC):
- Never mix business logic, API handling, and storage concerns.
- Keep GraphQL resolvers thin — delegate to service layers or use-case modules.
- Components should only contain UI logic; fetch/state operations belong in composables or stores.

### Modular Architecture:
- Follow a **feature-based folder structure** when appropriate.
- Split the system into **domain**, **infrastructure**, **interface**, and **application** layers where feasible.

### Refactor Proactively:
- When patterns or logic begin to repeat, abstract.
- Refactor for clarity, reusability, and testability.
- When adding new code, always assess and improve existing related code.

---

## 🖥️ Backend Code Instructions

### GraphQL Schema Design:
- Use **SDL-first approach** (`.graphql` files).
- Group related types into modular schema files.
- Provide documentation using `""" triple-quoted descriptions """`.

### Resolvers:
- Keep resolvers as thin delegators.
- Always delegate to the **service layer**.
- Implement error handling and logging via middleware or wrappers.

### Service Layer:
- Encapsulate business logic.
- Reuse utilities and helpers when possible.

### Persistence Layer:
- Isolate from application logic.
- Expose clean CRUD or query interfaces only.

### Logging:
- Use **Pino** for all logging.
- Prefer structured logs (key-value pairs).
- Log errors, warnings, key actions, and context.

### Error Handling:
- Return structured GraphQL errors with clear codes.
- Log errors with full stack trace and correlation IDs.
- Never leak internal information in user-facing errors.

### Environment Configuration:
- Use `.env` / `.env.local` for config.
- Document required environment variables.
- Validate environment at startup.

### Security Practices:
- Sanitize inputs, especially in resolvers.
- Never log sensitive data (e.g., passwords, tokens).
- Use secure defaults for authentication and API usage.

### Testing:
- Use **Jest** for unit and integration tests.
- Use **supertest** for GraphQL endpoint integration.
- Mock external dependencies appropriately.

---

## 🌐 Frontend Code Instructions

### Vue Component Guidelines:
- Use **Composition API** (`setup()`).
- One component = one concern.
- Move complex logic into composables or stores.

### Pinia State Management:
- Organize into modules.
- Expose only necessary methods.
- Keep types consistent.

### Vuetify Use:
- Prefer Vuetify components over custom styling.
- Stick to defined theme colors and spacing.
- Follow a11y (accessibility) best practices.

### Composables:
- Use `useXyz.ts` naming.
- Place all async logic and side effects here.
- Keep composables small and focused.

### Routing & Pages:
- Use nested folders in `views/`.
- Document expected route params and behavior.

### Error Handling:
- Use composables to centralize error processing.
- Show errors in UI using standard Vuetify components.
- Provide meaningful user-facing messages.

---

## 📚 Documentation Standards

### In Code:
- Use **JSDoc or TSDoc**.
- Document all public functions, types, and modules.
- Include params, return values, side effects, and usage.

### In Repository:
- Every module/package must include a `README.md` with:
  - Purpose and scope
  - Folder structure
  - Usage instructions
  - Examples

### GraphQL:
- Document all fields, types, and arguments in SDL.

### API Example Comments:
- Include usage examples and notes for important APIs in code and READMEs.

### Type Safety:
- Prefer `.ts` files.
- Share types across backend and frontend via `@shared/` or similar.
- Avoid using `any`.

---

## ✅ Code Quality Requirements

- All code must lint and format correctly (`eslint`, `prettier`).
- Prefer existing patterns and conventions.
- Introduce new libraries only with justification.
- `TODO:` comments must be tracked and addressed.

---

## 🥪 Testing Guidelines

### Backend:
- Use **Jest** for unit tests.
- Use **supertest** for endpoint testing.
- Maintain test coverage for all business logic.

### Frontend:
- Use **Jest** for logic/composables.
- Use **Vue Test Utils** for components.
- Use **Playwright** for E2E tests.

---

## 💬 Commit & PR Instructions for AI

- Use **conventional commit messages** (`feat:`, `fix:`, `chore:` etc.).
- Group related changes in one commit.
- PR descriptions must include:
  - What was added/changed
  - Why it matters
  - Follow-up TODOs

---

## 📰 Final Notes

This project treats AI as a **first-class contributor**. All AI-generated code must meet the quality expected from a senior developer: maintainable, testable, secure, and documented.

If in doubt:
- Ask for clarification in comments
- Leave notes for human reviewers where multiple interpretations exist
- Always prioritize clarity and maintainability over cleverness
- Follow the established patterns and practices of the project

Always output the summary of the changes made to /WORKLOG YYYYMMDD.md, including:
- Root cause analysis
- Impact of changes
- New features added
- Bugs fixed
- Improvements made
- Documentation updates
- Any TODOs or follow-up tasks
- Any potential issues or risks identified
- Etc.