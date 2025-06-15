import type { Config } from '../services/config'
import { computed, ref } from 'vue'
import { getConfig } from '../services/config'
import { getLogger, initializeLogger, logError, logInfo, logWarn } from '../utils/logger'

/**
 * Composable for managing application logging
 *
 * Provides reactive logger initialization and convenient logging methods.
 * Automatically fetches configuration from backend and initializes Pino logger.
 */

const isLoggerInitialized = ref(false)
const loggerConfig = ref<Config | null>(null)
const initializationError = ref<string | null>(null)

/**
 * Initialize the application logger by fetching configuration from backend
 */
export async function initializeAppLogger (): Promise<void> {
  try {
    logInfo('Initializing application logger...')

    const response = await getConfig()
    loggerConfig.value = response.config

    // Initialize logger with fetched configuration
    initializeLogger(response.config)
    isLoggerInitialized.value = true

    logInfo('Application logger initialized successfully', {
      loggingLevel: response.config.logging.level,
      betterStackEnabled: response.config.logging.betterStack?.enabled ?? false,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    initializationError.value = errorMessage
    logError('Failed to initialize application logger', error)

    // Continue with fallback logger
    isLoggerInitialized.value = true
    logWarn('Using fallback logger configuration')
  }
}

/**
 * Composable hook for using the logger in components
 */
export function useLogger () {
  const logger = computed(() => getLogger())

  const logDebug = (message: string, data?: any) => {
    logger.value.debug(data || {}, message)
  }

  const logInfo = (message: string, data?: any) => {
    logger.value.info(data || {}, message)
  }

  const logWarn = (message: string, data?: any) => {
    logger.value.warn(data || {}, message)
  }

  const logError = (message: string, error?: Error | any) => {
    logger.value.error({ error }, message)
  }

  return {
    logger,
    logDebug,
    logInfo,
    logWarn,
    logError,
    isLoggerInitialized: computed(() => isLoggerInitialized.value),
    loggerConfig: computed(() => loggerConfig.value),
    initializationError: computed(() => initializationError.value),
  }
}

/**
 * Initialize logger during application startup
 * Call this in main.ts or app initialization
 */
