import fs from 'fs';
import path from 'path';

export interface Database {
  data: {
    users: Array<{
      id: string;
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      note?: string;
    }>;
    sessions: Array<{
      token: string;
      userId: string;
      createdAt: string;
    }>;
  };
  write(): Promise<void>;
}

let dbPath: string;
let data: Database['data'];

/**
 * Initialize database with given file.
 * @param file - JSON file path
 */
export async function createDb(file: string): Promise<Database> {
  dbPath = path.resolve(file);
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ users: [], sessions: [] }, null, 2),
    );
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  data = JSON.parse(raw);
  // Ensure sessions array exists for backward compatibility
  if (!data.sessions) {
    data.sessions = [];
  }
  return {
    get data() {
      return data;
    },
    async write() {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    },
  } as Database;
}
