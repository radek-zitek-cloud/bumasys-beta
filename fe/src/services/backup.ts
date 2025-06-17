/**
 * @fileoverview Database backup service
 * 
 * This service provides functionality for creating database backups
 * via GraphQL mutations.
 */

import { graphqlClient } from './graphql-client'

/**
 * Create a backup of the current database
 * @returns Promise resolving to the backup file path
 */
export async function backupDatabase(): Promise<string> {
  const result = await graphqlClient<{ backupDatabase: string }>(
    `
      mutation {
        backupDatabase
      }
    `
  )
  return result.backupDatabase
}