// providers/NodeDataProvider.tsx
import React, { useState, useCallback, useEffect } from 'react';
import type { FlowDataType, EdgeMap } from '../types/AwfulFlow';
import { AwfulFlowContext } from '../hooks/useAwfulFlow';
import {
  useReactFlow,
  useNodesState,
  Node,
  Connection,
  Edge,
  useEdgesState,
  ReactFlowInstance,
  NodeResizeControl,
  ResizeControlProps,
  EdgeChange,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import useMythicaApi from '../hooks/useMythicaApi';
import { GetFileResponse } from '../types/MythicaApi';
import useAutomation from '../hooks/useAutomation';
import useUndoRedoContext from '../hooks/useUndoRedo';

const AwfulFlowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flowData, setFlowDataState] = useState<FlowDataType>({});
  const [edgeMap, setEdgeMap] = useState<EdgeMap>({});
  const [nodeType, setNodeType] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChangeImpl] = useEdgesState<Edge>([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node, Edge>>();
  const { screenToFlowPosition, setViewport, deleteElements } = useReactFlow();

  const { uploadFile, getFiles, getDownloadInfo, deleteFile, authToken } =
    useMythicaApi();
  const [savedAwfulsById, setSavedAwfulsById] = useState<
    Record<string, GetFileResponse>
  >({});
  const [savedAwfulsByName, setSavedAwfulsByName] = useState<
    Record<string, GetFileResponse>
  >({});

  const { savedAutomationsById, allAutomations } = useAutomation();
  const { takeSnapshot } = useUndoRedoContext();

  const [refreshEdgeData, setRefreshEdgeData] = useState<Edge[]>([]);

  const getId = () => `awful_node_${uuidv4()}`;

  const NodeResizer = (props: ResizeControlProps) => {
    const controlStyle = {
      background: 'transparent',
      border: 'none',
    };
    function ResizeIcon() {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          strokeWidth="2"
          stroke="#666"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'absolute', right: 5, bottom: 5 }}
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <polyline points="16 20 20 20 20 16" />
          <line x1="14" y1="14" x2="20" y2="20" />
          <polyline points="8 4 4 4 4 8" />
          <line x1="4" y1="4" x2="10" y2="10" />
        </svg>
      );
    }
    return (
      <NodeResizeControl {...props} style={controlStyle}>
        <ResizeIcon />
      </NodeResizeControl>
    );
  };

  /***************************************************************************
   * Session Save Handling
   **************************************************************************/
  const storageKey = 'awful-ui-layout';

  // Save the current flow to local storage
  const onSaveSession = async () => {
    if (rfInstance && !refreshEdgeData.length) {
      const flow = rfInstance.toObject();
      const mythicaFlow = {
        flowData: flowData,
      };
      const saveState = {
        flow: flow,
        mythicaFlow: mythicaFlow,
      };
      localStorage.setItem(storageKey, JSON.stringify(saveState));
    }
  };

  // Restore from local storage
  const onRestoreSession = async () => {
    try {
      const savedState = JSON.parse(localStorage.getItem(storageKey) || '');
      if (!savedState) return;

      const { x = 0, y = 0, zoom = 1 } = savedState.flow.viewport || {};

      setNodes(savedState.flow.nodes);
      setFlowDataState(savedState.mythicaFlow.flowData || {});
      await setViewport({ x, y, zoom });
      setRefreshEdgeData(savedState.flow.edges);
    } catch (e) {
      console.error('Error loading flow from local storage:', e);
      onNew();
    }
  };

  const [isLoaded, setIsLoaded] = useState(false);
  // if first load of the app, load from session.
  useEffect(() => {
    if (!isLoaded && Object.keys(allAutomations).length > 0) {
      onRestoreSession().then(() => setIsLoaded(true));
    } else if (isLoaded && rfInstance) {
      onSaveSession();
    }
  }, [rfInstance?.toObject()]);


  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
    /* Because the Automation node handles are not updated immediately after 
  a refresh event, we need to wait a bit before updating the edges */

  useEffect(() => {
    if (refreshEdgeData.length > 0) {
      sleep(2000).then(() => {
        setEdges(refreshEdgeData);
        const edgeMapData: EdgeMap = {};

        refreshEdgeData.forEach((edge) => {
          if (!edgeMapData[edge.source]) edgeMapData[edge.source] = {};
          if (!edgeMapData[edge.source][edge.sourceHandle as string])
            edgeMapData[edge.source][edge.sourceHandle as string] = [];
          edgeMapData[edge.source][edge.sourceHandle as string].push(edge);
        });
        setEdgeMap(edgeMapData);
        setRefreshEdgeData([]);
      });
    }
  }, [refreshEdgeData, setEdges]);
  /***************************************************************************
   * End Session Save Handling
   **************************************************************************/

  /***************************************************************************
   * Awful Save Handling
   **************************************************************************/
  const onNew = async () => {
    if (rfInstance) {
      deleteFlowData();
    }
    console.log(`Awful Cleared Successfully`);
  };

  const onDelete = async (filename: string) => {
    try {
      const files = await getFiles();
      const file = files.find((f) => f.file_name === `${filename}.awful`);
      if (!file) {
        console.error(`File ${filename}.awful not found`);
        return;
      }

      await deleteFile(file.file_id);
      await fetchAwfuls();
      console.log(`File ${filename}.awful deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete file ${filename}.awful:`, error);
    }
  };

  // Save the current flow to the API
  const onSave = async (
    filename: string | null,
    savedFile: (saved: GetFileResponse) => void
  ) => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      const mythicaFlow = {
        flowData: flowData,
      };
      const saveState = {
        flow: flow,
        mythicaFlow: mythicaFlow,
      };
      const blob = new Blob([JSON.stringify(saveState)], {
        type: 'application/json',
      });
      const formData = new FormData();
      formData.append('files', blob, `${filename}.awful`);

      try {
        if (filename && savedAwfulsByName[filename]) {
          const file = savedAwfulsByName[filename];
          await deleteFile(file.file_id);
        }
        await uploadFile(formData);
        const { filesByNameMap } = await fetchAwfuls();
        savedFile(filesByNameMap[filename as string]);
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

      setRefreshEdgeData(savedState.flow.edges);
      setViewport({ x, y, zoom });
      console.log(`File ${filename}.awful restored successfully`);
    } catch (error) {
      console.error(`Failed to restore file ${filename}.awful:`, error);
    }
  };

  const deleteFlowData = async () => {
    setNodes([]);
    setEdges([]);
    setFlowDataState({});
    setEdgeMap({});
  };

  const fetchAwfuls = useCallback(async () => {
    const filesByIdMap = {} as Record<string, GetFileResponse>;
    const filesByNameMap = {} as Record<string, GetFileResponse>;
    if (authToken) {
      try {
        // Filter files with the .awful extension
        const files = (await getFiles())
          .filter((file) => file.file_name.endsWith('.awful'))
          .map((file) => {
            file.file_name = file.file_name.replace(/\.awful$/, '');
            return file;
          });

        files.forEach((file) => (filesByIdMap[file.file_id] = file));
        setSavedAwfulsById(filesByIdMap);
        files.forEach((file) => (filesByNameMap[file.file_name] = file));
        setSavedAwfulsByName(filesByNameMap);
      } catch (error) {
        console.error('Failed to fetch saved files:', error);
      }
    }
    return { filesByIdMap, filesByNameMap };
  }, [getFiles, setSavedAwfulsById, setSavedAwfulsByName, authToken]);

  // Fetch saved files when the component loads
  useEffect(() => {
    fetchAwfuls();
  }, [authToken, fetchAwfuls]);


  /***************************************************************************
   * End Awful Save Handling
   **************************************************************************/

  /***************************************************************************
   * Node Creation/Sidebar Drag Handling
   **************************************************************************/
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    doDragOver(event);
  };

  const doDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    doDrop(event);
  };

  const doDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!nodeType) return;
      takeSnapshot();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let newNode: Node;
      const nt = nodeType.split('?')[0];
      const saved = nodeType.split('?')[1] || null;
      const savedAuto = saved ? savedAutomationsById[saved] || null : null;

      if (saved && !savedAuto) {
        console.error(`Saved automation ${saved} not found`);
        return;
      }
      switch (nt) {
        case 'fileViewer':
        case 'assetViewer':
        case 'fileUpload':
          newNode = {
            id: getId(),
            type: nodeType,
            position,
            data: {},
            dragHandle: '.drag-panel',
          };
          break;
        case 'houdini://mythica/hda':
          newNode = {
            id: getId(),
            type: 'hdaWorker',
            position,
            data: {},
            dragHandle: '.drag-panel',
          };
          break;
        case 'saved':
          if (!savedAuto) break;
          newNode = {
            id: getId(),
            type: 'worker',
            position,
            data: {
              automation: `${savedAuto.worker}://mythica/script`,
              script: savedAuto,
            },
            dragHandle: '.drag-panel',
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
            },
            dragHandle: '.drag-panel',
          };
      }
      setNodes((nds) => nds.concat(newNode));
    },
    [nodeType, savedAutomationsById, screenToFlowPosition, setNodes]
  );

  /***************************************************************************
   * Node Creation/Sidebar Drag Handling
   **************************************************************************/

  /***************************************************************************
   * Edge and FlowData (output/input file) handling
   **************************************************************************/
  const setFlowData = useCallback(
    (nodeId: string, key: string, value: GetFileResponse[]) => {
      setFlowDataState((prevData) => ({
        ...prevData,
        [nodeId]: { 
          ...prevData[nodeId], 
          [key]: value 
        },
      }));
        
      const handleEdges = edgeMap[nodeId]?.[key];
      if (handleEdges) {
        handleEdges.forEach((edge: Edge) => {
          setFlowDataState((prevData) => ({
            ...prevData,
            [edge.target]: {
              ...prevData[edge.target],
              [edge.targetHandle as string]: value,
            },
          }));
        });
      }
    },
    [edgeMap]
  );

  const unsetFlowData = useCallback(
    (nodeId: string, key: string) => {
      // remove this key from the node's flowdata
      let removedFiles: GetFileResponse[];
      setFlowDataState((prevData) => {
        if (!prevData[nodeId]) return prevData;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [key]: removed, ...updatedNodeData } = prevData[nodeId];
        removedFiles = removed;
        return {
          ...prevData,
          [nodeId]: updatedNodeData,
        };
      });

      // clear flowdata for edge targets that were connected to this key
      const handleEdges = edgeMap[nodeId]?.[key];
      if (handleEdges) {
        handleEdges.forEach((edge: Edge) => {
          if (edge.source === nodeId) {

            setFlowDataState((prevData) => {
              const targetData = prevData[edge.target][edge.targetHandle as string];
              removedFiles.forEach((file) => {
                // remove one! instance of file from the target's flowdata
                // in case other sources added additional copies
                targetData.splice(targetData.indexOf(file), 1);
              });
              return {
                ...prevData,
                [edge.target]: {
                  ...prevData[edge.target],
                  [edge.targetHandle as string]: targetData
                }
              };
            });
          }
      });
      }

    },
    [edgeMap]
  );
  
  const onRemoveHandle = useCallback((nodeId: string, handleKey: string) => {
    // 1. Remove edges from the global edges state.
    setEdges((prevEdges) =>
      prevEdges.filter(
        (edge) =>
          // Remove if the source is this node and its sourceHandle matches
          !(edge.source === nodeId && edge.sourceHandle === handleKey) &&
          // Also remove if the target is this node and its targetHandle matches
          !(edge.target === nodeId && edge.targetHandle === handleKey)
      )
    );

    // 2. Remove the flowData for that handle.
    unsetFlowData(nodeId, handleKey);

    // 3. Update the edgeMap state by removing the handle's entry.
    setEdgeMap((prevEdgeMap) => {
      const updated = { ...prevEdgeMap };
      if (updated[nodeId]) {
        delete updated[nodeId][handleKey];
        // Clean up the node entry if no handles remain.
        if (Object.keys(updated[nodeId]).length === 0) {
          delete updated[nodeId];
        }
      }
      return updated;
    });
  }, [setEdges, unsetFlowData]);

  const clearFlowData = useCallback(
    (nodeId: string) => {
      let removedFiles: {[key: string] :GetFileResponse[]};
      setFlowDataState((prevData) => {
        const updatedData = { ...prevData };
        removedFiles = updatedData[nodeId] 
        delete updatedData[nodeId];
        return updatedData;
      });

      // clear flowdata for edge targets that were connected to this key
      if (nodeId in edgeMap) {
        const sourceHandles = edgeMap[nodeId];

        Object.keys(sourceHandles).forEach((sourceHandle) => {
          setFlowDataState((prevData) => {
            const updatedData = { ...prevData };
            sourceHandles[sourceHandle].forEach((edge) => {
              const target = updatedData[edge.target][edge.targetHandle as string];
              removedFiles[sourceHandle].forEach((file) => {
                target.splice( 
                  target.indexOf(file),
                  1
                );
              })
            })
            return updatedData;
          });
        })
      }
    },
    []
  );

  const getFlowData = useCallback(
    (nodeId: string) => {
      return flowData[nodeId] || {};
    },
    [flowData]
  );


  // Handle data passing on connect
  const onConnect = useCallback(
    (connection: Edge | Connection) => {
      if (!connection.sourceHandle || !connection.targetHandle) return;
      takeSnapshot();

      const edgeData =
        flowData[connection.source]?.[connection.sourceHandle] || [];
      const newEdge = {
        id: `edge_${connection.source}_${connection.sourceHandle}_${connection.target}_${connection.targetHandle}`,
        ...connection,
        type: 'fileEdge',
      } as Edge;


      setEdges((prevEdges) => [newEdge, ...prevEdges]);

      setEdgeMap((prevEdgeMap) => {
        if (!prevEdgeMap[newEdge.source])
          prevEdgeMap[newEdge.source] = {};
        if ((newEdge.sourceHandle as string in prevEdgeMap[newEdge.source])) 
          return prevEdgeMap;
        return {
          ...prevEdgeMap,
          [newEdge.source]: {
            ...prevEdgeMap[newEdge.source],
            [newEdge.sourceHandle as string]: [
              ...(prevEdgeMap[newEdge.source][newEdge.sourceHandle as string] || []),
              newEdge,
            ],
          },
        };
      });



      if (edgeData.length > 0) {
        setFlowDataState((prevData) => ({
          ...prevData,
          [connection.target]: {
            ...prevData[connection.target],
            [connection.targetHandle as string]: edgeData,
          },
        }));
      }
    },
    [setEdges, flowData]
  );

  // Handle disconnection by removing stored connection
  const onDisconnect = useCallback(
    (edgesToRemove: Edge[]) => {
      takeSnapshot();
      setEdges((eds) =>
        eds.filter((e) => !edgesToRemove.some((er) => er.id === e.id))
      );
      edgesToRemove.forEach((edge) => {
        if (edge.source && edge.sourceHandle) {
          if (edge.source in edgeMap) {
            if (Object.keys(edgeMap[edge.source]).length === 1 && edge.sourceHandle in edgeMap[edge.source]) {
              setEdgeMap((prevEdgeMap) => {
                const updated = { ...prevEdgeMap };
                delete updated[edge.source];
                return updated;
              });
            }else {
              setEdgeMap((prevEdgeMap) => ({
                ...prevEdgeMap,
                [edge.source]: {
                  ...prevEdgeMap[edge.source],
                  [edge.sourceHandle as string]: 
                    prevEdgeMap[edge.source][edge.sourceHandle as string].filter((e) => e.id !== edge.id)
                },
              }));
            }
          }
        }
      });
    },
    [setEdges, edgeMap]
  );

  const onNodesDelete = useCallback((nodesToDelete: Node[]) => {
    takeSnapshot();
    nodesToDelete.forEach(
      (node) => {
        setFlowDataState((prevData) => {
          const updatedData = { ...prevData };
          delete updatedData[node.id];
          return updatedData;
        });
        setEdges((prevEdges) =>
          prevEdges
            .filter((edge) => edge.source !== node.id)
            .filter((edge) => edge.target !== node.id)
        );
        setEdgeMap((prevEdges) => {
          const updatedEdges = { ...prevEdges };
          delete updatedEdges[node.id];
          return updatedEdges;
        });
      },
      [setFlowDataState, setEdgeMap]
    );
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    for (const edgeChange of changes) {
      if (edgeChange.type === 'remove') {
        const edge = edges.find((e) => e.id === edgeChange.id);
        if (edge) {
          edgeMap[edge.source][edge.sourceHandle as string] = edgeMap[edge.source][edge.sourceHandle as string].filter((e) => e.id !== edge.id);
        }
      }
    }
    onEdgesChangeImpl(changes);
  }, [onEdgesChangeImpl]);
  /***************************************************************************
   * Connection, Edge and FlowData (output/input file) handling
   **************************************************************************/

  return (
    <AwfulFlowContext.Provider
      value={{
        NodeResizer,
        getFlowData,
        setFlowData,
        unsetFlowData,
        clearFlowData,
        onConnect,
        onDisconnect,
        nodes,
        edges,
        onEdgesChange,
        onRemoveHandle,
        onNodesChange,
        onNodesDelete,
        setNodeType,
        onDragOver,
        onDrop,
        onSave,
        onRestore,
        onSaveSession,
        onRestoreSession,
        onDelete,
        setNodes,
        setEdges,
        onNew,
        savedAwfulsById,
        savedAwfulsByName,
        rfInstance,
        setRfInstance: setRfInstance as React.Dispatch<
          React.SetStateAction<ReactFlowInstance<Node, Edge>>
        >,
      }}
    >
      {children}
    </AwfulFlowContext.Provider>
  );
};

export default AwfulFlowProvider;
