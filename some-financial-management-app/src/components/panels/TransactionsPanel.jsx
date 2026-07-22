import React, { useState, useEffect } from "react";
import API_URL from '../../config';

function TransactionsPanel ({ token }) {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const[filter, setFilter] = useState('');

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/plaid/transactions/0`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            const data = await response.json();
            setTransactions(data.transactions || []);
        }catch (err) {
            setError('Could not fetch transactions');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [token]);
    
    const filtered = transactions.filter(t => 
        t.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.category.toLowerCase().includes(filter.toLowerCase())
    );

    //Group by date
    const grouped = {};
    filtered.forEach(t => {
        if (!grouped[t.date]) {
            grouped[t.date] = [];
        }
        grouped[t.date].push(t);
    });

    if (loading) return <p className="transactions-loading">Loading transactions...</p>;

    return (
        <div className="transactions-panel">
            {error && <p className="error">{error}</p>}

            <div className="transactions-header">
                <input
                    className="transactions-search"
                    type="text"
                    placeholder="Search"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button className="transactions-refresh" onClick={fetchTransactions}>
                    Refresh
                </button>
            </div>

            {filtered.length === 0 ? (
                <p className="no-transactions">No transactions found</p>
            ) : (
                <div className="transaction-list">
                    {Object.keys(grouped).map(date => (
                        <div key={date} className="transactions-date-group">
                            <div className="transactions-date-header">
                                {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </div>
                            {grouped[date].map(t => (
                                <div key={t.id} className="transaction-item">
                                    <div className="transaction-item-left">
                                        <span className="transaction-item-name">{t.category}</span>
                                        <span className="transaction-item-category">{t.category}</span>
                                    </div>
                                    <div className="transaction-item-right">
                                        <span className={`transaction-item-amount ${t.amount < 0 ? 'positive' : 'negative'}`}>
                                            {t.amount < 0 ? '+' : '-'}${Math.abs(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </span>
                                        <span className="transaction-item-institution">{t.institution}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default TransactionsPanel;