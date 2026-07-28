import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import API_URL from '../../config';

function BanksPanel({ token, selectedBank, onSelectBank }) {
    const [linkToken, setLinkToken] = useState(null);
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchBanks = async () => {
        try {
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
                        'Authorization': `Bearer ${token}`,
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
            const response = await fetch(`${API_URL}/plaid/exchange-token`, {
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

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess,
    });

    return (
        <div className="banks-panel">
            {error && <p className="error">{error}</p>}
            <div className="banks-list">
                {banks.length === 0 ? (
                    <p className="no-banks">No banks linked</p>
                ) : (
                    banks.map((bank) => (
                        <div
                            key={bank.id}
                            className={`bank-item ${selectedBank === bank.institution_name ? 'bank-item-selected' : ''}`}
                            onClick={() => onSelectBank(
                                selectedBank === bank.institution_name ? null : bank.institution_name
                            )}
                        >
                            <span className="bank-item-name">{bank.institution_name}</span>
                        </div>
                    ))
                )}
            </div>
            <button className="add-bank-button" onClick={() => open()} disabled={!ready || loading}>
                {loading ? 'Connecting...' : '+ Add Bank'}
            </button>
        </div>
    );
}

export default BanksPanel;