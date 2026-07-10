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
}