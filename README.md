# Bumasys Alfa

## Project Overview

Bumasys Alfa is a full-stack scaffold featuring a Vuetify powered Vue front end and a TypeScript powered Express/Apollo GraphQL back end. It provides a minimal setup to experiment with Vuetify 3 and GraphQL based authentication.

## Installation Instructions

Use [pnpm](https://pnpm.io/) to install dependencies for the front end and npm for the back end:

```bash
cd fe
pnpm install
```

For the back end:

```bash
cd ../be
npm install
```

## Usage Guide

Start a development server with hot reloading:

```bash
pnpm dev
```

The dev server proxies GraphQL requests on `/graphql` to `http://localhost:4000`,
so make sure the back end is running during development.

Run the GraphQL API in development mode (uses ts-node):

```bash
cd ../be
npm run dev
```

Build the back end for production:

```bash
cd ../be
npm run build
```

Build the front end for production:

```bash
pnpm build
```

## Testing

Run linting and unit tests for both projects:

```bash
cd fe
pnpm lint
pnpm test
pnpm test:e2e
cd ../be
npm run lint
npm test
```

## Configuration

The back end reads settings using the [`config`](https://www.npmjs.com/package/config) library. Default values live in `be/config/default.json`. Create additional JSON files in that directory or use environment variables to override the defaults. The environment variable mapping is defined in `be/config/custom-environment-variables.json` and supports `PORT`, `JWT_SECRET`, and `DB_FILE`.

## Examples

After running the development server, open `http://localhost:3000` in your browser. The navigation drawer links (Home, People, Teams, Tasks, Budget, References, and Users) each lead to a dedicated page that you can further extend. Edit components in `src/` to continue customizing the application.

The app bar contains a triple-dot menu that adapts based on authentication state. When logged out it offers **Login**, **Register**, and **Password Reset** actions. Once logged in the menu switches to **Profile**, **Change Password**, and **Logout**. Authentication dialogs now appear below the navigation bar on the top-right of the page and submit requests to the GraphQL API for all authentication operations. User actions in these dialogs show success or error notifications via snackbars. The **Register** dialog now collects optional first and last name and a note. The **Profile** dialog lets users edit these fields while the email is read-only.

For the API you can send the following query using `curl` or a GraphQL client. You can also override configuration values on the fly:

```bash
PORT=5000 JWT_SECRET=mysecret npm run dev
```

Then send the following query using `curl` or a GraphQL client:

```graphql
query {
  me {
    id
    email
  }
}
```

To verify the API server is ready, send the health query:

```graphql
query {
  health
}
```

The Vue application automatically checks this endpoint on load and shows the
backend status in the footer. When logged in, the footer also displays the
authenticated user's name and email.

Authentication mutations return both a short-lived access token and a long-lived
`refreshToken`. Use the `refreshToken` mutation with the provided refresh token
to obtain a new access token. Call `logout` with the refresh token to invalidate
it. The front-end persists authentication state in `localStorage` so sessions
survive a full page reload.

Authenticated clients can manage users via the `users`, `user`, `createUser`,
`updateUser`, and `deleteUser` operations. User records include optional
`firstName`, `lastName`, and `note` fields in addition to `email`.

## Contributing Guidelines

1. Fork the repository and create feature branches for your work.
2. Run `pnpm run lint` in `fe` and `npm run lint` in `be` before opening a pull request.
3. Follow conventional commit messages for clarity.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
