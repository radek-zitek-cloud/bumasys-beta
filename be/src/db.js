const fs = require('fs');
const path = require('path');

let dbPath;
let data;

/**
 * Initialize database with given file.
 * @param {string} file - JSON file path.
 */
async function createDb(file) {
  dbPath = path.resolve(file);
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
  }
  const raw = fs.readFileSync(dbPath, 'utf-8');
  data = JSON.parse(raw);
  return {
    get data() {
      return data;
    },
    async write() {
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    },
  };
}

module.exports = createDb;
