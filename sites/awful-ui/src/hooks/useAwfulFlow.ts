// NodeDataContext.tsx
import { Dispatch, SetStateAction, useContext } from 'react';
import { createContext } from 'react';
import {
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
  ReactFlowInstance,
  ResizeControlProps,
} from '@xyflow/react';
import { GetFileResponse } from '../types/MythicaApi';

type AwfulFlowContextType = {
  NodeResizer: React.FC<ResizeControlProps>;
  nodes: Node[];
  edges: Edge[];
  onEdgesChange: (edges: EdgeChange<Edge>[]) => void;
  onRemoveHandle: (nodeId: string, handleId: string) => void;
  onNodesChange: (nodes: NodeChange<Node>[]) => void;
  onNodesDelete: (nodes: Node[]) => void;
  getFlowData: (nodeId: string) => { [key: string]: GetFileResponse[] };
  setFlowData: (nodeId: string, key: string, value: GetFileResponse[]) => void;
  setNodeType: Dispatch<SetStateAction<string | null>>;
  onConnect: (connection: Edge | Connection) => void;
  onDisconnect: (connections: Edge[]) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onSave: (
    filename: string,
    savedFileCallback: (saved: GetFileResponse) => void
  ) => Promise<void>;
  onRestore: (filename: string) => Promise<void>;
  onSaveSession: () => Promise<void>;
  onRestoreSession: () => Promise<void>;
  onDelete: (filename: string) => void;
  onNew: () => void;
  savedAwfulsById: Record<string, GetFileResponse>;
  savedAwfulsByName: Record<string, GetFileResponse>;
  rfInstance: ReactFlowInstance<Node, Edge> | undefined;
  setRfInstance: Dispatch<SetStateAction<ReactFlowInstance<Node, Edge>>>;
  setNodes: (value: React.SetStateAction<Node[]>) => void;
  setEdges: (value: React.SetStateAction<Edge[]>) => void;
};

// Main context for Node Data and Connections
export const AwfulFlowContext = createContext<AwfulFlowContextType | null>(
  null
);

const useAwfulFlow = () => {
  const context = useContext(AwfulFlowContext);
  if (!context) throw new Error('useNodes must be used within a NodesProvider');
  return context;
};

export default useAwfulFlow;
