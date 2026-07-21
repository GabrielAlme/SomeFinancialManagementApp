const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const db = require('./database');
const { encrypt, decrypt } = require('./encryption');

console.log('PLAID_ENV:', process.env.PLAID_ENV);
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID ? 'loaded' : 'MISSING');
console.log('PLAID_SECRET:', process.env.PLAID_SECRET ? 'loaded' : 'MISSING');

const router = express.Router();

//Plaid client config
const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Content-Type': 'application/json',
        },
    },
});

const plaidClient = new PlaidApi(config);

//Create plaid link token
router.post('/create-link-token', async (req, res) => {
    try {
        const userId = req.userId;
        console.log('userId:', userId);

        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: String(userId) },
            client_name: 'SomeFinancialManagementApp',
            products: ['transactions'],
            country_codes: ['US'],
            language: 'en',
        });

        res.json({ link_token: response.data.link_token });
    } catch (error) {
        console.error('Link token error', error.response?.data || error);
        res.status(500).json({ error: 'Could not create link token'});
    }
});


// Exchange public token for access token (after user connects their bank)
router.post('/exchange-token', async (req, res) => {
    try {
        const { publicToken } = req.body;
        const userId = req.userId;

        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Get financial institution name
        const item = await plaidClient.itemGet({ access_token: accessToken });
        const institution = await plaidClient.institutionsGetById({
            institution_id: item.data.item.institution_id,
            country_codes: ['US'],
        });
        const institutionName = institution.data.institution.name;

        //Store permanent encrypted tokens in db
        db.prepare(
            'INSERT INTO plaid_tokens (user_id, access_token, item_id, institution_name) VALUES (?, ?, ?, ?)'
        ).run(userId, encrypt(accessToken), encrypt(itemId), institutionName);

        res.json({ success: true, institution_name: institutionName });
    } catch (error) {
        console.error('Token exchange error:', error.response?.data || error)
        res.status(500).json({ error: 'Could not exhcange token' });
    }
});

//Get logged in accounts and balances
router.get('/accounts/:userId', async (req, res) => {
    try {
        const userId = req.userId;

        // Get plaid tokens for user
        const tokens = db.prepare(
            'SELECT * FROM plaid_tokens WHERE user_id = ?'
        ).all(userId);

        if (tokens.length === 0) {
            return res.json({ accounts: [] });
        }

        let allAccounts = [];

        for (const token of tokens) {
            const accessToken = decrypt(token.access_token);

            const response = await plaidClient.accountsBalanceGet({
                access_token: accessToken,
            });

            const accounts = response.data.accounts.map(account => ({
                name: account.name,
                type: account.type,
                subtype: account.subtype,
                balance_current: account.balances.current,
                balance_available: account.balances.available,
                institution: token.institution_name,
            }));

            allAccounts = [...allAccounts, ...accounts];
        }

        res.json({ accounts: allAccounts });

    } catch (error) {
        console.error('Token exchange error: ', error.response?.data || error);
        res.status(500).json({ error: 'Could not fetch accounts' });
    }
});

//Get banks for a user
router.get('/banks/:userId', async (req, res) => {
    try {
        const userId = req.userId;

        const banks = db.prepare(
            'SELECT id, institution_name, created_at FROM plaid_tokens WHERE user_id = ?'
        ).all(userId);

        res.json({ banks });
    } catch (error) {
        console.error('Banks error:', error);
        res.status(500).json({ error: 'Could not fetch banks' });
    }
});


//Get transactions for a user
router.get('/transactions/:userId', async (req, res) => {
    try {
        const userId = req.userId;

        const tokens = db.prepare(
            'SELECT * FROm plaid_tokens WHERE user_id = ?'
        ).all(userId);

        if (tokens.lenght === 0) {
            return res.json({ transactions: [] });
        }

        let allTransactions = [];

        //Get last 6 months of transactions
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - 180);

        const startDate = past.toISOString().split('T')[0];
        const endDate = now.toISOString().split('T')[0];

        for (const token of tokens) {
            const accessToken = decrypt(token.access_token);

            const response = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: startDate,
                end_date: endDate,
            });

            const transactions = response.data.transactions.map(t => ({
                id: t.transaction_id,
                name: t.name,
                amount: t.amount,
                date: t.date,
                category: t.category ? t.category[0] : 'Uncategorized',
                institution: token.institutionName,
            }));

            allTransactions = [...allTransactions, ...transactions];
        }

        //Sort by newest transaction first
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ transactions: allTransactions });
    } catch (error) {
        console.error('Transactions error:', error.response?.data || error);
        res.status(500).json({ error: 'Could not fetch transactions' });
    }
});
module.exports = router;