import React, { useState } from 'react';
import useAuthStore from './authStore';

const LoginComponent: React.FC = () => {
  const { username, password, setUsername, setPassword, login, logout } = useAuthStore();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    login(username, password);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {username ? (
        <div>
          <h2>Welcome, {username}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
};

export default LoginComponent;