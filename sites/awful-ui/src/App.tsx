// App.tsx
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { CssVarsProvider } from '@mui/joy';

import AutomationProvider from './providers/AutomationProvider';
import MythicaApiProvider from './providers/MythicaApiProvider';
import AwfulFlowProvider from './providers/AwfulFlowProvider';

import AwfulUI from './AwfulUI';
import { useTheme } from './styles/theme';
import { UndoRedoProvider } from './providers/UndoRedoProvider';

const App: React.FC = () => {
  const { theme } = useTheme();
  return (
    <CssVarsProvider theme={theme} defaultMode="dark">
      <ReactFlowProvider>
        <MythicaApiProvider>
          <AutomationProvider>
            <UndoRedoProvider>
              <AwfulFlowProvider>
                <AwfulUI />
              </AwfulFlowProvider>
            </UndoRedoProvider>
          </AutomationProvider>
        </MythicaApiProvider>
      </ReactFlowProvider>
    </CssVarsProvider>
  );
};

export default App;
