import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import { CookiesProvider } from 'react-cookie';
import App from './App';

const Root = () => (
  <Router>
    <CssVarsProvider defaultMode="system" modeStorageKey="my-app-mode">
      <CookiesProvider>
        <CssBaseline />
        <App />
      </CookiesProvider>
    </CssVarsProvider>
  </Router>
);

export default Root;
