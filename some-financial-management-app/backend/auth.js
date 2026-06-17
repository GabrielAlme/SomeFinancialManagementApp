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
            'SELECT id FROM users WHERE username_hash = ? OR email_hash = ?'
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

        res.status(201).json({ token, userId: result.lastInsertRowid});
    } catch (error) {
        console.error('Signup error', error);
        res.status(500).json({ error: 'Server error during signup'});
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Check username or email hash
        const identifierHash = hash(identifier);
        const user = db.prepare(
            'SELECT * FROM users WHERE username_hash = ? OR email_hash = ?'
        ).get(identifierHash, identifierHash);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials'});
        }

        // Compare password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials'});
        }

        // Create JWT token
        const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET, {
            expiresIn: '3hr'
        });

        res.json({ token, userId: user.id, username: decrypt(user.username_encrypted)})
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ error: 'Server error during login'});

    }
});

module.exports = router;