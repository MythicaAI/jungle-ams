// src/context/AutomationContext.tsx
import { useContext } from 'react';
import { AutomationTask, dictionary, ExecutionData, WorkerAutomations, AutomationSpec } from '../types/Automation';
import { createContext } from 'react';

type AutomationContextType = {
    workers: string[];
    automations: WorkerAutomations;
    allAutomations: { [uri: string]: AutomationTask };
    getExecutionData: (workerId: string) => ExecutionData;
    getSaveData:() => { [workerId: string]: ExecutionData };
    restoreSaveData:(execData: { [workerId: string]: ExecutionData }) => void;
    loadAutomations: () => Promise<void>;
    runAutomation: (worker: string, nodeId: string, path: string, inputs: dictionary) => Promise<void>;
    parseAutomation: (worker: string, workerSpecs:{[path:string]:AutomationSpec}) => AutomationTask[];
};

// Context and provider definition
export const AutomationContext = createContext<AutomationContextType | null>(null);

const useAutomation = () => {
    const context = useContext(AutomationContext);
    if (!context) {
        throw new Error("useAutomation must be used within an AutomationProvider");
    }
    return context;
};

export default useAutomation;