// App.tsx
import React from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import AutomationProvider from './providers/AutomationProvider';
import MythicaApiProvider from './providers/MythicaApiProvider';
import AwfulFlowProvider from './providers/AwfulFlowProvider';
import AwfulUI from './AwfulUI';


const App: React.FC = () => (
  <ReactFlowProvider>
    <MythicaApiProvider>
      <AutomationProvider>
        <AwfulFlowProvider>
          <AwfulUI />
        </AwfulFlowProvider>
      </AutomationProvider>
    </MythicaApiProvider>
  </ReactFlowProvider>
);

export default App;
