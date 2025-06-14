import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** BetterStack logging configuration interface */
export interface BetterStackConfig {
  enabled: boolean
}

/** Logging configuration interface */
export interface LoggingConfig {
  betterStack: BetterStackConfig
}

/** Backend configuration interface matching the GraphQL schema */
export interface Config {
  port: number
  accessTokenExpiresIn: string
  refreshTokenExpiresIn: string
  dbFile: string
  logging: LoggingConfig
}

/**
 * Fetch backend configuration from the server.
 * This returns sanitized configuration without sensitive information.
 */
export function getConfig (): Promise<{ config: Config }> {
  const store = useAuthStore()
  return graphqlClient<{ config: Config }>(
    `
      query {
        config {
          port
          accessTokenExpiresIn
          refreshTokenExpiresIn
          dbFile
          logging {
            betterStack {
              enabled
            }
          }
        }
      }
    `,
    {},
    store.token,
  )
}
