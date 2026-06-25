const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const db = require('./database');
const { encrypt, decrypt } = require('./encryption');

const router = express.Router();

//Plaid client config
const config = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID_SECRET': process.env.PLAID_SECRET,
        },
    },
});

const plaidClient = new PlaidApi(config);

//Create plaid link token
router.post('/create-link-token', async (req, res) => {
    try {
        const { userId } = req.body

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
        const { publicToken, userId } = req.body;

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
        const { userId } = req.params

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

router.get('/banks/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const banks = db.prepare(
            'SELECT id, institution_name, created_at FROM plaid_tokens WHERE user_id = ?'
        ).all(userId);

        res.json({ banks });
    } catch (error) {
        console.error('Banks error:', error);
        res.status(500).json({ error: 'Could not fetch banks' });
    }
});

module.exports = router;