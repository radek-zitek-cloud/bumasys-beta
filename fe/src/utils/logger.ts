import type { Config } from '../services/config'
import { Logtail } from '@logtail/browser'
import pino from 'pino'
import frontendConfig from './config'

/**
 * Frontend Pino logger utility
 *
 * Creates a logger instance configured based on backend configuration
 * fetched via the config service. Supports both development and production
 * logging with BetterStack integration via Logtail when configured.
 */

let loggerInstance: pino.Logger | null = null
let logtailInstance: Logtail | null = null

/**
 * Initialize Logtail instance for BetterStack integration
 */
function initializeLogtail (token: string, endpoint?: string): Logtail {
  if (!logtailInstance) {
    const options = endpoint ? { endpoint } : {}
    logtailInstance = new Logtail(token, options)
  }
  return logtailInstance
}

/**
 * Send logs to BetterStack using Logtail
 */
async function sendToLogtail (logtail: Logtail, level: string, logEvent: any): Promise<void> {
  try {
    const message = logEvent.messages?.[0] || logEvent.msg || ''
    const logData = {
      message,
      level: level.toLowerCase(),
      timestamp: new Date().toISOString(),
      source: 'bumasys-frontend',
      environment: import.meta.env.MODE || 'production',
      ...logEvent,
    }

    // Use Logtail's built-in methods based on level
    switch (level.toLowerCase()) {
      case 'debug': {
        await logtail.debug(message, logData)
        break
      }
      case 'info': {
        await logtail.info(message, logData)
        break
      }
      case 'warn': {
        await logtail.warn(message, logData)
        break
      }
      case 'error': {
        await logtail.error(message, logData)
        break
      }
      default: {
        await logtail.info(message, logData)
      }
    }
  } catch (error) {
    // Only log Logtail errors once to avoid spam
    if (!sendToLogtail.errorLogged) {
      console.error('Failed to send log to BetterStack via Logtail:', error)
      sendToLogtail.errorLogged = true
    }
    console.log(`[${level}]`, logEvent) // Fallback to console
  }
}

// Add a flag to prevent error spam
sendToLogtail.errorLogged = false

/**
 * Initialize the logger with configuration from the backend
 * @param config Configuration object from backend
 */
export function initializeLogger (config: Config): pino.Logger {
  // Try backend config first, fallback to frontend config
  const betterStackConfig = config.logging.betterStack || frontendConfig.logging.betterStack
  const token = betterStackConfig ? ((betterStackConfig as any)?.sourceToken || (betterStackConfig as any)?.token) : null

  let logtail: Logtail | null = null

  // Initialize Logtail if BetterStack is configured
  if (betterStackConfig?.enabled && token) {
    try {
      const endpoint = betterStackConfig?.endpoint
      logtail = initializeLogtail(token, endpoint)
      console.log('✅ BetterStack/Logtail integration initialized successfully', {
        endpoint: endpoint || 'default',
        hasToken: !!token,
      })
    } catch (error) {
      console.warn('❌ Failed to initialize BetterStack/Logtail:', error)
    }
  }

  const loggerOptions: pino.LoggerOptions = {
    level: config.logging.level || frontendConfig.logging.level || 'debug',
    browser: {
      asObject: true,
      serialize: true,
      transmit: {
        send: (level, logEvent) => {
          // Send to Logtail if available, otherwise console
          if (logtail && betterStackConfig?.enabled) {
            sendToLogtail(logtail, level, logEvent)
          } else {
            console.log(`[${level}]`, logEvent)
          }
        },
      },
    },
  }

  // Create logger instance
  loggerInstance = pino(loggerOptions)
  return loggerInstance
}

/**
 * Create console-only logger options
 */
function createConsoleLoggerOptions (config: Config): pino.LoggerOptions {
  return {
    level: config.logging.level || frontendConfig.logging.level || 'debug',
    browser: {
      asObject: true,
      serialize: true,
      transmit: {
        send: (level, logEvent) => {
          console.log(`[${level}]`, logEvent)
        },
      },
    },
  }
}

/**
 * Get the current logger instance
 * If not initialized, returns a fallback logger that logs to console
 */
export function getLogger (): pino.Logger {
  if (!loggerInstance) {
    // Fallback logger for cases where config hasn't been loaded yet
    // Check if frontend config has BetterStack enabled
    const betterStackConfig = frontendConfig.logging.betterStack
    const token = betterStackConfig?.token

    let fallbackLogtail: Logtail | null = null

    if (betterStackConfig?.enabled && token) {
      try {
        const endpoint = betterStackConfig?.endpoint
        fallbackLogtail = initializeLogtail(token, endpoint)
        console.log('✅ Fallback BetterStack/Logtail initialized', {
          endpoint: endpoint || 'default',
        })
      } catch (error) {
        console.warn('❌ Failed to initialize fallback Logtail:', error)
      }
    }

    loggerInstance = pino({
      level: frontendConfig.logging.level || 'debug',
      browser: {
        asObject: true,
        serialize: true,
        transmit: {
          send: (level, logEvent) => {
            if (fallbackLogtail && betterStackConfig?.enabled) {
              sendToLogtail(fallbackLogtail, level, logEvent)
            } else {
              console.log(`[${level}]`, logEvent)
            }
          },
        },
      },
    })
  }

  return loggerInstance
}

/**
 * Convenience method to log debug messages
 */
export function logDebug (message: string, data?: any): void {
  getLogger().debug(data || {}, message)
}

/**
 * Convenience method to log info messages
 */
export function logInfo (message: string, data?: any): void {
  getLogger().info(data || {}, message)
}

/**
 * Convenience method to log warning messages
 */
export function logWarn (message: string, data?: any): void {
  getLogger().warn(data || {}, message)
}

/**
 * Convenience method to log error messages
 */
export function logError (message: string, error?: Error | any): void {
  getLogger().error({ error }, message)
}

/**
 * Default export for the logger instance
 */
export default getLogger
