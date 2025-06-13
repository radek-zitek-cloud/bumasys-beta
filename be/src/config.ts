import configLib from 'config';
import { z } from 'zod';

/**
 * Configuration schema used to validate values loaded by the `config` library.
 * Values may be overridden through environment variables defined in
 * `be/config/custom-environment-variables.json`.
 */

/** Configuration schema */
const configSchema = z.object({
  port: z.coerce.number().int().positive().default(4000), // Ensure 'port' is a positive integer
  jwtSecret: z.string().min(10), // Enforce a minimum length for security
  expiresIn: z.string().regex(/^\d+[smhd]$/, 'Invalid duration format').default('60m'), // Validate duration format
  refreshExpiresIn: z.string().regex(/^\d+[smhd]$/, 'Invalid duration format').default('7d'), // Validate duration format
  dbFile: z.string().nonempty('Database file path cannot be empty').default('../data/db.json'),
});

/**
 * Load and validate configuration using the `config` package.
 */
function loadConfig() {
  try {
    return configSchema.parse({
      port: configLib.get<number>('port'),
      jwtSecret: configLib.get<string>('jwtSecret'),
      expiresIn: configLib.get<string>('expiresIn'),
      refreshExpiresIn: configLib.get<string>('refreshExpiresIn'),
      dbFile: configLib.get<string>('dbFile'),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Failed to load configuration:', error.message);
    } else {
      console.error('Failed to load configuration:', error);
    }
    process.exit(1); // Exit process with an error code
  }
}

/** Parsed configuration object */
const config = loadConfig();

if (process.env.NODE_ENV) {
  console.info(`Loaded configuration for environment: ${process.env.NODE_ENV}`);
}

export default config;
