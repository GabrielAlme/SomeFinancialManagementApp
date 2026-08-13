import React, { useState, useEffect } from "react";
import API_URL from '../../config';

function MonthlyPaymentsPanel({ token }) {
    const [recurring, setRecurring] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchRecurring = async () => {
        try {
            
        }
    }
}