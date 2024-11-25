// providers/NodeDataProvider.tsx
import React, { useState, useCallback } from 'react';
import type { FlowDataType, ConnectionMap } from '../types/AwfulFlow';
import { AwfulFlowContext } from '../hooks/useAwfulFlow';
import { useReactFlow, useNodesState, Node, Connection, Edge, addEdge, useEdgesState } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import useAutomation from '../hooks/useAutomation';
import { GetFileResponse } from '../types/MythicaApi';


const AwfulFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flowData, setFlowDataState] = useState<FlowDataType>({});
  const [connections, setConnections] = useState<ConnectionMap>({});
  const [nodeType, setNodeType] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const {screenToFlowPosition} = useReactFlow();
  const { allAutomations } = useAutomation();
  
  const getId = () => `awful_node_${uuidv4()}`;

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    doDragOver(event);
  };

  const doDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    doDrop(event);
  }
  
  const doDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

          
      let newNode: Node;
      switch (nodeType) {
        case 'fileViewer':
        case 'fileUpload':
          newNode = {
            id: getId(),
            type: nodeType,
            position,
            data: {},
          };
          break;
        default:
          // Handle other types (e.g., generic worker)
          newNode = {
            id: getId(),
            type: 'worker',
            position,
            data: allAutomations[nodeType],
          };
      }
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, nodeType, setNodes, allAutomations]
  );



  const setFlowData = useCallback((nodeId: string, key: string, value: unknown) => {
    setFlowDataState((prevData) => ({
      ...prevData,
      [nodeId]: { ...prevData[nodeId], [key]: value },
    }));
  }, []);

  const addConnection = useCallback((sourceId: string, sourceHandle: string, targetId: string, targetHandle: string) => {
    setConnections((prev) => ({
      ...prev,
      [sourceId]: {
        ...(prev[sourceId] || {}),
        [sourceHandle]: [
          ...(prev[sourceId]?.[sourceHandle] || []),
          { targetId, targetHandle },
        ],
      },
    }));
  }, []);
  const removeConnection = useCallback(
    (sourceId: string, sourceHandle: string, targetId: string, targetHandle: string) => {
      setConnections((prev) => {
        const updatedSourceHandle = prev[sourceId]?.[sourceHandle]?.filter(
          (conn) => conn.targetId !== targetId || conn.targetHandle !== targetHandle
        );
  
        // Update connections for sourceHandle or remove it if empty
        const updatedSource = {
          ...prev[sourceId],
          [sourceHandle]: updatedSourceHandle?.length ? updatedSourceHandle : undefined,
        };
  
        // Remove the sourceId if it has no valid handles left
        const updatedConnections = {
          ...prev,
          [sourceId]: Object.keys(updatedSource).length ? updatedSource : undefined,
        };
  
        // Clean up undefined keys
        return Object.fromEntries(
          Object.entries(updatedConnections).filter(([, value]) => value !== undefined)
        ) as ConnectionMap;
      });
    },
    []
  );
  
  const notifyTargets = useCallback(
    (sourceId: string, sourceHandle: string, value: (GetFileResponse | null)[]) => {
      const handleConnections = connections[sourceId]?.[sourceHandle];
      if (handleConnections) {
        handleConnections.forEach(({ targetId, targetHandle }) => {
          setFlowData(targetId, targetHandle, value);
        });
      }
    },
    [connections, setFlowData]
  );
  

  // Handle data passing on connect
  const onConnect = useCallback(
    (connection: Edge | Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) return;
  
      setEdges((eds) => {
        // Check if the edge already exists
        const edgeExists = eds.some(
          (edge) =>
            edge.source === connection.source &&
            edge.sourceHandle === connection.sourceHandle &&
            edge.target === connection.target &&
            edge.targetHandle === connection.targetHandle
        );
  
        if (!edgeExists) {
          // Add the new edge if it doesn't already exist
          return addEdge(
            {
              ...connection,
              data: { fileIndex: connection.sourceHandle?.split('-')[1] || 0 },
            },
            eds
          );
        }
  
        // Return the original edges if the edge already exists
        return eds;
      });
  
      const connectedData = flowData[connection.source]?.[connection.sourceHandle];
  
      if (connection.source && connection.target && connection.sourceHandle && connection.targetHandle) {
        addConnection(connection.source, connection.sourceHandle, connection.target, connection.targetHandle);
        notifyTargets(connection.source, connection.sourceHandle, flowData[connection.source]?.[connection.sourceHandle] as (GetFileResponse|null)[]); // Notify targets with the specific source handle
        if (connectedData) {
          setFlowData(connection.target, connection.targetHandle, connectedData);
        }
      }
    },
    [setEdges, flowData, addConnection, notifyTargets, setFlowData]
  );
  

  
  
  // Handle disconnection by removing stored connection
  const onDisconnect = useCallback(
    (edgesToRemove: Edge[]) => {
      setEdges((eds) => eds.filter((e) => !edgesToRemove.some((er) => er.id === e.id)));
      edgesToRemove.forEach((edge) => {
        if (edge.sourceHandle && edge.targetHandle) {
          removeConnection(edge.source, edge.sourceHandle, edge.target, edge.targetHandle);
        }
      });
    },
    [setEdges, removeConnection]
  );

  return (
    <AwfulFlowContext.Provider value={{ 
      flowData, 
      setFlowData, 
      onConnect, 
      onDisconnect, 
      notifyTargets, 
      nodes,
      edges, 
      onEdgesChange,
      onNodesChange,
      setNodeType,
      onDragOver, 
      onDrop, 
      }}>
      {children}
    </AwfulFlowContext.Provider>
  );
};

export default AwfulFlowProvider;