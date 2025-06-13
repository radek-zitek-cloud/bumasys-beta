import configLib from 'config';
import { z } from 'zod';

/**
 * Configuration schema used to validate values loaded by the `config` library.
 * Values may be overridden through environment variables defined in
 * `be/config/custom-environment-variables.json`.
 */

/** Configuration schema */
const configSchema = z.object({
  port: z.coerce.number().default(4000),
  jwtSecret: z.string().min(1),
  expiresIn: z.string().default('60m'),
  refreshExpiresIn: z.string().default('7d'),
  dbFile: z.string().default('../data/db.json'),
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
export default config;
