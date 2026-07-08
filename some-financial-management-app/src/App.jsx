import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Workspace from './components/Workspace'
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showSignup, setShowSignup] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;

    //decode to check expiration of token
    const checkExpiry = () => {
      if (Date.now() >= expiresAt) {
        localStorage.removeItem('token');
        setToken(null);
        setSessionExpired(true);
      }
    };

    checkExpiry();

    window.addEventListener('focus', checkExpiry);

    //Auto logout when time expires
    const timeLeft = expiresAt - Date.now();
    const timeout = setTimeout(checkExpiry, timeLeft);

    return () => {
      window.removeEventListener('focus', checkExpiry);
      clearTimeout(timeout);
    };
  }, [token]);

  if (!token) {
    if (showSignup) {
      return <Signup setToken={setToken} setShowSignup={setShowSignup} />;
    }
    return(
      <>
        {sessionExpired && <p className="session-message">your session has expired</p>}
        <Login setToken={setToken} setShowSignup={setShowSignup} />
      </> 
    );
  }

  return <Workspace token={token} setToken={setToken} />
}

export default App;
