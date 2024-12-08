// providers/NodeDataProvider.tsx
import React, { useState, useCallback, useEffect } from 'react';
import type { FlowDataType, ConnectionMap } from '../types/AwfulFlow';
import { AwfulFlowContext } from '../hooks/useAwfulFlow';
import { useReactFlow, useNodesState, Node, Connection, Edge, addEdge, useEdgesState, ReactFlowInstance } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import useMythicaApi from '../hooks/useMythicaApi';
import { GetFileResponse } from '../types/MythicaApi';


const AwfulFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flowData, setFlowDataState] = useState<FlowDataType>({});
  const [connections, setConnections] = useState<ConnectionMap>({});
  const [nodeType, setNodeType] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const {screenToFlowPosition} = useReactFlow();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge> | undefined>(undefined);
  const {setViewport,deleteElements} = useReactFlow();
  
  const {uploadFile, getFiles, getDownloadInfo, deleteFile, authToken} = useMythicaApi();
  const [savedAwfulsById, setSavedAwfulsById] = useState<Record<string, GetFileResponse>>({});
  const [savedAwfulsByName, setSavedAwfulsByName] = useState<Record<string, GetFileResponse>>({});
  
  const [refreshEdgeData, setRefreshEdgeData] = useState<Edge[]>([]);
  
  const getId = () => `awful_node_${uuidv4()}`;
  

  
  const fetchFiles = useCallback(
    async () => {
      if (!authToken) return;
      try {  
        // Filter files with the .awful extension
        const files = (await getFiles())
          .filter(file => file.file_name.endsWith('.awful'))
          .map(file => {
            file.file_name = file.file_name.replace(/\.awful$/,'')
            return file;
          });
        
        const filesByIdMap = {} as Record<string,GetFileResponse>
        files.forEach((file) => filesByIdMap[file.file_id] = file);
        setSavedAwfulsById(filesByIdMap);
        const filesByNameMap = {} as Record<string,GetFileResponse>
        files.forEach((file) => filesByNameMap[file.file_name] = file);
        setSavedAwfulsByName(filesByNameMap);
      } catch (error) {
        console.error('Failed to fetch saved files:', error);
      }
    }
  , [getFiles, setSavedAwfulsById, setSavedAwfulsByName, authToken]);

  // Fetch saved files when the component loads
  useEffect(() => {
    fetchFiles();
  }, [authToken, fetchFiles]);



  // Save the current flow to the API
  const onSave = async (filename: string | null) => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const mythicaFlow = {
        flowData: flowData,
        connections: connections,
      }
      const saveState = {
        flow: flow,
        mythicaFlow: mythicaFlow
      }
      const blob = new Blob([JSON.stringify(saveState)], { type: 'application/json' });
      const formData = new FormData();
      formData.append('files', blob, `${filename}.awful`);

      try {
        if (filename && savedAwfulsByName[filename]) {
          const file = savedAwfulsByName[filename];
          await deleteFile(file.file_id);
        }
        await uploadFile(formData);
        await fetchFiles();
        console.log(`File ${filename}.awful saved successfully`);
      } catch (error) {
        console.error(`Failed to save file ${filename}.awful:`, error);
      }
    }
  };

  // Restore a specific file from the API
  const onRestore = async (filename: string) => {
    try {
      deleteFlowData();
      await deleteElements({});
      const files = await getFiles();
      const file = files.find((f) => f.file_name === `${filename}.awful`);
      if (!file) {
        console.error(`File ${filename}.awful not found`);
        return;
      }

      const fileData = await getDownloadInfo(file.file_id);
      const response = await fetch(fileData.url); // Fetch the file content from the URL
      const savedState = await response.json(); // Assuming the file content is JSON


      const { x = 0, y = 0, zoom = 1 } = savedState.flow.viewport || {};
      setNodes(savedState.flow.nodes);
      setFlowDataState(savedState.mythicaFlow.flowData || {});

      setConnections(savedState.mythicaFlow.connections || {});

      setRefreshEdgeData(savedState.flow.edges);
      setViewport({ x, y, zoom });
      console.log(`File ${filename}.awful restored successfully`);
    } catch (error) {
      console.error(`Failed to restore file ${filename}.awful:`, error);
    }
  }
  
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const deleteFlowData = () => {
    setFlowDataState({});
    setConnections({});
  } 
  /* Because the Automation node handles are not updated immediately after 
  a refresh event, we need to wait a bit before updating the edges */
  useEffect(() => {
    if (refreshEdgeData.length > 0) {
      sleep(2000).then(() => {
        setEdges(refreshEdgeData);
        setRefreshEdgeData([]);
      });
    }
  }, [refreshEdgeData, setEdges]);

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
        case 'houdini://mythica/hda':
          newNode = {
            id: getId(),
            type: 'hdaWorker',
            position,
            data: {
              automation: nodeType,
            },
          };
          break;
        default:
          // Handle other types (e.g., generic worker)
          newNode = {
            id: getId(),
            type: 'worker',
            position,
            data: {
              automation: nodeType,
            }
          };
      }
      setNodes((nds) => nds.concat(newNode));
    },
    [nodeType, screenToFlowPosition, setNodes]
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
      onSave,
      onRestore,
      savedAwfulsById,
      savedAwfulsByName,
      setRfInstance: setRfInstance as React.Dispatch<React.SetStateAction<ReactFlowInstance<Node, Edge>>>
      }}>
      {children}
    </AwfulFlowContext.Provider>
  );
};

export default AwfulFlowProvider;