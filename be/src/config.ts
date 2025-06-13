import configLib from 'config';
import { z } from 'zod';

/** Configuration schema */
const configSchema = z.object({
  port: z.number().default(4000),
  jwtSecret: z.string().min(1),
  dbFile: z.string().default('../data/db.json'),
});

/**
 * Load and validate configuration using the `config` package.
 */
function loadConfig() {
  return configSchema.parse({
    port: configLib.get<number>('port'),
    jwtSecret: configLib.get<string>('jwtSecret'),
    dbFile: configLib.get<string>('dbFile'),
  });
}

/** Parsed configuration object */
const config = loadConfig();
export default config;
