import { Edge } from "@xyflow/react";
import { GetFileResponse } from "./MythicaApi";

// types/nodeData.ts
export type FlowDataType = {
  [nodeId: string]: {
    [key: string]: GetFileResponse[];
  };
};

export type EdgeMap = {
  [sourceId: string]: {
    [sourceHandle: string]: Edge[];
  };
};

export enum NodeState {
    Clean = 'clean',
    Running = 'running',
    Executed = 'executed',
    Done='done',
    Error = 'error'
}

