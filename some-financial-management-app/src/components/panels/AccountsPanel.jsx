import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import API_URL from '../../config';

function AccountsPanel ({ token }) {
    const [linkToken, setLinkToken] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchAccounts = async () => {
        try  {
            const response = await fetch(`${API_URL}/plaid/accounts/0`)
        } catch {
            
        }
    }
}