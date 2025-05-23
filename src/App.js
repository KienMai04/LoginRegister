import React, { useState } from 'react';
import LoginRegister from './components/LoginRegister';
import TodoApp from './components/TodoApp';

function App() {
  const [user, setUser] = useState(null);
  
  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {!user ? (
        <LoginRegister onSuccess={(userData) => setUser(userData)} />
      ) : (
        <TodoApp userId={user._id} onSignOut={handleSignOut} />
      )}
    </div>
  );
}

export default App;
