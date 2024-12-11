import { GetFileResponse } from "./MythicaApi";

// types/nodeData.ts
export type FlowDataType = {
  [nodeId: string]: {
    [key: string]: GetFileResponse[];
  };
};

export type Connection = {
  targetId: string;
  targetHandle: string;
};

export type ConnectionMap = {
  [sourceId: string]: {
    [sourceHandle: string]: Connection[];
  };
};

export enum NodeState {
    Clean = 'clean',
    Running = 'running',
    Executed = 'executed',
    Done='done',
    Error = 'error'
}

