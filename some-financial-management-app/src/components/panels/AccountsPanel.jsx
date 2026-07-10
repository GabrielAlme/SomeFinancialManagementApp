import React, { useState, useEffect } from "react";
import API_URL from '../../config';

function AccountsPanel({ token }) {
    const [accounts, setAccounts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAccounts = async () => {
        try {
            const response = await fetch(`${API_URL}/plaid/accounts/0`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setAccounts(data.accounts || []);
        } catch (err) {
            setError('Could not fetch accounts');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAccounts();
    }, [token]);

    const grouped = {};
    accounts.forEach(account => {
        if (!grouped[account.institution]) {
            grouped[account.institution] = [];
        }
        grouped[account.institution].push(account);
    });

    const totalbalance = accounts.reduce((sum, acc) => sum + (acc.balance_current || 0), 0);

    if(loading) return <p className="accounts-loading">Loading accounts...</p>;

    return (
        <div className="accounts-panel">
            {error && <p className="error">{error}</p>}

            {accounts.length === 0 ? (
                <p className="no-accounts">No accounts found</p>
            ) : (
                <>
                <div className="accounts-total">
                    <span className="accounts-total-label">Total Balance</span>
                    <span className="accounts-total-amount">${totalbalance.toFixed(2)}</span>
                </div>
                </>
            )}
        </div>
    )
}