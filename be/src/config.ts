import fs from 'fs';
import path from 'path';
import { z } from 'zod';

/** Configuration schema */
const configSchema = z.object({
  port: z.number().default(4000),
  jwtSecret: z.string().min(1),
  dbFile: z.string().default('db.json'),
});

/**
 * Load and validate configuration from config.json.
 */
function loadConfig() {
  const file = path.resolve(__dirname, 'config.json');
  const raw = fs.readFileSync(file, 'utf-8');
  return configSchema.parse(JSON.parse(raw));
}

/** Parsed configuration object */
const config = loadConfig();
export default config;
