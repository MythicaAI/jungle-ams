import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CssVarsProvider } from '@mui/joy';

import AutomationProvider from './providers/AutomationProvider';
import MythicaApiProvider from './providers/MythicaApiProvider';
import AwfulFlowProvider from './providers/AwfulFlowProvider';
import UndoRedoProvider from './providers/UndoRedoProvider';
import { Auth0Provider } from '@auth0/auth0-react';

import AwfulUI from './AwfulUI';
import { useTheme } from './styles/theme';
import RequireAuth from './components/RequireAuth';

const App: React.FC = () => {
  const { theme } = useTheme();
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email',
      }}
    >
      <CssVarsProvider theme={theme} defaultMode="dark">
        <ReactFlowProvider>
          <MythicaApiProvider>
            <AutomationProvider>
              <UndoRedoProvider>
                <AwfulFlowProvider>
                  <RequireAuth>
                    <AwfulUI />
                  </RequireAuth>
                </AwfulFlowProvider>
              </UndoRedoProvider>
            </AutomationProvider>
          </MythicaApiProvider>
        </ReactFlowProvider>
      </CssVarsProvider>
    </Auth0Provider>
  );
};

export default App;
