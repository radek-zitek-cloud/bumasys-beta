import fs from 'fs';
import path from 'path';
import { createDb } from '../src/db';

test('createDb initializes file and writes data', async () => {
  const file = path.join(__dirname, 'unit-db.json');
  if (fs.existsSync(file)) fs.unlinkSync(file);
  const db = await createDb(file);
  expect(db.data.users.length).toBe(0);
  db.data.users.push({ id: '1', email: 'a@b.c', password: 'p' });
  await db.write();
  const loaded = JSON.parse(fs.readFileSync(file, 'utf-8'));
  expect(loaded.users.length).toBe(1);
});
