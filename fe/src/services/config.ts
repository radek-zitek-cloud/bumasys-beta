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
  level?: string
  betterStack: BetterStackConfig
  [key: string]: any // Allow additional logging config fields
}

/** New feature configuration interface */
export interface NewFeatureConfig {
  enabled: boolean
  options: {
    maxRetries: number
    timeout: number
    [key: string]: any // Allow additional options
  }
  [key: string]: any // Allow additional feature config fields
}

/**
 * Backend configuration interface supporting dynamic fields.
 * This interface defines the known structure but allows additional fields
 * to be present without code changes.
 */
export interface Config {
  // Known core fields
  port: number
  accessTokenExpiresIn: string
  refreshTokenExpiresIn: string
  dbFile: string
  logging: LoggingConfig

  // Dynamic fields that may be present
  newFeature?: NewFeatureConfig
  customSetting?: string

  // Allow any additional dynamic fields
  [key: string]: any
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
