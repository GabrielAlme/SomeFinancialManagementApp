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


    
}