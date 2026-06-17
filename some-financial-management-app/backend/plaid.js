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