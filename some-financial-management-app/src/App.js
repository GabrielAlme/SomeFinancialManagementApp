import React, { useState } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(null);

  if (!token) {
    return <Login setToken={setToken} />
  }

  return (
    <div className="App">
      <h1>SomeFinancialManagementApp</h1>
      <p>You're logged in</p>
    </div>
  );
}

export default App;
