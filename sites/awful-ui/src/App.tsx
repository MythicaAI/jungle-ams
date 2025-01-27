// App.tsx
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CssVarsProvider } from '@mui/joy';

import AutomationProvider from './providers/AutomationProvider';
import MythicaApiProvider from './providers/MythicaApiProvider';
import AwfulFlowProvider from './providers/AwfulFlowProvider';
import UndoRedoProvider from './providers/UndoRedoProvider';

import AwfulUI from './AwfulUI';
import { useTheme } from './styles/theme';
import RequireAuth from './components/RequireAuth';

const App: React.FC = () => {
  const { theme } = useTheme();
  return (
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
  );
};

export default App;
