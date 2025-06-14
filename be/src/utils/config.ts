import configLib from 'config';
import type { StringValue } from 'ms';
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
  accessTokenExpiresIn: z
    .custom<StringValue>(
      (val) => typeof val === 'string' && /^\d+[smhd]$/.test(val),
      {
        message: 'Invalid duration format',
      },
    )
    .default('60m'),
  refreshTokenExpiresIn: z
    .custom<StringValue>(
      (val) => typeof val === 'string' && /^\d+[smhd]$/.test(val),
      {
        message: 'Invalid duration format',
      },
    )
    .default('7d'),
  dbFile: z
    .string()
    .nonempty('Database file path cannot be empty')
    .default('../data/db.json'),
  logging: z
    .object({
      betterStack: z.object({
        enabled: z.coerce.boolean().default(false),
        sourceToken: z.string().default(''),
        endpoint: z
          .string()
          .url()
          .default(''),
      }),
    })
    .default({
      betterStack: {
        enabled: false,
        sourceToken: '',
      },
    }),
});

/**
 * Load and validate configuration using the `config` package.
 */
function loadConfig(): ConfigType {
  try {
    return configSchema.parse({
      port: configLib.get<number>('port'),
      jwtSecret: configLib.get<string>('jwtSecret'),
      accessTokenExpiresIn: configLib.get<StringValue>('accessTokenExpiresIn'),
      refreshTokenExpiresIn: configLib.get<StringValue>(
        'refreshTokenExpiresIn',
      ),
      dbFile: configLib.get<string>('dbFile'),
      logging: configLib.has('logging') ? configLib.get('logging') : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:', error.errors);
      throw new Error('Invalid configuration: ' + JSON.stringify(error.errors));
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

/** Parsed configuration object */
type ConfigType = z.infer<typeof configSchema>;
const config: ConfigType = loadConfig();

if (process.env.NODE_ENV) {
  console.info(`Loaded configuration for environment: ${process.env.NODE_ENV}`);
}

export default config;
