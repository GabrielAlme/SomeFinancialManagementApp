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

db.exec(`
    CREATE TABLE IF NOT EXISTS plaid_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        access_token TEXT NOT NULL, --encrypetd
        item_id TEXT NOT NULL, --encrypted
        institution_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plaid_token_id INTEGER NOT NULL, --encrypted
        account_name TEXT,
        account_type TEXT,
        balance_current REAL DEFAULT 0,
        last_updated DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plaid_token_id) REFERENCES plaid_tokens(id)
    )
`);

console.log('Database initialized');

module.exports = db;