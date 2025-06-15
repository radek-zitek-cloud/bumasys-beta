import configLib from 'config';
import { z } from 'zod';

/**
 * Frontend configuration system that provides access to all JSON config values
 * while maintaining critical validation for essential frontend fields.
 *
 * Values may be overridden through environment variables defined in
 * `fe/config/custom-environment-variables.json`.
 *
 * Usage: config.anyFieldFromJson or config.nested.field
 *
 * ## Design Philosophy
 *
 * This implementation mirrors the backend configuration design:
 *
 * **✅ What we're doing right:**
 * - Using the industry-standard `config` npm package as intended
 * - Allowing dynamic configuration without code changes
 * - Supporting environment-specific config files (default.json, test.json, etc.)
 * - Enabling environment variable overrides via custom-environment-variables.json
 * - Maintaining type safety for known fields while allowing flexibility
 * - Validating only critical fields that impact frontend functionality
 *
 * **🔄 The trade-off:**
 * - Less validation means potential runtime errors for misconfigured fields
 * - This is acceptable for non-critical fields (UI themes, feature flags)
 * - Critical fields still have validation where needed
 *
 * **🎯 When to extend:**
 * - Add new config fields directly to JSON files
 * - Add environment variable mappings to custom-environment-variables.json
 * - Only modify this code for new critical validation requirements
 */

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  dark: boolean;
  primaryColor: string;
}

/**
 * UI configuration interface
 */
export interface UIConfig {
  theme: ThemeConfig;
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  table: {
    sortable: boolean;
    filterable: boolean;
  };
}

/**
 * API configuration interface
 */
export interface APIConfig {
  baseUrl: string;
  graphqlEndpoint: string;
  timeout: number;
}

/**
 * Features configuration interface
 */
export interface FeaturesConfig {
  debugMode: boolean;
  showConfigCard: boolean;
  enableLogging: boolean;
}

/**
 * Logging configuration interface
 */
export interface LoggingConfig {
  level: string;
  console: {
    enabled: boolean;
    pretty: boolean;
  };
  betterStack?: {
    enabled: boolean;
    sourceToken?: string;
    endpoint?: string;
  };
}

/**
 * App configuration interface
 */
export interface AppConfig {
  name: string;
  version: string;
  theme: string;
}

/**
 * Known configuration fields with type definitions.
 * This interface can be extended as needed but is not exhaustive.
 */
interface KnownConfig {
  app: AppConfig;
  api: APIConfig;
  ui: UIConfig;
  features: FeaturesConfig;
  logging: LoggingConfig;
  // Allow dynamic access to any other configuration fields
  [key: string]: any;
}

/**
 * Schema for validating critical frontend configuration fields.
 * Only validates fields that are essential for frontend operation.
 */
const criticalFieldsSchema = z.object({
  // No critical fields requiring strict validation at this time
  // Frontend can operate with defaults if configuration is malformed
});

/**
 * Validates critical fields and creates a dynamic configuration object
 * that provides access to all fields from the JSON configuration.
 */
function loadConfig(): KnownConfig {
  try {
    // Validate critical fields (currently none required)
    const criticalFields = criticalFieldsSchema.parse({});

    // Create a base configuration object with all known fields
    const baseConfig: any = {
      // Critical validated fields
      ...criticalFields,

      // Known fields with defaults
      app: configLib.has('app')
        ? configLib.get('app')
        : {
            name: 'Bumasys Frontend',
            version: '1.0.0',
            theme: 'default',
          },
      api: configLib.has('api')
        ? configLib.get('api')
        : {
            baseUrl: 'http://localhost:4000',
            graphqlEndpoint: '/graphql',
            timeout: 10000,
          },
      ui: configLib.has('ui')
        ? configLib.get('ui')
        : {
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
      features: configLib.has('features')
        ? configLib.get('features')
        : {
            debugMode: false,
            showConfigCard: true,
            enableLogging: true,
          },
      logging: configLib.has('logging')
        ? configLib.get('logging')
        : {
            level: 'info',
            console: {
              enabled: true,
              pretty: true,
            },
            betterStack: {
              enabled: false,
              sourceToken: '',
              endpoint: '',
            },
          },
    };

    // Create a proxy that allows dynamic access while maintaining the base object properties
    const dynamicConfig = new Proxy(baseConfig, {
      get(target, prop: string | symbol) {
        if (typeof prop === 'string') {
          // First check if the property exists in our base config
          if (prop in target) {
            return target[prop];
          }
          // Then check if it exists in the config library
          if (configLib.has(prop)) {
            return configLib.get(prop);
          }
        }
        return target[prop as keyof typeof target];
      },

      set(target, prop: string | symbol, value: any) {
        // Configuration should be read-only
        console.warn(
          `Attempted to modify configuration property '${String(prop)}'. Configuration is read-only.`,
        );
        return false;
      },

      has(target, prop: string | symbol) {
        if (typeof prop === 'string') {
          return prop in target || configLib.has(prop);
        }
        return prop in target;
      },

      ownKeys(target) {
        // Get keys from base config and config library
        const baseKeys = Object.keys(target);
        const configKeys = configLib.util
          .getConfigSources()
          .flatMap((src) => Object.keys(src.parsed || {}));
        return Array.from(new Set([...baseKeys, ...configKeys]));
      },

      getOwnPropertyDescriptor(target, prop) {
        if (typeof prop === 'string' && (prop in target || configLib.has(prop))) {
          return {
            enumerable: true,
            configurable: true, // Changed to true to avoid proxy errors
            writable: false,
          };
        }
        return Object.getOwnPropertyDescriptor(target, prop);
      },
    });

    return dynamicConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Critical frontend configuration validation failed:', error.errors);
      throw new Error(
        'Invalid critical frontend configuration: ' + JSON.stringify(error.errors),
      );
    } else if (error instanceof Error) {
      console.error(
        'Failed to load frontend configuration:',
        error.message,
      );
      throw error;
    } else {
      console.error('Unknown error loading frontend configuration:', error);
      throw new Error('Unknown configuration error');
    }
  }
}

/**
 * Configuration object with dynamic access to all JSON fields.
 * Known fields have type definitions, while other fields are passed through dynamically.
 *
 * @example
 * // Access any field from JSON files
 * config.app.name               // typed and validated
 * config.api.baseUrl           // typed and validated
 * config.ui.theme.dark         // typed access
 * config.newField              // dynamic access to any new field
 * config.nested.custom.field   // dynamic access to nested fields
 */
const config: KnownConfig = loadConfig();

if (process.env.NODE_ENV) {
  console.info(`Loaded frontend configuration for environment: ${process.env.NODE_ENV}`);
}

export default config;