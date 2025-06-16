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
  // Create a partial config that matches the expected interface
  // The frontend config is used for compile-time configuration
  // while this service provides runtime configuration from the backend
  const runtimeConfig: Partial<Config> = {
    logging: {
      level: config.logging.level,
      console: {
        enabled: config.logging.enabled,
        pretty: true,
      },
      betterStack: config.logging.betterStack
        ? {
            enabled: config.logging.betterStack.enabled,
            sourceToken: config.logging.betterStack.token,
            endpoint: config.logging.betterStack.endpoint,
          }
        : undefined,
    },
    features: {
      debugMode: config.features.debugMode,
      showConfigCard: false,
      enableLogging: config.logging.enabled,
    },
    api: {
      baseUrl: config.api.baseUrl,
      graphqlEndpoint: `${config.api.baseUrl}/graphql`,
      timeout: config.api.timeout,
    },
    // Default values for required fields
    app: {
      name: 'Bumasys Frontend',
      version: '1.0.0',
      theme: 'default',
    },
    ui: {
      theme: {
        dark: false,
        primaryColor: '#1976d2',
      },
      pagination: {
        defaultPageSize: 10,
        pageSizeOptions: [5, 10, 25, 50],
      },
      table: {
        sortable: true,
        filterable: true,
      },
    },
  }

  return Promise.resolve({
    config: runtimeConfig as Config,
  })
}
