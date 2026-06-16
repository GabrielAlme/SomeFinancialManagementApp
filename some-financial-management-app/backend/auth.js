const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./database');
const { encrypt, decrypt, hash } = require('./encryption');

const router = express.Router();

//signup route
router.post('/signup', async (req, res) => {
    try {
        const {username, email, password} = req.body;


        const existingUser = db.prepare(
            'SELECT id FROM users WHERE username_hash = ? OR email_hash'
        ).get(hash(username), hash(email));

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists'});
        }

        // Hash password, encrypt and hash username/email
        const hashedPassword = await bcrypt.hash(password, 10);
        const usernameEncrypted = encrypt(username);
        const usernameHash = hash(username);
        const emailEncrypted = encrypt(email);
        const emailHash = hash(email);

        // Inster user into database
        const result = db.prepare(
            'INSERT INTO users (username_encrypted, username_hash, email_encrypted, email_hash, password) VALUES (?, ?, ?, ?, ?)'
        ).run(usernameEncrypted, usernameHash, emailEncrypted, emailHash, hashedPassword);

        // Create JWT token
        const token = jwt.sign({ userId: result.lastInsertRowid }, process.env.JWT_SECRET, {
            expiresIn: '3h'
        });
        }
    }
})