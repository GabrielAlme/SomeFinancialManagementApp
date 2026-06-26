import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import API_URL from '../../config';

function BanksPanel ({ token }) {
    const [linkToken, setLinkToken] = useState(null);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchBanks = async () => {
        try  {
            const response = await fetch(`${API_URL}/plaid/banks/0`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setBanks(data.banks || []);
        } catch (err) { 
            setError('Could not fetch banks');            
        }
    };

    useEffect(() => {
        fetchBanks();

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
                await fetchBanks();
            }
        } catch (err) {
            setError('Could not link bank');
        }
        setLoading(false);
    }, [token]);

    const {open, ready} = usePlaidLink({
        token: linkToken,
        onSuccess,
    });

    return(
        <div className="accounts-list">
            {error && <p className="error">{error}</p>}

            <div className="accounts-list">
                {accounts.length === 0 ? ( <p className="no-accounts">No accounts linked yet</p> ) : (
                    accounts.map((account, index) => (
                        <div key={index} className="account-item">
                    ))
                )}
            </div>
        </div>
    )
}