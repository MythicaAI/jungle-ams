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
import RequireAuth from './components/utils/RequireAuth';

const App: React.FC = () => {
  const { theme } = useTheme();
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <ReactFlowProvider>
        <RequireAuth>
          <MythicaApiProvider>
            <AutomationProvider>
              <UndoRedoProvider>
                <AwfulFlowProvider>
                  <AwfulUI />
                </AwfulFlowProvider>
              </UndoRedoProvider>
            </AutomationProvider>
          </MythicaApiProvider>
        </RequireAuth>
      </ReactFlowProvider>
    </CssVarsProvider>
  );
};

export default App;
