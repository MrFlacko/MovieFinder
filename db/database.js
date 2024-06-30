const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'databases', 'imdb.db');
console.log('Resolved database path:', dbPath); // Log the resolved path

if (!fs.existsSync(dbPath)) {
  console.error('Database file does not exist at path:', dbPath);
  throw new Error('Database file does not exist');
}

const db = new Database(dbPath, { verbose: console.log });

module.exports = db;
