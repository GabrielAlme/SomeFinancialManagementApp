import React, { useState, useEffect } from "react";
import API_URL from '../../config';

function MonthlyPaymentsPanel({ token }) {
    const [recurring, setRecurring] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchRecurring = async () => {
        try {
            const response = await fetch(`${API_URL}/plaid/recurring/0`, {
                headers: {
                    'Authorization': `Bearer ${token}` ,
                },
            });
            const data = await response.json();
            setRecurring(data.recurring || []);
        } catch (err) {
            setError('Could not fetch recurring transactions');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRecurring();
    }, [token]);
    
    const outflows = recurring.filter(r => r.type === 'outflow')
    const inflows = recurring.filter(r => r.type === 'inflow')
    const totalMonthlyOut = outflows.reduce((sum, r) => sum + Math.abs(r.amount), 0);
    const totalMonthlyIn = inflows.reduce((sum, r) => sum + Math.abs(r.amount), 0);

    if (loading) return <p className="monthly-loading">Loading monthly payments...</p>;

    return (
        <div className="monthly-panel">
            {error && <p className="error">{error}</p>}

            {recurring.length === 0 ? (
                <p className="no-monthly">No recurring payments detected yet</p>
            ) : (
                <>
                    <div className="monthly-summary">
                        <div className="monthly-summary-item">
                            <span className="monthly-summary-label">Monthly outgoing</span>
                            <span className="monthly-summary-amount negative">
                                -${totalMonthlyOut.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="monthly-summary-item">
                            <span className="monthly-summary-label">Monthly incoming</span>
                            <span className="monthly-summary-amount positive">
                                +${totalMonthlyIn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {outflows.length > 0 && (
                        <div className="monthly-section">
                            <div className="monthly-section-header">Bills & subscriptions</div>
                            {outflows.map(r => (
                                <div key={r.id} className="monthly-item">
                                    <div className="monthly-item-left">
                                        <span className="monthly-item-name">{r.name}</span>
                                        <span className="monthly-item-frequency">{r.frequency} · {r.category}</span>
                                    </div>
                                    <div className="monthly-item-right">
                                        <span className="monthly-item-amount negative">
                                            -${Math.abs(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="monthly-item-date">Last: {r.last_date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {inflows.length > 0 && (
                        <div className="monthly-section">
                            <div className="monthly-section-header">Recurring income</div>
                            {inflows.map(r => (
                                <div key={r.id} className="monthly-item">
                                    <div className="monthly-item-left">
                                        <span className="monthly-item-name">{r.name}</span>
                                        <span className="monthly-item-frequency">{r.frequency} · {r.category}</span>
                                    </div>
                                    <div className="monthly-item-right">
                                        <span className="monthly-item-amount positive">
                                            +${Math.abs(r.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="monthly-item-date">Last: {r.last_date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <button className="monthly-refresh" onClick={fetchRecurring}>
                Refresh
            </button>
        </div>
    );
}

export default MonthlyPaymentsPanel;

