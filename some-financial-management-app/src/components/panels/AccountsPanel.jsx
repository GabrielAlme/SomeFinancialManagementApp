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
            const response = await fetch(`${API_URL}/plaid/accounts/0`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
        } catch (err) {
            setError('Could not fetch accounts');            
        }
    };

    useEffect(() => {
        fetchAccounts();

        const getLinkToken = async () => {
            try {
                const response = await fetch(`${API_URL}/plaid/create-link-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorizathon': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ userId: 0 }),
                });
                const data = await response.json();
                setLinkToken(data.link_token);
            } catch (err) {
                setError('Could not connect to Plaid');
            }
        };
        getLinkToken();
    }, [token]);

    const onSuccess = useCallback(async (publicToken) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/plaid/create-link-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ publicToken }),
            });
            const data = await response.json();
            if (data.success) {
                await fetchAccounts();
            }
        } catch (err) {
            setError('Could not link account');
        }
        setLoading(false);
    }, [token]);
}