// NodeDataContext.tsx
import  { Dispatch, SetStateAction, useContext } from 'react';
import { createContext } from 'react';
import { FlowDataType } from '../types/AwfulFlow';
import { Node, Edge, Connection, EdgeChange, NodeChange, ReactFlowInstance, ResizeControlProps } from '@xyflow/react';
import { GetFileResponse } from '../types/MythicaApi';

type AwfulFlowContextType = {
  NodeResizer: React.FC<ResizeControlProps>;
  nodes: Node[];
  edges: Edge[];
  onEdgesChange: (edges: EdgeChange<Edge>[]) => void;
  onNodesChange: (nodes: NodeChange<Node>[]) => void;
  flowData: FlowDataType;
  setFlowData: (nodeId: string, key: string, value: unknown) => void;
  setNodeType: Dispatch<SetStateAction<string | null>>;
  onConnect: (connection: Edge | Connection) => void;
  onDisconnect: (connections: Edge[]) => void;
  notifyTargets: (sourceId: string, sourceHandle: string, value: (GetFileResponse|null)[]) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onSave: (filename: string) => void;
  onRestore: (filename: string) => void;
  savedAwfulsById: Record<string, GetFileResponse>;
  savedAwfulsByName: Record<string, GetFileResponse>;
  setRfInstance: Dispatch<SetStateAction<ReactFlowInstance<Node, Edge>>>;
};

// Main context for Node Data and Connections
export const AwfulFlowContext = createContext<AwfulFlowContextType | null>(null);

const useAwfulFlow = () => {
  const context = useContext(AwfulFlowContext);
  if (!context) throw new Error('useNodes must be used within a NodesProvider');
  return   context;
};

export default useAwfulFlow;
