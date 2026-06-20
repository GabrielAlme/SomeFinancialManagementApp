import React, { useState } from 'react';

function Signup({setToken, setShowSignup}) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useSTate('');
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
                <div className="input-group">
                    <label>Username:</label>
                    <input type="text" value={identifier} onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label>Email:</label>
                    <input type="text" value={identifier} onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <button type="submit">Signup</button>
            </form>

            <p onClick={() => setShowSignup(false)} className="toggle">
                Already have an account? Login
            </p>
        </div>
    );
}

export default Signup;