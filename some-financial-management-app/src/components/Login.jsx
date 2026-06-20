import React, { useState } from "react";

function Login({ setToken }) {
    const [isSignup, setIsSignup] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
    

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            localStorage.setItem('token', data.token);
            setToken(data.token);
        } catch (err){
            setError('Could not connect to server');

        }
    };

    return (
        <div className="login-container">
            <h1>Some Financial Manager</h1>

            {error && <p className="error">{error}</p>}

            <form onSubmit={handleSubmit}>
                
            </form>
        </div>
    )
}