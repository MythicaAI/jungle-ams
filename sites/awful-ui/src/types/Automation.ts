import { JSONSchema } from './JSONSchema';
import { NodeState } from "./AwfulFlow";
import { GetFileResponse } from './MythicaApi';

export type ScriptAutomationTask = AutomationTask & {
    script: string
}

export type AutomationTask = {
    uri: string;
    worker: string;
    path: string;
    spec: AutomationSpec;
};

export type AutomationScript = {
    id: string;
    uri: string;
    worker: string;
    script: string;
    name: string;
    file?: GetFileResponse;
}

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
    output: dictionary | null;
};

export enum FileParamType {
    Scalar = 'scalar',
    Array = 'array',
}