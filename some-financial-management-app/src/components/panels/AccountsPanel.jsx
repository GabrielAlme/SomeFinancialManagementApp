import React, { useState, useEffect } from "react";
import API_URL from '../../config';

function AccountsPanel({ token, selectedBank, selectedAccount, onSelectAccount }) {
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

    const filtered = selectedBank
        ? accounts.filter(a => a.institution === selectedBank)
        : accounts;

    const grouped = {};
    filtered.forEach(account => {
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

            {selectedBank && (
                <div className="accounts-filter-tag">
                    Showing: {selectedBank}
                </div>
            )}

            {filtered.length === 0 ? (
                <p className="no-accounts">
                    {selectedBank ? `No accounts for ${selectedBank}` : 'No accounts found. Connect a bank first.'}
                </p>
            ) : (
                <>
                    <div className="accounts-total">
                        <span className="accounts-total-label">Total Balance</span>
                        <span className="accounts-total-amount">
                            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {Object.keys(grouped).map(institution => (
                        <div key={institution} className="accounts-group">
                            <div className="accounts-group-header">{institution}</div>
                            {grouped[institution].map((account, index) => (
                                <div
                                    key={index}
                                    className={`account-item ${selectedAccount === account.account_id ? 'account-item-selected' : ''}`}
                                    onClick={() => onSelectAccount(
                                        selectedAccount === account.account_id ? null : account.account_id
                                    )}
                                >
                                    <div className="account-item-left">
                                        <span className="account-item-name">{account.name}</span>
                                        <span className="account-item-type">{account.subtype}</span>
                                    </div>
                                    <div className="account-item-right">
                                        <span className="account-item-balance">
                                            ${account.balance_current?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        {account.balance_available !== null && (
                                            <span className="account-item-available">
                                                ${account.balance_available?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} available
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </>
            )}

            <button className="accounts-refresh" onClick={fetchAccounts}>
                Refresh
            </button>
        </div>
    );
}

export default AccountsPanel;