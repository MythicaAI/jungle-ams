import React, { DragEvent } from 'react';

import useMythicaApi from '../hooks/useMythicaApi';
import useAutomation from '../hooks/useAutomation';
import useAwfulFlow from '../hooks/useAwfulFlow'

const Sidebar: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {setNodeType} = useAwfulFlow();
  const automationContext = useAutomation();
  const {apiKey, setApiKey: setApiKey} = useMythicaApi();

  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    setNodeType(nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className='sidebar'>
      <label htmlFor="apiKey">Api Key:</label>
      <input
        type="text"
        id="apiKey"
        placeholder="Enter API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      
      <div key="Files">
        <h3>Files</h3>
        <div
          className="dndnode"
          onDragStart={(event) => onDragStart(event, 'fileUpload')}
          draggable
        >
          File Upload
        </div>
        <div
          className="dndnode"
          onDragStart={(event) => onDragStart(event, 'fileViewer')}
          draggable
        >
          File Viewer
        </div>
        
      </div>


      {automationContext?.workers.map((worker) => (
        <div key={worker}>
          <h3>{worker}</h3>
          {automationContext?.automations[worker]?.map((automation) => {
            if (automation.spec.hidden) return null;
            const comp = <div
              key={automation.path}
              className="dndnode"
              onDragStart={(event) => onDragStart(event, automation.uri)}
              draggable
            >
              {automation.path}
            </div>

            return comp
          })}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;