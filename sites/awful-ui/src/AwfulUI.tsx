// MythicaFlow.tsx
import React, { useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useAwfulFlow from './hooks/useAwfulFlow';

import Sidebar from './components/Sidebar';
import AutomationNode from './components/AutomationNode';
import FileUploadNode from './components/FileUploadNode';
import FileViewerNode from './components/FileViewerNode';


// Main Awful UI component
const AwfulUI: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { 
    onConnect, onDisconnect,
    onNodesChange, 
    onDrop, 
    onDragOver, 
    nodes, 
    edges, 
    onEdgesChange,
    setRfInstance
  } = useAwfulFlow();


  const nodeTypes = useMemo(
    () => ({
      worker: AutomationNode,
      fileUpload: FileUploadNode,
      fileViewer: FileViewerNode,
    }),
    []
  );

  return (
    <div className="dndflow">
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onDisconnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setRfInstance}
          nodeTypes={nodeTypes}
          deleteKeyCode="Delete"
          fitView
        >
          <MiniMap zoomable pannable />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default AwfulUI;
