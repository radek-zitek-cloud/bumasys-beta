import config from '../utils/config'

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
  betterStack?: BetterStackConfig
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
 * Frontend configuration interface supporting dynamic fields.
 * This interface defines the known structure but allows additional fields
 * to be present without code changes.
 */
export interface Config {
  [key: string]: any
  app: {
    name: string
    version: string
    theme: string
  }
  api: {
    baseUrl: string
    graphqlEndpoint: string
    timeout: number
  }
  ui: {
    theme: {
      dark: boolean
      primaryColor: string
    }
    pagination: {
      defaultPageSize: number
      pageSizeOptions: number[]
    }
    table: {
      sortable: boolean
      filterable: boolean
    }
  }
  features: {
    debugMode: boolean
    showConfigCard: boolean
    enableLogging: boolean
  }
  logging: {
    level: string
    console: {
      enabled: boolean
      pretty: boolean
    }
    betterStack?: {
      enabled: boolean
      sourceToken?: string
      endpoint?: string
    }
  }
  // Legacy fields for backward compatibility (can be removed in future versions)
  port?: number
  accessTokenExpiresIn?: string
  refreshTokenExpiresIn?: string
  dbFile?: string
  newFeature?: NewFeatureConfig
  customSetting?: string
}

/**
 * Get frontend configuration from local JSON files.
 * This returns the complete dynamic configuration loaded from local files
 * with environment variable overrides support.
 */
export function getConfig (): Promise<{ config: Config }> {
  return Promise.resolve({
    config: config as Config,
  })
}
