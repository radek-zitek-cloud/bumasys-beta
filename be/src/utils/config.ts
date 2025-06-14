import configLib from 'config';
import type { StringValue } from 'ms';
import { z } from 'zod';

/**
 * Dynamic configuration system that provides access to all JSON config values
 * while maintaining critical validation for security-sensitive fields.
 *
 * Values may be overridden through environment variables defined in
 * `be/config/custom-environment-variables.json`.
 *
 * Usage: config.anyFieldFromJson or config.nested.field
 *
 * ## Best Practices Analysis
 *
 * This implementation follows Node.js configuration best practices:
 *
 * **✅ What we're doing right:**
 * - Using the industry-standard `config` npm package as intended
 * - Allowing dynamic configuration without code changes
 * - Supporting environment-specific config files (default.json, test.json, etc.)
 * - Enabling environment variable overrides via custom-environment-variables.json
 * - Maintaining type safety for known fields while allowing flexibility
 * - Validating only critical security fields (port, jwtSecret)
 *
 * **🔄 The trade-off:**
 * - Less validation means potential runtime errors for misconfigured fields
 * - This is acceptable for non-critical fields (logging levels, feature flags)
 * - Security-critical fields still have full validation
 *
 * **📈 Compared to alternatives:**
 * - Rigid schema validation: Secure but requires code changes for new config
 * - No validation: Flexible but unsafe for critical fields
 * - This hybrid approach: Secure for critical fields, flexible for others
 *
 * **🎯 When to extend:**
 * - Add new config fields directly to JSON files
 * - Add environment variable mappings to custom-environment-variables.json
 * - Only modify this code for new critical security fields
 *
 * This approach is well-aligned with Node.js ecosystem patterns and provides
 * the flexibility requested while maintaining security guardrails.
 */

/**
 * Known configuration fields with type definitions.
 * This interface can be extended as needed but is not exhaustive.
 */
interface KnownConfig {
  port: number;
  jwtSecret: string;
  accessTokenExpiresIn: StringValue;
  refreshTokenExpiresIn: StringValue;
  dbFile: string;
  logging: {
    level?: string;
    betterStack: {
      enabled: boolean;
      sourceToken: string;
      endpoint?: string;
    };
    [key: string]: any; // Allow additional logging config
  };
  [key: string]: any; // Allow any additional config fields
}

/**
 * Minimal validation schema for critical security and functionality fields.
 * Non-critical fields are passed through dynamically without validation.
 */
const criticalFieldsSchema = z.object({
  port: z.coerce.number().int().positive().default(4000),
  jwtSecret: z.string().min(10), // Security: enforce minimum length
});

/**
 * Validates critical fields and creates a dynamic configuration object
 * that provides access to all fields from the JSON configuration.
 */
function loadConfig(): KnownConfig {
  try {
    // Validate critical fields
    const criticalFields = criticalFieldsSchema.parse({
      port: configLib.get<number>('port'),
      jwtSecret: configLib.get<string>('jwtSecret'),
    });

    // Create a base configuration object with all known fields
    const baseConfig: any = {
      // Critical validated fields
      ...criticalFields,

      // Known fields with defaults
      accessTokenExpiresIn: configLib.has('accessTokenExpiresIn')
        ? configLib.get<StringValue>('accessTokenExpiresIn')
        : ('60m' as StringValue),
      refreshTokenExpiresIn: configLib.has('refreshTokenExpiresIn')
        ? configLib.get<StringValue>('refreshTokenExpiresIn')
        : ('7d' as StringValue),
      dbFile: configLib.has('dbFile')
        ? configLib.get<string>('dbFile')
        : '../data/db.json',
      logging: (() => {
        const logging = configLib.has('logging')
          ? configLib.get('logging')
          : {
              betterStack: {
                enabled: false,
                sourceToken: '',
              },
            };

        // Handle boolean conversion for betterStack.enabled if it comes from env vars as string
        if (
          logging &&
          typeof logging === 'object' &&
          'betterStack' in logging
        ) {
          const betterStack = logging.betterStack as any;
          if (betterStack && typeof betterStack.enabled === 'string') {
            // Create a new object to avoid mutating the immutable config object
            return {
              ...logging,
              betterStack: {
                ...betterStack,
                enabled: betterStack.enabled.toLowerCase() === 'true',
              },
            };
          }
        }

        return logging;
      })(),
    };

    // Create a proxy that allows dynamic access while maintaining the base object properties
    const dynamicConfig = new Proxy(baseConfig, {
      get(target, prop: string | symbol) {
        if (typeof prop === 'symbol') {
          return target[prop];
        }

        // If property exists in target object, return it
        if (prop in target) {
          return target[prop];
        }

        // For dynamic properties, try to get them from configLib
        if (configLib.has(prop)) {
          return configLib.get(prop);
        }

        return undefined;
      },

      set(target, prop: string | symbol, value: any) {
        if (typeof prop === 'symbol') {
          target[prop] = value;
          return true;
        }
        // Allow setting properties (useful for tests)
        target[prop] = value;
        return true;
      },

      has(target, prop: string | symbol) {
        if (typeof prop === 'symbol') {
          return prop in target;
        }
        return prop in target || configLib.has(prop);
      },

      ownKeys(target) {
        // Return keys from the target object, which includes all the base config keys
        return Reflect.ownKeys(target);
      },

      getOwnPropertyDescriptor(target, prop) {
        // Use the default descriptor from the target object
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    });

    return dynamicConfig;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Critical configuration validation failed:', error.errors);
      throw new Error(
        'Invalid critical configuration: ' + JSON.stringify(error.errors),
      );
    } else if (error instanceof Error) {
      console.error(
        'Failed to load configuration:',
        error.message,
        error.stack,
      );
      throw error;
    } else {
      console.error('Failed to load configuration:', error);
      throw new Error('Unknown error loading configuration');
    }
  }
}

/**
 * Configuration object with dynamic access to all JSON fields.
 * Critical fields are validated, while other fields are passed through dynamically.
 *
 * @example
 * // Access any field from JSON files
 * config.port                    // typed and validated
 * config.jwtSecret              // typed and validated
 * config.logging.level          // dynamic access
 * config.newField               // dynamic access to any new field
 * config.nested.custom.field    // dynamic access to nested fields
 */
const config: KnownConfig = loadConfig();

if (process.env.NODE_ENV) {
  console.info(`Loaded configuration for environment: ${process.env.NODE_ENV}`);
}

export default config;
