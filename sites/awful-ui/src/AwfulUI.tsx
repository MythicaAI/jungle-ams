// MythicaFlow.tsx
import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from '@xyflow/react';
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

const storageKey = 'awful-ui-layout';

// Main Awful UI component
const AwfulUI: React.FC = () => {
  const [tab, setTab] = useState<string>(TabValues.EDIT);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const {
    onConnect,
    onDisconnect,
    onNodesDelete,
    onNodesChange,
    onDrop,
    onDragOver,
    nodes,
    edges,
    onEdgesChange,
    rfInstance,
    setRfInstance,
    setEdges,
    setNodes,
    onNew,
  } = useAwfulFlow();
  const { setViewport } = useReactFlow();

  useEffect(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(storageKey, JSON.stringify(flow));
    }
  }, [rfInstance?.toObject()]);

  useEffect(() => {
    const storageData = localStorage.getItem(storageKey);
    if (!storageData) return;
    try {

      const flow = JSON.parse(storageData);

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    } catch (e) {
      console.error('Error loading flow from local storage:', e);
      onNew();
    }
    }, []);

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
            onNodesDelete={onNodesDelete}
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
            proOptions={{hideAttribution:true}}
          >
            <MiniMap zoomable pannable />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <Sidebar tab={tab} />
      </div>
    </Stack>
  );
};

export default AwfulUI;
