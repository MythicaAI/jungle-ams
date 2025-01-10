// MythicaFlow.tsx
import React, { useRef, useMemo, useState } from 'react';
import { ReactFlow, MiniMap, Controls, Background, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useAwfulFlow from './hooks/useAwfulFlow';

import Sidebar from './components/Sidebar';
import AutomationNode from './components/nodes/AutomationNode';
import FileUploadNode from './components/nodes/FileUploadNode';
import FileViewerNode from './components/nodes/FileViewerNode';
import HDANode from './components/nodes/HDANode';
import { Button, Stack } from '@mui/joy';
import { Header } from './components/Header';
import { TabValues } from './enums';
import { FileEdge } from './components/edges/FileEdge';
import useCopyPaste from './hooks/useCopyPaste';

// Main Awful UI component
const AwfulUI: React.FC = () => {
  const [tab, setTab] = useState<string>(TabValues.EDIT);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { cut, copy, paste, bufferedNodes } = useCopyPaste();
  const {
    onConnect,
    onDisconnect,
    onManualNodesDelete,
    onNodesChange,
    onDrop,
    onDragOver,
    nodes,
    edges,
    onEdgesChange,
    setRfInstance,
  } = useAwfulFlow();
  const canCopy = nodes.some(({ selected }) => selected);
  const canPaste = bufferedNodes.length > 0;

  const nodeTypes = useMemo(
    () => ({
      hdaWorker: HDANode,
      worker: AutomationNode,
      fileUpload: FileUploadNode,
      fileViewer: FileViewerNode,
    }),
    []
  );
  const edgeTypes = useMemo(
    () => ({
      fileEdge: FileEdge,
    }),
    []
  );

  return (
    <Stack>
      <Header tab={tab} setTab={setTab} />
      <div className="dndflow" data-joy-color-scheme="dark">
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onManualNodesDelete}
            onEdgesDelete={onDisconnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setRfInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode="Delete"
            fitView
            minZoom={0.1}
            maxZoom={1}
            colorMode="dark"
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap zoomable pannable />
            <Controls />
            <Background />
            <Panel position="top-left">
              <Button
                onClick={() => cut()}
                disabled={!canCopy}
                color="danger"
                sx={{ mr: '6px', py: '5px', minHeight: 'auto' }}
              >
                Cut
              </Button>
              <Button
                onClick={() => copy()}
                disabled={!canCopy}
                color="primary"
                sx={{ mr: '6px', py: '4px', minHeight: 'auto' }}
              >
                Copy
              </Button>
              <Button
                onClick={() => paste({ x: 0, y: 0 })}
                disabled={!canPaste}
                color="neutral"
                sx={{ py: '4px', minHeight: 'auto' }}
              >
                Paste
              </Button>
            </Panel>
          </ReactFlow>
        </div>
        <Sidebar tab={tab} />
      </div>
    </Stack>
  );
};

export default AwfulUI;
