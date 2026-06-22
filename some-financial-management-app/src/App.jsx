import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Workspace from './components/Workspace'
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [showSignup, setShowSignup] = useState(false);

  if (!token) {
    if (showSignup) {
      return <Signup setToken={setToken} setShowSignup={setShowSignup} />;
    }
    return <Login setToken={setToken} setShowSignup={setShowSignup} />;
  }

  return <Workspace token={token} setToken={setToken} />
}

export default App;
