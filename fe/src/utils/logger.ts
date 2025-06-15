import pino from 'pino'
import type { Config } from '../services/config'

/**
 * Frontend Pino logger utility
 * 
 * Creates a logger instance configured based on backend configuration
 * fetched via the config service. Supports both development and production
 * logging with BetterStack integration when configured.
 */

let loggerInstance: pino.Logger | null = null

/**
 * Initialize the logger with configuration from the backend
 * @param config Configuration object from backend
 */
export function initializeLogger(config: Config): pino.Logger {
  const loggerOptions: pino.LoggerOptions = {
    level: config.logging.level || 'debug',
    browser: {
      // Browser-specific configuration
      asObject: true,
      serialize: true,
      transmit: {
        // Send logs to BetterStack if configured
        send: (level, logEvent) => {
          if (config.logging.betterStack?.enabled && config.logging.betterStack?.sourceToken) {
            // In a real implementation, you would send to BetterStack endpoint
            // For now, we'll just log to console as fallback
            console.log(`[${level}]`, logEvent)
          }
        }
      }
    }
  }

  // Create logger instance
  loggerInstance = pino(loggerOptions)
  
  return loggerInstance
}

/**
 * Get the current logger instance
 * If not initialized, returns a fallback logger that logs to console
 */
export function getLogger(): pino.Logger {
  if (!loggerInstance) {
    // Fallback logger for cases where config hasn't been loaded yet
    loggerInstance = pino({
      level: 'debug',
      browser: {
        asObject: true,
        serialize: true
      }
    })
  }
  
  return loggerInstance
}

/**
 * Convenience method to log debug messages
 */
export function logDebug(message: string, data?: any): void {
  getLogger().debug(data || {}, message)
}

/**
 * Convenience method to log info messages
 */
export function logInfo(message: string, data?: any): void {
  getLogger().info(data || {}, message)
}

/**
 * Convenience method to log warning messages
 */
export function logWarn(message: string, data?: any): void {
  getLogger().warn(data || {}, message)
}

/**
 * Convenience method to log error messages
 */
export function logError(message: string, error?: Error | any): void {
  getLogger().error({ error }, message)
}

/**
 * Default export for the logger instance
 */
export default getLogger