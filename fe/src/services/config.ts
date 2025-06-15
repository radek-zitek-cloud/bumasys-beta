import { useAuthStore } from '../stores/auth'
import { graphqlClient } from './graphql-client'

/** BetterStack logging configuration interface */
export interface BetterStackConfig {
  enabled: boolean
  sourceToken?: string // Optional since it may be redacted
  endpoint?: string
}

/** Logging configuration interface with full structure */
export interface LoggingConfig {
  [key: string]: any
  level?: string
  betterStack: BetterStackConfig
}

/** New feature configuration interface */
export interface NewFeatureConfig {
  [key: string]: any
  enabled: boolean
  options: {
    [key: string]: any
    maxRetries: number
    timeout: number
  }
}

/**
 * Backend configuration interface supporting dynamic fields.
 * This interface defines the known structure but allows additional fields
 * to be present without code changes.
 */
export interface Config {
  [key: string]: any
  port: number
  accessTokenExpiresIn: string
  refreshTokenExpiresIn: string
  dbFile: string
  logging: LoggingConfig
  newFeature?: NewFeatureConfig
  customSetting?: string
}

/**
 * Fetch backend configuration from the server.
 * This returns the complete dynamic configuration without sensitive information.
 * New configuration fields will be automatically available without code changes.
 */
export function getConfig (): Promise<{ config: Config }> {
  const store = useAuthStore()
  return graphqlClient<{ config: Config }>(
    `
      query {
        config
      }
    `,
    {},
    store.token,
  )
}
