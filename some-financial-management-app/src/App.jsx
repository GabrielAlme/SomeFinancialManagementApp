import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
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

  return (
    <div className="App">
      <h1>SomeFinancialManagementApp</h1>
      <p>You're logged in!</p>
    </div>
  );
}

export default App;
