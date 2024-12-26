// src/context/AutomationContext.tsx
import { useContext } from 'react';
import { AutomationTask, dictionary, ExecutionData, WorkerAutomations, AutomationSpec, AutomationSave } from '../types/Automation';
import { createContext } from 'react';
import { JSONSchema } from '../types/JSONSchema';

type AutomationContextType = {
    workers: string[];
    automations: WorkerAutomations;
    allAutomations: { [uri: string]: AutomationTask };
    loadAutomations: () => Promise<void>;
    initAutomation: (task: AutomationTask) => void;
    runAutomation: (worker: string, nodeId: string, path: string, inputs: dictionary, responseCallback:React.Dispatch<React.SetStateAction<ExecutionData>>) => Promise<void>;
    parseAutomation: (worker: string, workerSpecs:{[path:string]:AutomationSpec}) => AutomationTask[];
    savedAutomationsById: {[id:string]: AutomationSave};
    savedAutomationsByWorker: {[worker:string]: AutomationSave[]};
    saveAutomation: (automation: AutomationSave, savedAutomation: (saved: AutomationSave)=>void) => void;
    deleteAutomation: (automation: AutomationSave) => void;
    newAutomation: (worker: string, name: string, script: string, inputSpec: JSONSchema, outputSpec: JSONSchema) => AutomationSave;
  
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