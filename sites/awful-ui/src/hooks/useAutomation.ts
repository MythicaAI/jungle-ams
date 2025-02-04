// src/context/AutomationContext.tsx
import { useContext } from 'react';
import { AutomationTask, dictionary, ExecutionData, WorkerAutomations, AutomationSpec, AutomationScript } from '../types/Automation';
import { createContext } from 'react';

type AutomationContextType = {
    workers: string[];
    automations: WorkerAutomations;
    allAutomations: { [uri: string]: AutomationTask };
    loadAutomations: () => Promise<void>;
    initAutomation: (task: AutomationTask) => ExecutionData;
    runAutomation: (worker: string, nodeId: string, path: string, inputs: dictionary, responseCallback:React.Dispatch<React.SetStateAction<ExecutionData>>) => Promise<void>;
    parseAutomation: (worker: string, workerSpecs:{[path:string]:AutomationSpec}) => AutomationTask[];
    savedAutomationsById: {[id:string]: AutomationScript};
    savedAutomationsByWorker: {[worker:string]: AutomationScript[]};
    saveAutomation: (automation: AutomationScript, savedAutomation: (saved: AutomationScript)=>void) => void;
    deleteAutomation: (automation: AutomationScript) => void;
    newAutomation: (worker: string, name: string, script: string) => AutomationScript;
  
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