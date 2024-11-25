import { JSONSchema } from './JSONSchema';
import { NodeState } from "./AwfulFlow";

export type AutomationTask = {
    uri: string;
    worker: string;
    path: string;
    spec: AutomationSpec;
};

export type AutomationSpec = {
    hidden: boolean;
    input: JSONSchema;
    output: JSONSchema;
}

export type WorkerAutomations = {
    [worker: string]: AutomationTask[];
};

export type dictionary = {
    [key: string]: unknown;
};

export type ExecutionData = {
    worker: string;
    path: string;
    state: NodeState;
    input: dictionary | null;
    output: dictionary | null;
};

export enum FileParamType {
    Scalar = 'scalar',
    Array = 'array',
}