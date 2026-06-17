const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const db = require('./database');
const { encrypt, decrypt } = require('./encryption');