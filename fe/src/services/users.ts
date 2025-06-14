import { useAuthStore } from '../stores/auth'

/** GraphQL helper to perform POST requests. */
async function graphql<T> (
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data as T
}

/** User interface matching the backend schema */
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  note?: string
}

/** Interface for creating a new user */
export interface CreateUserInput {
  email: string
  password: string
  firstName?: string
  lastName?: string
  note?: string
}

/** Interface for updating an existing user */
export interface UpdateUserInput {
  id: string
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  note?: string
}

/**
 * Fetch all users from the system.
 * Requires authentication.
 */
export function getUsers (): Promise<{ users: User[] }> {
  const store = useAuthStore()
  return graphql<{ users: User[] }>(
    `
      query {
        users {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    {},
    store.token,
  )
}

/**
 * Fetch a specific user by ID.
 * Requires authentication.
 */
export function getUser (id: string): Promise<{ user: User | null }> {
  const store = useAuthStore()
  return graphql<{ user: User | null }>(
    `
      query ($id: ID!) {
        user(id: $id) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    { id },
    store.token,
  )
}

/**
 * Create a new user.
 * Requires authentication.
 */
export function createUser (input: CreateUserInput): Promise<{ createUser: User }> {
  const store = useAuthStore()
  return graphql<{ createUser: User }>(
    `
      mutation (
        $email: String!
        $password: String!
        $firstName: String
        $lastName: String
        $note: String
      ) {
        createUser(
          email: $email
          password: $password
          firstName: $firstName
          lastName: $lastName
          note: $note
        ) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    input,
    store.token,
  )
}

/**
 * Update an existing user.
 * Requires authentication.
 */
export function updateUser (input: UpdateUserInput): Promise<{ updateUser: User }> {
  const store = useAuthStore()
  return graphql<{ updateUser: User }>(
    `
      mutation (
        $id: ID!
        $email: String
        $password: String
        $firstName: String
        $lastName: String
        $note: String
      ) {
        updateUser(
          id: $id
          email: $email
          password: $password
          firstName: $firstName
          lastName: $lastName
          note: $note
        ) {
          id
          email
          firstName
          lastName
          note
        }
      }
    `,
    input,
    store.token,
  )
}

/**
 * Delete a user by ID.
 * Requires authentication.
 */
export function deleteUser (id: string): Promise<{ deleteUser: boolean }> {
  const store = useAuthStore()
  return graphql<{ deleteUser: boolean }>(
    `
      mutation ($id: ID!) {
        deleteUser(id: $id)
      }
    `,
    { id },
    store.token,
  )
}
