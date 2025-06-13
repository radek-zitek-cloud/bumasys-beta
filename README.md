# Bumasys Alfa

## Project Overview
Bumasys Alfa is a full-stack scaffold featuring a Vuetify powered Vue front end and an Express/Apollo GraphQL back end. It provides a minimal setup to experiment with Vuetify 3 and GraphQL based authentication.

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

Run the GraphQL API in development mode:

```bash
cd ../be
npm run dev
```

Build the project for production:

```bash
pnpm build
```

## Examples
After running the development server, open `http://localhost:3000` in your browser to see the default welcome page. Edit components in `src/` to begin customizing the application.

For the API you can send the following query using `curl` or a GraphQL client:

```graphql
query {
  me { id email }
}
```

## Contributing Guidelines
1. Fork the repository and create feature branches for your work.
2. Run `pnpm run lint` in `fe` and `npm run lint` in `be` before opening a pull request.
3. Follow conventional commit messages for clarity.

## License
This project is released under the MIT License. See [LICENSE](LICENSE) for details.
