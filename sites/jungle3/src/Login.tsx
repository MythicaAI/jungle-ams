import React, {useEffect, useState} from 'react';
import {useCookies} from "react-cookie";
import {SessionStartResponse} from "./types/apiTypes.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {getData} from "./services/backendCommon.ts";
import axios from "axios";

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [, setCookie] = useCookies(['profile_id', 'auth_token', 'refresh_token']);
  const {setAuthToken, setLoggedIn} = useGlobalStore();

  useEffect(() => {
    setUsername("32a05c1d-d2c6-47f2-9411-156c3619c71a")
  }, []);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // Handle login logic here
    console.log('Username:', username);
    console.log('Password:', password);

    setCookie('profile_id', username, { path: '/' })

    // 32a05c1d-d2c6-47f2-9411-156c3619c71a
    getData<SessionStartResponse>(`profiles/start_session/${username}`).then(r => {
      console.log(`auth: ${r.token}`)
      setAuthToken(r.token);
      setLoggedIn(true);
      setCookie('auth_token', r.token, { path: '/' })
      setCookie('refresh_token', '', { path: '/' })
      axios.defaults.headers.common['Authorization'] = `Bearer ${r.token}`;
    })
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log('Forgot password');
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Login</h2>
        <div style={styles.inputGroup}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Login</button>
        <button type="button" onClick={handleForgotPassword} style={styles.link}>Forgot Password?</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  inputGroup: {
    marginBottom: '15px',
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '3px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    borderRadius: '3px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    marginBottom: '10px',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

export default Login;