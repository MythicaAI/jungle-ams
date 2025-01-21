// MythicaFlow.tsx
import React, { useRef, useMemo, useState } from 'react';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useAwfulFlow from './hooks/useAwfulFlow';

import Sidebar from './components/Sidebar';
import AutomationNode from './components/nodes/AutomationNode';
import FileUploadNode from './components/nodes/FileUploadNode';
import FileViewerNode from './components/nodes/FileViewerNode';
import HDANode from './components/nodes/HDANode';
import { Stack } from '@mui/joy';
import { Header } from './components/Header';
import { TabValues } from './enums';
import { FileEdge } from './components/edges/FileEdge';
import useCopyPaste from './hooks/useCopyPaste';
import useUndoRedo from './hooks/useUndoRedo';
import { UndoRedoPanel } from './components/UndoRedoPanel';
import { CopyPastePanel } from './components/CopyPastePanel';

// Main Awful UI component
const AwfulUI: React.FC = () => {
  const [tab, setTab] = useState<string>(TabValues.EDIT);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { cut, copy, paste, bufferedNodes } = useCopyPaste();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
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
            proOptions={{ account: 'paid-pro', hideAttribution: true }}
          >
            <MiniMap zoomable pannable />
            <Controls />
            <Background />
            <CopyPastePanel
              cut={cut}
              paste={paste}
              copy={copy}
              canCopy={canCopy}
              canPaste={canPaste}
            />
            <UndoRedoPanel
              canRedo={canRedo}
              canUndo={canUndo}
              redo={redo}
              undo={undo}
            />
          </ReactFlow>
        </div>
        <Sidebar tab={tab} />
      </div>
    </Stack>
  );
};

export default AwfulUI;
