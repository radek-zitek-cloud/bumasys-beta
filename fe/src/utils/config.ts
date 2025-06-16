/**
 * Frontend configuration system
 *
 * This provides compile-time configuration for the frontend application.
 * Runtime configuration should be fetched from the backend API.
 *
 * Environment Variables:
 * - VITE_API_BASE_URL: Backend API base URL
 * - VITE_API_TIMEOUT: API request timeout in milliseconds
 * - VITE_LOG_LEVEL: Logging level (debug, info, warn, error)
 * - VITE_LOGGING_ENABLED: Enable/disable logging
 * - VITE_BETTERSTACK_TOKEN: BetterStack authentication token (optional)
 * - VITE_BETTERSTACK_ENDPOINT: BetterStack endpoint URL
 * - VITE_BETTERSTACK_ENABLED: Enable BetterStack logging
 * - VITE_DEBUG_MODE: Enable debug mode features
 */

/**
 * Frontend configuration interface
 */
interface FrontendConfig {
  api: {
    baseUrl: string
    timeout: number
  }
  logging: {
    level: string
    enabled: boolean
    /** BetterStack logging configuration (optional) */
    betterStack?: {
      /** BetterStack endpoint URL (optional - Logtail handles this automatically) */
      endpoint?: string
      /** BetterStack authentication token */
      token: string
      /** Whether BetterStack logging is enabled */
      enabled: boolean
    }
  }
  features: {
    debugMode: boolean
  }
}

/**
 * Default frontend configuration
 * Can be overridden by environment variables via Vite
 */
const config: FrontendConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
  },
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    enabled: import.meta.env.VITE_LOGGING_ENABLED !== 'false',
    betterStack: import.meta.env.VITE_BETTERSTACK_TOKEN
      ? {
          endpoint: import.meta.env.VITE_BETTERSTACK_ENDPOINT,
          token: import.meta.env.VITE_BETTERSTACK_TOKEN,
          enabled: import.meta.env.VITE_BETTERSTACK_ENABLED !== 'false',
        }
      : undefined,
  },
  features: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
}

export default config
