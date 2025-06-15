import type { Config } from '../services/config'
import { computed, ref } from 'vue'
import { getConfig } from '../services/config'
import { getLogger, initializeLogger, logError, logInfo, logWarn } from '../utils/logger'
import frontendConfig from '../utils/config'

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
    // Log frontend configuration first
    console.group('🔧 Frontend Logger Configuration')
    console.log('Frontend Config (Environment Variables):', {
      logging: {
        level: frontendConfig.logging.level,
        enabled: frontendConfig.logging.enabled,
        betterStack: frontendConfig.logging.betterStack ? {
          enabled: frontendConfig.logging.betterStack.enabled,
          endpoint: frontendConfig.logging.betterStack.endpoint,
          hasToken: !!frontendConfig.logging.betterStack.token,
          tokenPreview: frontendConfig.logging.betterStack.token ? 
            `${frontendConfig.logging.betterStack.token.substring(0, 8)}...` : 'Not set'
        } : 'Not configured'
      }
    })
    if (import.meta.env.MODE === 'development') {
      console.log('Raw environment variables (dev mode only):')
      console.log('VITE_BETTERSTACK_TOKEN:', import.meta.env.VITE_BETTERSTACK_TOKEN ? `${import.meta.env.VITE_BETTERSTACK_TOKEN.substring(0, 8)}...` : 'Not set')
      console.log('VITE_BETTERSTACK_ENDPOINT:', import.meta.env.VITE_BETTERSTACK_ENDPOINT)
      console.log('VITE_BETTERSTACK_ENABLED:', import.meta.env.VITE_BETTERSTACK_ENABLED)
    }
    console.groupEnd()

    logInfo('Initializing application logger...')

    const response = await getConfig()
    loggerConfig.value = response.config

    // Log backend configuration
    console.group('📡 Backend Logger Configuration')
    console.log('Backend Config (from API):', {
      logging: {
        level: response.config.logging.level,
        console: response.config.logging.console,
        betterStack: response.config.logging.betterStack ? {
          enabled: response.config.logging.betterStack.enabled,
          endpoint: response.config.logging.betterStack.endpoint,
          hasToken: !!(response.config.logging.betterStack as any)?.sourceToken,
          tokenPreview: (response.config.logging.betterStack as any)?.sourceToken ? 
            `${(response.config.logging.betterStack as any).sourceToken.substring(0, 8)}...` : 'Not set'
        } : 'Not configured'
      }
    })
    console.groupEnd()

    // Determine final configuration
    const finalBetterStackConfig = response.config.logging.betterStack || frontendConfig.logging.betterStack
    const hasToken = finalBetterStackConfig ? 
      !!(finalBetterStackConfig as any)?.sourceToken || !!(finalBetterStackConfig as any)?.token : false
    
    console.group('⚙️ Final Logger Configuration')
    console.log('Active Configuration:', {
      source: response.config.logging.betterStack ? 'Backend API' : 'Frontend Environment',
      level: response.config.logging.level || frontendConfig.logging.level,
      betterStack: finalBetterStackConfig ? {
        enabled: finalBetterStackConfig.enabled,
        endpoint: finalBetterStackConfig.endpoint,
        configured: hasToken
      } : 'Not configured'
    })
    console.groupEnd()

    // Initialize logger with fetched configuration
    initializeLogger(response.config)
    isLoggerInitialized.value = true

    logInfo('Application logger initialized successfully', {
      loggingLevel: response.config.logging.level || frontendConfig.logging.level,
      betterStackEnabled: finalBetterStackConfig?.enabled ?? false,
      betterStackConfigured: hasToken,
      configurationSource: response.config.logging.betterStack ? 'backend' : 'frontend'
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    initializationError.value = errorMessage
    
    console.group('❌ Logger Initialization Error')
    console.error('Backend config fetch failed, using frontend fallback:', error)
    console.log('Fallback Frontend Config:', {
      logging: frontendConfig.logging,
      betterStackConfigured: !!frontendConfig.logging.betterStack?.token
    })
    console.groupEnd()
    
    logError('Failed to initialize application logger', error)

    // Continue with fallback logger
    isLoggerInitialized.value = true
    logWarn('Using fallback logger configuration from environment variables')
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
