const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'financialManager.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username_encrypted TEXT NOT NULL,
        username_hash TEXT UNIQUE NOT NULL,
        email_encrypted TEXT NOT NULL,
        email_hash TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEAFAULT CURRENT_TIMESTAMP
    )
    `);